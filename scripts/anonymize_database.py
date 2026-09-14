"""One-time and repeatable privacy migration for legacy SQLite rows."""
from privacy import anonymize_record, anonymized_role_label
from storage import fetch_issues_for_engine1, update_anonymized_issue


def anonymize_legacy_records(*, require_anymize: bool = True) -> int:
    updated = 0
    for row in fetch_issues_for_engine1():
        answers = row["payload"]
        if all(str(answers.get(field, "")).startswith("[") for field in ("name", "email", "company", "submitter_role")):
            continue
        privacy_result = anonymize_record(
            answers,
            {
                "person": str(answers.get("name") or ""),
                "email": str(answers.get("email") or ""),
                "company": str(answers.get("company") or ""),
                anonymized_role_label(str(answers.get("submitter_role") or "")): str(answers.get("submitter_role") or ""),
            },
            require_anymize=require_anymize,
        )
        safe_answers = privacy_result.anonymized_data
        safe_model_text = "\n".join(
            str(safe_answers.get(field) or "")
            for field in ("idea", "what_happens_today", "why_we_want_this")
        )
        update_anonymized_issue(row["issue_id"], safe_answers, safe_model_text)
        updated += 1
    return updated
