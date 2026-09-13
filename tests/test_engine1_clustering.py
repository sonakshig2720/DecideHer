import pytest

from engine1 import derive_issue_fields, run_engine1, validate_meaningful_submission
from schemas import IssueSubmission, OwnedSystem, UseCase


def test_engine1_groups_every_use_case_once():
    use_cases = [
        UseCase(id=1, department="Sales", description="Search customer history in the CRM", value_band="high", capability_type="retrieve or answer", data_object="customer"),
        UseCase(id=2, department="Service", description="Find customer records before service calls", value_band="high", capability_type="retrieve or answer", data_object="customer"),
        UseCase(id=3, department="Finance", description="Review invoice reports and payment records", value_band="medium", capability_type="summarise", data_object="financial"),
        UseCase(id=4, department="Finance", description="Match invoices with purchase order reports", value_band="medium", capability_type="extract or structure", data_object="financial"),
    ]
    systems = [OwnedSystem(name="Salesforce", capabilities=["CRM", "customer records"])]

    clusters = run_engine1(use_cases, systems)

    members = [member for cluster in clusters for member in cluster.member_use_cases]
    assert sorted(members) == [1, 2, 3, 4]
    assert len(members) == len(set(members))
    assert len(clusters) == 3
    assert next(cluster for cluster in clusters if cluster.capability_type == "retrieve or answer").member_use_cases == [1, 2]


def test_placeholder_submission_is_rejected():
    submission = IssueSubmission(
        name="Test",
        email="test@example.com",
        company="Example",
        department="Sales",
        what_happens_today="vdfbgf",
        why_we_want_this="mnjb fdfhbh vdfbgf",
    )

    with pytest.raises(ValueError, match="meaningful description"):
        validate_meaningful_submission(submission)


def test_derived_root_cause_does_not_copy_submitter_opinion():
    submission = IssueSubmission(
        name="Test",
        email="test@example.com",
        company="Example",
        department="Finance",
        what_happens_today="Analysts manually compare every invoice with purchase orders.",
        why_we_want_this="Match standard invoice lines automatically and show exceptions.",
        root_cause_stated="The technology",
    )

    assert derive_issue_fields(submission).root_cause_derived == "Process"
