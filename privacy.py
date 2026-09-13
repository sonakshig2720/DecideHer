"""Privacy boundary for all model calls, with Anymize and local fail-safe redaction."""
from dataclasses import dataclass, field
import json
import os
import re
import time

import httpx


@dataclass
class PrivacyResult:
    anonymized_text: str
    replacements: dict[str, str] = field(default_factory=dict)
    provider: str = "local"
    warning: str | None = None


@dataclass
class RecordPrivacyResult:
    anonymized_data: dict[str, object]
    provider: str
    warning: str | None = None


class AnonymizationError(RuntimeError):
    """Raised when strict anonymisation cannot be completed safely."""


def anonymized_role_label(role: str | None) -> str:
    """Preserve non-identifying authority semantics in the role placeholder."""
    value = (role or "").lower()
    if "own" in value:
        return "role_owner"
    if "manage" in value:
        return "role_manager"
    if "do the work" in value:
        return "role_worker"
    if "affected" in value:
        return "role_affected"
    return "role_observer"


ANYMIZE_BASE_URL = "https://app.anymize.ai/api"


def _anymize_text(text: str, api_key: str) -> str:
    """Use Anymize's asynchronous text-anonymisation API."""
    headers = {"Authorization": f"Bearer {api_key}"}
    with httpx.Client(base_url=ANYMIZE_BASE_URL, headers=headers, timeout=15) as client:
        response = client.post("/anonymize", json={"text": text, "language": "en"})
        response.raise_for_status()
        job_id = response.json()["job_id"]
        for _ in range(15):
            status_response = client.get(f"/status/{job_id}")
            status_response.raise_for_status()
            result = status_response.json()
            if result.get("status") == "completed":
                return result["anonymized_text_raw"]
            if result.get("status") in {"failed", "error"}:
                raise RuntimeError(result.get("message") or "Anymize job failed")
            time.sleep(0.4)
    raise TimeoutError("Anymize did not finish within the allowed time")


def _local_redact(text: str, direct_identifiers: dict[str, str] | None = None) -> PrivacyResult:
    replacements: dict[str, str] = {}
    anonymized = text

    identifiers = sorted((direct_identifiers or {}).items(), key=lambda item: len(item[1].strip()), reverse=True)
    for label, value in identifiers:
        clean_value = value.strip()
        if clean_value:
            token = f"[{label.upper()}]"
            replacements[token] = clean_value
            anonymized = re.sub(re.escape(clean_value), token, anonymized, flags=re.IGNORECASE)

    for index, email in enumerate(set(re.findall(r"[\w.+-]+@[\w-]+\.[\w.-]+", anonymized)), start=1):
        token = f"[EMAIL_{index}]"
        replacements[token] = email
        anonymized = anonymized.replace(email, token)
    for index, phone in enumerate(set(re.findall(r"(?<!\w)(?:\+?\d[\d .()/-]{7,}\d)(?!\w)", anonymized)), start=1):
        token = f"[PHONE_{index}]"
        replacements[token] = phone
        anonymized = anonymized.replace(phone, token)
    return PrivacyResult(anonymized_text=anonymized, replacements=replacements)


def anonymize_text(text: str, direct_identifiers: dict[str, str] | None = None) -> PrivacyResult:
    """Anonymise text remotely when configured, retaining local redaction as fallback."""
    local_result = _local_redact(text, direct_identifiers)
    api_key = os.getenv("ANYMIZE_API_KEY", "").strip()
    if api_key:
        try:
            return PrivacyResult(
                anonymized_text=_anymize_text(local_result.anonymized_text, api_key),
                replacements=local_result.replacements,
                provider="anymize",
            )
        except Exception as exc:
            return PrivacyResult(
                anonymized_text=local_result.anonymized_text,
                replacements=local_result.replacements,
                provider="local",
                warning=f"Anymize unavailable; local redaction used ({exc})",
            )
    return local_result


def anonymize_record(
    data: dict[str, object],
    direct_identifiers: dict[str, str],
    *,
    require_anymize: bool = True,
) -> RecordPrivacyResult:
    """Anonymise a complete form record while preserving its JSON structure."""
    identifiers = dict(direct_identifiers)
    role = str(data.get("submitter_role") or "").strip()
    if role:
        identifiers = {
            label: value
            for label, value in identifiers.items()
            if label.lower() != "role" and value != role
        }
        identifiers[anonymized_role_label(role)] = role
    serialized = json.dumps(data, ensure_ascii=False)
    if require_anymize:
        if not os.getenv("ANYMIZE_API_KEY", "").strip():
            raise AnonymizationError("ANYMIZE_API_KEY is required before personal data can be submitted.")
        result = anonymize_text(serialized, identifiers)
        if result.provider != "anymize":
            raise AnonymizationError(result.warning or "Anymize could not anonymise the submission.")
    else:
        result = _local_redact(serialized, identifiers)
    try:
        anonymized_data = json.loads(result.anonymized_text)
    except json.JSONDecodeError as exc:
        raise AnonymizationError("Anymize returned an invalid structured response; nothing was stored.") from exc
    return RecordPrivacyResult(
        anonymized_data=anonymized_data,
        provider=result.provider,
        warning=result.warning,
    )


def restore_text(text: str, replacements: dict[str, str]) -> str:
    for placeholder, original in replacements.items():
        text = text.replace(placeholder, original)
    return text
