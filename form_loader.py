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


def render_intake_form() -> dict[str, object] | None:
    values: dict[str, object] = {}
    with st.form("intake_form"):
        for field in load_form_fields():
            name, label, kind = field["field_name"], field["question"], field["input_type"]
            if field["required"] == "conditional" and label:
                label = f"{label} (only if applicable)"
            if kind in {"text", "free text"}:
                values[name] = st.text_area(label, key=f"form_{name}") if kind == "free text" else st.text_input(label, key=f"form_{name}")
            elif kind == "dropdown":
                values[name] = st.selectbox(label, [""] + options(field), key=f"form_{name}")
            elif kind == "multi-select":
                values[name] = st.multiselect(label, options(field), key=f"form_{name}")
            elif kind == "single select":
                values[name] = st.radio(label or "Confirm", options(field), key=f"form_{name}")
            elif kind == "generated text":
                st.caption("A summary will appear after the Gemini connection is added.")
        submitted = st.form_submit_button("Submit AI improvement idea", type="primary")
    if submitted:
        missing = []
        for field in load_form_fields():
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
