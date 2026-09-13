import pytest

from privacy import AnonymizationError, anonymize_record


def test_record_redaction_masks_direct_identifiers_without_remote_call():
    result = anonymize_record(
        {
            "name": "Alex Smith",
            "email": "alex@example.com",
            "company": "Example Ltd",
            "submitter_role": "I own it",
            "what_happens_today": "Alex Smith emails Example Ltd from alex@example.com",
        },
        {
            "person": "Alex Smith",
            "email": "alex@example.com",
            "company": "Example Ltd",
            "role": "I own it",
        },
        require_anymize=False,
    )

    assert result.anonymized_data["name"] == "[PERSON]"
    assert result.anonymized_data["email"] == "[EMAIL]"
    assert result.anonymized_data["company"] == "[COMPANY]"
    assert result.anonymized_data["submitter_role"] == "[ROLE_OWNER]"
    assert "Alex Smith" not in str(result.anonymized_data)


def test_strict_record_anonymization_requires_key(monkeypatch):
    monkeypatch.delenv("ANYMIZE_API_KEY", raising=False)
    with pytest.raises(AnonymizationError, match="ANYMIZE_API_KEY"):
        anonymize_record({"name": "Alex"}, {"person": "Alex"})
