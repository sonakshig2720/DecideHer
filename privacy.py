"""Privacy boundary for all future model calls.

Replace the placeholder implementation with Anymize only after credentials arrive.
"""
from dataclasses import dataclass, field
import re


@dataclass
class PrivacyResult:
    anonymized_text: str
    replacements: dict[str, str] = field(default_factory=dict)


def anonymize_text(text: str, direct_identifiers: dict[str, str] | None = None) -> PrivacyResult:
    """Redact supplied identifiers and common email/phone patterns before a model call.

    The replacement map stays only in process memory and is never written to Google Drive.
    This is a local safety layer; an external PII service can be added later if needed.
    """
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


def restore_text(text: str, replacements: dict[str, str]) -> str:
    for placeholder, original in replacements.items():
        text = text.replace(placeholder, original)
    return text
