"""Publish anonymized pipeline output for the bundled React dashboard."""
import json
from pathlib import Path
from typing import Any

DASHBOARD_DIRECTORY = Path(__file__).parent / "static" / "dashboard"
DASHBOARD_DATA_PATH = DASHBOARD_DIRECTORY / "dashboard.json"


def publish_dashboard(payload: dict[str, Any]) -> Path:
    DASHBOARD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    DASHBOARD_DATA_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return DASHBOARD_DATA_PATH
