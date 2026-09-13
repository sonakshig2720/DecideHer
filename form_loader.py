"""Loads and renders the intake form from the supplied form specification."""
import csv
from pathlib import Path
import streamlit as st

FORM_FIELDS_PATH = Path(__file__).parent / "data" / "form_fields.csv"


def load_form_fields() -> list[dict[str, str]]:
    with FORM_FIELDS_PATH.open(encoding="utf-8", newline="") as source:
        return list(csv.DictReader(source))


def options(field: dict[str, str]) -> list[str]:
    return [value.strip() for value in field["options"].split("|") if value.strip()]


def _render_field(field: dict[str, str], values: dict[str, object]) -> None:
    name, label, kind = field["field_name"], field["question"], field["input_type"]
    if kind == "free text" and label:
        label = f"{label} (max 200 characters)"
    if field["required"] == "yes" and label:
        label = f"{label} *"
    elif field["required"] == "conditional" and label:
        label = f"{label} (only if applicable)"

    placeholders = {
        "idea": "Example: Route incoming service requests to the right team",
        "what_happens_today": "Describe the current steps, handoffs and tools…",
        "why_we_want_this": "Describe the result you would like to achieve…",
    }
    if kind in {"text", "free text"}:
        if kind == "free text":
            values[name] = st.text_area(
                label,
                key=f"form_{name}",
                height=140,
                max_chars=200,
                placeholder=placeholders.get(name),
            )
        else:
            values[name] = st.text_input(label, key=f"form_{name}")
    elif kind == "dropdown":
        values[name] = st.selectbox(
            label, [""] + options(field), key=f"form_{name}",
        )
    elif kind == "multi-select":
        values[name] = st.multiselect(
            label, options(field), key=f"form_{name}",
        )
    elif kind == "single select":
        values[name] = st.radio(
            label or "Confirm", options(field), key=f"form_{name}", horizontal=True,
        )
    elif kind == "generated text":
        current = str(values.get("what_happens_today", "")).strip()
        future = str(values.get("why_we_want_this", "")).strip()
        values[name] = f"Current: {current} Future: {future}" if current or future else ""
        if values[name]:
            st.info(values[name])


def _render_section_fields(
    fields: list[dict[str, str]], values: dict[str, object], *, pair_compact: bool,
) -> None:
    index = 0
    compact_types = {"text", "dropdown"}
    while index < len(fields):
        field = fields[index]
        following = fields[index + 1] if index + 1 < len(fields) else None
        should_pair = (
            pair_compact
            and following is not None
            and field["input_type"] in compact_types
            and following["input_type"] in compact_types
        )
        if should_pair:
            left, right = st.columns(2, gap="large")
            with left:
                _render_field(field, values)
            with right:
                _render_field(following, values)
            index += 2
        else:
            _render_field(field, values)
            index += 1


def render_intake_form() -> dict[str, object] | None:
    fields = load_form_fields()
    submitter_fields = [field for field in fields if field["section"] == "submitter"]
    confirmation_field = next(
        field for field in fields if field["field_name"] == "summary_confirmed"
    )
    issue_fields = [
        field
        for field in fields
        if field["section"] == "issue" and field["field_name"] != "summary_confirmed"
    ]
    values: dict[str, object] = {}
    with st.form("intake_form", enter_to_submit=False):
        section_title, required_key = st.columns([4, 1], vertical_alignment="top")
        with section_title:
            st.markdown("### 1 · About you")
        with required_key:
            st.markdown(
                '<div class="required-key"><span>*</span> Required fields</div>',
                unsafe_allow_html=True,
            )
        _render_section_fields(submitter_fields, values, pair_compact=True)

        st.divider()
        st.markdown("### 2 · The improvement opportunity")
        st.caption("Describe the real workflow and evidence. Specific answers produce better clusters and decisions.")
        _render_section_fields(issue_fields, values, pair_compact=True)

        _render_field(confirmation_field, values)
        submitted = st.form_submit_button(
            "Submit securely and view dashboard", type="primary",
        )
    if submitted:
        missing = []
        for field in fields:
            value = values.get(field["field_name"])
            if field["required"] == "yes" and not value:
                missing.append(field["question"])
            if field["required"] == "conditional" and field["conditional_on"]:
                dependency, expected = (part.strip() for part in field["conditional_on"].split("=", maxsplit=1))
                if values.get(dependency) == expected and not value:
                    missing.append(field["question"])
        if missing:
            st.error("Please complete: " + ", ".join(missing))
            return None
        return values
    return None
