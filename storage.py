"""SQLite storage whose intake columns are defined by data/form_fields.csv."""
import csv
import json
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import NAMESPACE_URL, uuid4, uuid5

ROOT = Path(__file__).parent
DATABASE_PATH = ROOT / "decideher.db"
FORM_FIELDS_PATH = ROOT / "data" / "form_fields.csv"
DECISION_OUTPUT_FIELDS_PATH = ROOT / "data" / "decision_output_fields.csv"


def _issue_derived_fields() -> list[str]:
    supported = {
        "root_cause_derived", "capability_type", "data_object",
        "personal_data_flag", "volume_proxy", "reach_score",
    }
    with DECISION_OUTPUT_FIELDS_PATH.open(encoding="utf-8", newline="") as source:
        return [
            row["field_name"]
            for row in csv.DictReader(source)
            if row["sits_on"] == "issue" and row["field_name"] in supported
        ]


DERIVED_FIELDS = _issue_derived_fields()


def _form_definition() -> list[dict[str, str]]:
    with FORM_FIELDS_PATH.open(encoding="utf-8", newline="") as source:
        fields = list(csv.DictReader(source))
    for field in fields:
        if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", field["field_name"]):
            raise ValueError(f"Unsafe form field name: {field['field_name']}")
    return fields


FORM_DEFINITION = _form_definition()
FORM_FIELD_NAMES = [field["field_name"] for field in FORM_DEFINITION]
LIST_FIELDS = {
    field["field_name"] for field in FORM_DEFINITION if field["input_type"] == "multi-select"
}


def _issues_schema(table_name: str = "issues") -> str:
    form_columns = ",\n".join(f'"{name}" TEXT' for name in FORM_FIELD_NAMES)
    derived_columns = ",\n".join(f'"{name}" TEXT' for name in DERIVED_FIELDS)
    return f"""CREATE TABLE {table_name} (
        issue_id TEXT PRIMARY KEY,
        {form_columns},
        {derived_columns},
        model_text TEXT NOT NULL,
        pipeline_status TEXT NOT NULL,
        cluster_id TEXT,
        created_at TEXT NOT NULL
    )"""


def _encoded(field: str, value: Any) -> Any:
    return json.dumps(value or []) if field in LIST_FIELDS else value


def _insert_issue(
    connection: sqlite3.Connection,
    *,
    issue_id: str,
    answers: dict[str, Any],
    derived: dict[str, Any],
    model_text: str,
    pipeline_status: str,
    cluster_id: str | None,
    created_at: str,
    ignore_existing: bool = False,
) -> sqlite3.Cursor:
    columns = [
        "issue_id", *FORM_FIELD_NAMES, *DERIVED_FIELDS,
        "model_text", "pipeline_status", "cluster_id", "created_at",
    ]
    values = [
        issue_id,
        *[_encoded(field, answers.get(field)) for field in FORM_FIELD_NAMES],
        *[derived.get(field) for field in DERIVED_FIELDS],
        model_text,
        pipeline_status,
        cluster_id,
        created_at,
    ]
    action = "INSERT OR IGNORE" if ignore_existing else "INSERT"
    placeholders = ", ".join("?" for _ in columns)
    quoted_columns = ", ".join(f'"{column}"' for column in columns)
    return connection.execute(
        f"{action} INTO issues ({quoted_columns}) VALUES ({placeholders})",
        values,
    )


def _migrate_to_form_schema(connection: sqlite3.Connection) -> None:
    existing = {row[1] for row in connection.execute("PRAGMA table_info(issues)")}
    required_columns = set(FORM_FIELD_NAMES) | set(DERIVED_FIELDS)
    if not existing or required_columns.issubset(existing):
        return

    connection.execute("DROP VIEW IF EXISTS intake_responses")
    rows = connection.execute("SELECT * FROM issues").fetchall()
    connection.execute("ALTER TABLE issues RENAME TO issues_previous")
    connection.execute(_issues_schema())
    for row in rows:
        row_data = dict(row)
        legacy_payload = json.loads(row_data.get("payload_json") or "{}")
        legacy_derived = json.loads(row_data.get("derived_json") or "{}")
        answers = {
            field: row_data.get(field, legacy_payload.get(field)) for field in FORM_FIELD_NAMES
        }
        _insert_issue(
            connection,
            issue_id=row_data["issue_id"],
            answers=answers,
            derived={field: row_data.get(field, legacy_derived.get(field)) for field in DERIVED_FIELDS},
            model_text=row_data.get("model_text") or "",
            pipeline_status=row_data.get("pipeline_status") or "submitted",
            cluster_id=row_data.get("cluster_id"),
            created_at=row_data.get("created_at") or datetime.now(timezone.utc).isoformat(),
        )
    connection.execute("DROP TABLE issues_previous")


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    table_exists = connection.execute(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'issues'"
    ).fetchone()
    if table_exists:
        _migrate_to_form_schema(connection)
    else:
        connection.execute(_issues_schema())
    connection.execute(
        """CREATE TABLE IF NOT EXISTS clusters (
            cluster_id TEXT PRIMARY KEY,
            pipeline_status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            engine1_output_json TEXT NOT NULL,
            engine2_output_json TEXT
        )"""
    )
    connection.commit()
    return connection


def persist_submission(
    *,
    submitter: dict[str, str],
    issue: dict[str, Any],
    derived: dict[str, Any],
    model_text: str,
) -> tuple[str, str]:
    """Store every form answer as a direct issues-table column."""
    now = datetime.now(timezone.utc).isoformat()
    issue_id = str(uuid4())
    answers = {**issue, **submitter}
    with _connect() as connection:
        _insert_issue(
            connection,
            issue_id=issue_id,
            answers=answers,
            derived=derived,
            model_text=model_text,
            pipeline_status="submitted",
            cluster_id=None,
            created_at=now,
        )
    return issue_id, "SQLite database"


def persist_sample_submission(
    sample_key: str,
    *,
    submitter: dict[str, str],
    issue: dict[str, Any],
    derived: dict[str, Any],
    model_text: str,
) -> bool:
    """Insert or refresh one deterministic sample without creating duplicates."""
    now = datetime.now(timezone.utc).isoformat()
    issue_id = str(uuid5(NAMESPACE_URL, f"decideher:sample:issue:{sample_key}"))
    answers = {**issue, **submitter}
    with _connect() as connection:
        cursor = _insert_issue(
            connection,
            issue_id=issue_id,
            answers=answers,
            derived=derived,
            model_text=model_text,
            pipeline_status="submitted",
            cluster_id=None,
            created_at=now,
            ignore_existing=True,
        )
        if cursor.rowcount == 0:
            fields = [*FORM_FIELD_NAMES, *DERIVED_FIELDS, "model_text"]
            values = [
                *[_encoded(field, answers.get(field)) for field in FORM_FIELD_NAMES],
                *[derived.get(field) for field in DERIVED_FIELDS],
                model_text,
                issue_id,
            ]
            assignments = ", ".join(f'"{field}" = ?' for field in fields)
            connection.execute(
                f"UPDATE issues SET {assignments} WHERE issue_id = ?",
                values,
            )
    return cursor.rowcount == 1


def reset_database_records() -> None:
    """Clear pipeline data so the bundled 20-record seed can be recreated."""
    with _connect() as connection:
        connection.execute("DELETE FROM clusters")
        connection.execute("DELETE FROM issues")
        connection.execute("DROP TABLE IF EXISTS submitters")


def count_records() -> tuple[int, int]:
    with _connect() as connection:
        count = connection.execute("SELECT COUNT(*) FROM issues").fetchone()[0]
    return count, count


def _decoded_answers(row: sqlite3.Row) -> dict[str, Any]:
    answers = {}
    for field in FORM_FIELD_NAMES:
        value = row[field]
        if field in LIST_FIELDS:
            value = json.loads(value or "[]")
            if isinstance(value, str) and value.startswith("["):
                value = json.loads(value)
        answers[field] = value
    return answers


def fetch_issues_for_engine1() -> list[dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute("SELECT * FROM issues ORDER BY created_at").fetchall()
    return [
        {
            **dict(row),
            "payload": _decoded_answers(row),
            "derived": {field: row[field] for field in DERIVED_FIELDS},
        }
        for row in rows
    ]


def update_anonymized_issue(issue_id: str, answers: dict[str, Any], model_text: str) -> None:
    """Replace a legacy row's form answers only after anonymisation succeeds."""
    fields = [*FORM_FIELD_NAMES, "model_text"]
    values = [
        *[_encoded(field, answers.get(field)) for field in FORM_FIELD_NAMES],
        model_text,
        issue_id,
    ]
    assignments = ", ".join(f'"{field}" = ?' for field in fields)
    with _connect() as connection:
        cursor = connection.execute(
            f"UPDATE issues SET {assignments} WHERE issue_id = ?",
            values,
        )
        if cursor.rowcount == 0:
            raise ValueError(f"Issue not found: {issue_id}")


def replace_engine1_clusters(clusters: list[dict[str, Any]], assignments: dict[str, str]) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as connection:
        connection.execute("DELETE FROM clusters")
        for cluster in clusters:
            connection.execute(
                "INSERT INTO clusters VALUES (?, ?, ?, ?, ?)",
                (cluster["cluster_id"], "engine1_complete", now, json.dumps(cluster), None),
            )
        for issue_id, cluster_id in assignments.items():
            connection.execute(
                "UPDATE issues SET pipeline_status = 'clustered', cluster_id = ? WHERE issue_id = ?",
                (cluster_id, issue_id),
            )


def list_engine1_clusters() -> list[dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute(
            "SELECT engine1_output_json FROM clusters ORDER BY cluster_id"
        ).fetchall()
    return [json.loads(row["engine1_output_json"]) for row in rows]


def save_engine2_outputs(initiatives: list[dict[str, Any]]) -> None:
    """Persist the rule-derived final product output beside each Engine 1 cluster."""
    with _connect() as connection:
        for initiative in initiatives:
            connection.execute(
                "UPDATE clusters SET pipeline_status = ?, engine2_output_json = ? WHERE cluster_id = ?",
                ("engine2_complete", json.dumps(initiative), f"C{initiative['id']}"),
            )


def mark_issue_clustered(issue_id: str, cluster_id: str) -> None:
    with _connect() as connection:
        cursor = connection.execute(
            "UPDATE issues SET pipeline_status = 'clustered', cluster_id = ? WHERE issue_id = ?",
            (cluster_id, issue_id),
        )
        if cursor.rowcount == 0:
            raise ValueError(f"Issue not found: {issue_id}")
