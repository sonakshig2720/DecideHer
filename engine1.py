"""Engine 1: input validation, clustering, and owned-system matching."""
import json
from pathlib import Path
from schemas import DerivedIssueFields, Engine1Cluster, IssueSubmission, OwnedSystem, UseCase

DATA_DIR = Path(__file__).parent / "data"


def load_demo_input() -> tuple[list[UseCase], list[OwnedSystem]]:
    use_cases = [UseCase.model_validate(row) for row in json.loads((DATA_DIR / "demo_use_cases.json").read_text())]
    systems = [OwnedSystem.model_validate(row) for row in json.loads((DATA_DIR / "owned_systems.json").read_text())]
    return use_cases, systems


def load_fallback_clusters() -> list[Engine1Cluster]:
    rows = json.loads((DATA_DIR / "fallback_engine1.json").read_text())
    return [Engine1Cluster.model_validate(row) for row in rows]


def run_engine1(use_cases: list[UseCase], systems: list[OwnedSystem]) -> list[Engine1Cluster]:
    """Temporary deterministic fallback until embedding clustering is implemented."""
    if not use_cases:
        return []
    return load_fallback_clusters()


def derive_issue_fields(submission: IssueSubmission) -> DerivedIssueFields:
    """Rule fallback for the derived-field contract until Gemini is connected."""
    text = " ".join(filter(None, [submission.idea, submission.what_happens_today, submission.why_we_want_this])).lower()
    capability = "retrieve or answer" if any(word in text for word in ("find", "search", "information")) else "draft or generate"
    if any(word in text for word in ("approve", "route", "routing")):
        capability = "classify or route"
    data_object = "internal knowledge"
    if any("Customer" in item for item in submission.data_used):
        data_object = "customer"
    elif any("Employee" in item for item in submission.data_used):
        data_object = "employee"
    elif any("Invoice" in item or "Pricing" in item for item in submission.data_used):
        data_object = "financial"
    root_cause = "Process"
    if submission.root_cause_stated == "The data":
        root_cause = "Data"
    elif submission.root_cause_stated == "The technology":
        root_cause = "Technology"
    elif submission.root_cause_stated == "The people involved":
        root_cause = "People"
    concerns = set(submission.security_concern)
    personal_data = "yes" if concerns & {"Personal data of staff", "Personal data of customers"} else "unclear" if "Not sure" in concerns else "no"
    volume = "high" if submission.frequency in {"Several times a day", "Daily"} else "medium" if submission.frequency in {"Weekly", "Monthly"} else "low"
    return DerivedIssueFields(root_cause_derived=root_cause, capability_type=capability, data_object=data_object, personal_data_flag=personal_data, volume_proxy=volume)
