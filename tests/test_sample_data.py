import json
import sqlite3

import sample_data
import storage


def test_sample_seed_is_complete_and_idempotent(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "DATABASE_PATH", tmp_path / "samples.db")

    first_added, first_total = sample_data.seed_database()
    second_added, second_total = sample_data.seed_database()

    assert first_added == 20
    assert first_total == 20
    assert second_added == 0
    assert second_total == 20

    with sqlite3.connect(storage.DATABASE_PATH) as connection:
        columns = {row[1] for row in connection.execute("PRAGMA table_info(issues)")}
        assert set(storage.FORM_FIELD_NAMES).issubset(columns)
        for field in storage.FORM_FIELD_NAMES:
            missing = connection.execute(
                f'SELECT COUNT(*) FROM issues WHERE "{field}" IS NULL OR "{field}" = ?',
                ("",),
            ).fetchone()[0]
            assert missing == 0, field
        identity_rows = connection.execute(
            "SELECT name, email, company, submitter_role FROM issues"
        ).fetchall()
        assert all(
            all(str(value).startswith("[") for value in row)
            for row in identity_rows
        )


def test_samples_cover_problem_types_and_departments():
    records = json.loads(sample_data.SAMPLE_PATH.read_text())

    assert len(records) >= 20
    assert {record["root_cause_stated"] for record in records} == {
        "The people involved",
        "The process itself",
        "The technology",
        "The data",
    }
    assert len({record["department"] for record in records}) >= 8
    assert len({record["task_type"] for record in records}) >= 7
