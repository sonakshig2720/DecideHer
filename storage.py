"""Google Drive-backed shared storage for the engine pipeline.

The first app run creates a Google Sheet in the configured shared Drive folder.
Every engine reads and updates that same Sheet automatically.
"""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4


class StorageConfigurationError(RuntimeError):
    pass


SHEET_NAME = "DecideHer Pipeline"
SERVICE_ACCOUNT_PATH = Path(__file__).parent / ".secrets" / "google-service-account.json"
SHEETS = {
    "Submitters": ["submitter_id", "name", "email", "company", "department", "created_at"],
    "Issues": ["issue_id", "submitter_id", "department", "pipeline_status", "created_at", "payload_json", "derived_json", "model_text", "cluster_id"],
    "Clusters": ["cluster_id", "pipeline_status", "created_at", "engine1_output_json", "engine2_output_json"],
}


def _clients():
    folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
    if not folder_id or not SERVICE_ACCOUNT_PATH.exists():
        raise StorageConfigurationError(
            "Google Drive storage is not configured. Add GOOGLE_DRIVE_FOLDER_ID to .env "
            "and place the service-account JSON at .secrets/google-service-account.json."
        )
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
    import gspread

    credentials = Credentials.from_service_account_file(
        SERVICE_ACCOUNT_PATH,
        scopes=["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"],
    )
    return gspread.authorize(credentials), build("drive", "v3", credentials=credentials), folder_id


def _pipeline_sheet():
    gspread_client, drive, folder_id = _clients()
    query = (
        f"'{folder_id}' in parents and name = '{SHEET_NAME}' and "
        "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false"
    )
    matches = drive.files().list(q=query, fields="files(id)").execute().get("files", [])
    if matches:
        spreadsheet = gspread_client.open_by_key(matches[0]["id"])
    else:
        spreadsheet = gspread_client.create(SHEET_NAME)
        drive.files().update(fileId=spreadsheet.id, addParents=folder_id, fields="id, parents").execute()
    for title, headers in SHEETS.items():
        try:
            worksheet = spreadsheet.worksheet(title)
        except Exception:
            worksheet = spreadsheet.add_worksheet(title=title, rows=1000, cols=len(headers))
        if not worksheet.get_all_values():
            worksheet.append_row(headers)
    return spreadsheet


def save_submission(
    *,
    submitter: dict[str, str],
    issue: dict[str, Any],
    derived: dict[str, Any],
    model_text: str,
) -> str:
    """Save PII separately, then queue the submitted issue text for Engine 1."""
    spreadsheet = _pipeline_sheet()
    now = datetime.now(timezone.utc).isoformat()
    submitter_id, issue_id = str(uuid4()), str(uuid4())
    spreadsheet.worksheet("Submitters").append_row([
        submitter_id, submitter["name"], submitter["email"], submitter["company"], submitter["department"], now,
    ])
    spreadsheet.worksheet("Issues").append_row([
        issue_id, submitter_id, submitter["department"], "submitted", now,
        json.dumps(issue), json.dumps(derived), model_text, "",
    ])
    return issue_id


def fetch_issues_for_engine1() -> list[dict[str, Any]]:
    """Shared read for Engine 1; Engine 2 will consume clusters similarly."""
    rows = _pipeline_sheet().worksheet("Issues").get_all_records()
    return [
        {**row, "payload": json.loads(row.pop("payload_json")), "derived": json.loads(row.pop("derived_json"))}
        for row in rows if row["pipeline_status"] == "submitted"
    ]


def mark_issue_clustered(issue_id: str, cluster_id: str) -> None:
    worksheet = _pipeline_sheet().worksheet("Issues")
    issue_cells = worksheet.findall(issue_id)
    if not issue_cells:
        raise ValueError(f"Issue not found: {issue_id}")
    row = issue_cells[0].row
    headers = worksheet.row_values(1)
    worksheet.update_cell(row, headers.index("pipeline_status") + 1, "clustered")
    worksheet.update_cell(row, headers.index("cluster_id") + 1, cluster_id)
