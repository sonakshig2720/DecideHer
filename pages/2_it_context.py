"""Owned-system intake and inventory used by both decision engines."""
from __future__ import annotations

from html import escape
from typing import Any

import streamlit as st

from pipeline import cluster_database
from storage import (
    OWNED_SYSTEM_DEFINITION,
    list_owned_systems,
    next_owned_system_id,
    persist_owned_system,
)
from ui_navigation import TOP_NAVIGATION_CSS, navigation_html


def _options(field: dict[str, str]) -> list[str]:
    return [item.strip() for item in field["options"].split("|") if item.strip()]


def _clear_editor() -> None:
    st.session_state["owned_system_editor_id"] = None
    for field in OWNED_SYSTEM_DEFINITION:
        st.session_state.pop(f"owned_system_{field['field_name']}", None)


def _edit_system(system: dict[str, Any]) -> None:
    _clear_editor()
    st.session_state["owned_system_editor_id"] = system["system_id"]
    for field in OWNED_SYSTEM_DEFINITION:
        name = field["field_name"]
        if name != "system_id":
            st.session_state[f"owned_system_{name}"] = system.get(name, [])


def _apply_preset(name: str) -> None:
    presets = {
        "DATEV": {
            "system_name": "DATEV",
            "category": "Finance",
            "modules_licensed": "Accounting, payroll and document transfer",
            "capabilities_in_use": ["extract or structure", "transfer or sync", "summarise"],
            "capabilities_available": ["predict or score"],
            "data_objects_held": ["employee", "financial", "supplier"],
            "adoption": "Used by some teams",
            "departments_using": ["Finance", "HR", "Management"],
            "answer_confidence": "Fairly sure",
            "notes": "",
        },
        "Microsoft 365": {
            "system_name": "Microsoft 365 & SharePoint",
            "category": "Collaboration suite",
            "modules_licensed": "Microsoft 365 and SharePoint Online",
            "capabilities_in_use": ["draft or generate", "retrieve or answer", "summarise"],
            "capabilities_available": ["extract or structure", "classify or route"],
            "data_objects_held": ["employee", "internal knowledge"],
            "adoption": "Used by everyone who needs it",
            "departments_using": ["Sales", "Service", "Finance", "Operations", "HR", "IT"],
            "answer_confidence": "Certain",
            "notes": "",
        },
        "Custom App": {
            "system_name": "",
            "category": "Other",
            "modules_licensed": "Custom application",
            "capabilities_in_use": [],
            "capabilities_available": [],
            "data_objects_held": [],
            "adoption": "Used by some teams",
            "departments_using": [],
            "answer_confidence": "Fairly sure",
            "notes": "",
        },
    }
    _clear_editor()
    for field, value in presets[name].items():
        st.session_state[f"owned_system_{field}"] = value


systems = list_owned_systems()
system_count = len(systems)

st.html(
    f"""
    <style>
      {TOP_NAVIGATION_CSS}

      [data-testid="stHeader"], [data-testid="stToolbar"],
      [data-testid="stAppToolbar"], [data-testid="stElementToolbar"],
      [data-testid="stDecoration"], [data-testid="stStatusWidget"],
      #MainMenu, footer {{ display: none !important; }}

      [data-testid="stAppViewContainer"] {{ background: #FAF8F5; }}
      .stMainBlockContainer {{ width: 100% !important; max-width: none !important; padding: 0 0 4rem !important; }}
      [data-testid="stVerticalBlock"] {{ gap: 0 !important; }}

      .it-hero {{
        padding: 2rem max(2rem, calc((100vw - 1780px) / 2));
        border-bottom: 1px solid #E9E2DE;
        background: white;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }}
      .it-hero-top {{ display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }}
      .it-eyebrow-row {{ display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }}
      .it-eyebrow {{
        display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.35rem 0.75rem;
        border: 1px solid #FBE0E5; border-radius: 999px; color: #700E22; background: #FDF2F4;
        font-size: 0.72rem; font-weight: 850; letter-spacing: 0.06em; text-transform: uppercase;
      }}
      .it-eyebrow::before {{ content: ""; width: 0.48rem; height: 0.48rem; border-radius: 999px; background: #047857; }}
      .it-baseline {{ color: #78716C; font-size: 0.86rem; font-weight: 700; }}
      .it-hero h1 {{ margin: 0.65rem 0 0.3rem; color: #1C1917; font-size: clamp(2rem, 3.6vw, 3.1rem); line-height: 1.05; letter-spacing: -0.04em; }}
      .it-hero p {{ margin: 0; color: #57534E; font-size: 1rem; }}
      .it-jump-links {{ display: flex; align-items: center; gap: 0.55rem; flex: 0 0 auto; }}
      .it-jump-link {{
        display: inline-flex; padding: 0.55rem 0.9rem; border: 1px solid #E7E5E4; border-radius: 10px;
        color: #44403C !important; background: #F5F5F4; font-size: 0.8rem; font-weight: 800; text-decoration: none !important;
      }}
      .it-jump-link.active {{ border-color: #700E22; color: white !important; background: #700E22; }}

      .st-key-it_context_workspace {{
        width: min(1780px, calc(100vw - 4rem)); margin: 2rem auto 0; padding: 0 !important;
      }}
      .st-key-it_context_workspace [data-testid="stHorizontalBlock"] {{ gap: 1.6rem !important; align-items: flex-start; }}
      .st-key-system_registration, .st-key-system_inventory {{
        padding: 1.65rem !important; border: 1px solid #E3DEDB; border-radius: 18px;
        background: white; box-shadow: 0 8px 24px rgba(52, 7, 18, 0.05);
      }}
      .st-key-system_registration h2, .st-key-system_inventory h2 {{
        color: #1C1917 !important; font-size: 1.35rem !important; font-weight: 850 !important;
      }}
      .st-key-system_registration h3 {{ color: #700E22 !important; font-size: 1rem !important; }}
      .st-key-system_registration [data-testid="stForm"] {{ border: 0 !important; padding: 0 !important; }}
      .st-key-system_registration [data-testid="stWidgetLabel"] p {{ font-size: 0.9rem !important; font-weight: 700 !important; }}
      .st-key-system_registration input,
      .st-key-system_registration textarea,
      .st-key-system_registration [role="combobox"] {{ font-size: 0.88rem !important; }}
      .st-key-system_registration [data-testid="stTextInputRootElement"],
      .st-key-system_registration [data-testid="stTextAreaRootElement"],
      .st-key-system_registration [data-testid="stSelectbox"] div[role="group"],
      .st-key-system_registration [data-testid="stMultiSelect"] div[role="group"] {{
        border: 1px solid #CFC9C5 !important; border-radius: 10px !important; background: white !important;
      }}
      .system-id-card {{
        display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 0.8rem 0 1.2rem;
        padding: 1rem; border: 1px solid #E7E5E4; border-radius: 13px; background: #FAFAF9;
      }}
      .system-id-card strong {{ color: #44403C; font-size: 0.82rem; letter-spacing: 0.05em; }}
      .system-id-card span {{ padding: 0.5rem 0.75rem; border: 1px solid #D6D3D1; border-radius: 9px; color: #700E22; background: white; font-weight: 900; }}
      .system-record {{ padding: 1rem; border: 1px solid #E7E5E4; border-radius: 14px; background: #FFFDFC; }}
      .system-record-id {{ color: #700E22; font-family: ui-monospace, monospace; font-size: 0.78rem; font-weight: 900; }}
      .system-record-name {{ margin-top: 0.25rem; color: #1C1917; font-size: 1rem; font-weight: 850; }}
      .system-record-meta {{ margin-top: 0.2rem; color: #78716C; font-size: 0.78rem; }}
      .adoption-badge {{ display: inline-flex; margin-top: 0.55rem; padding: 0.24rem 0.55rem; border-radius: 999px; font-size: 0.68rem; font-weight: 800; }}
      .adoption-high {{ color: #047857; background: #D1FAE5; }}
      .adoption-medium {{ color: #B45309; background: #FEF3C7; }}
      .adoption-low {{ color: #BE123C; background: #FFE4E6; }}
      .st-key-system_inventory [data-testid="stButton"] button {{ min-height: 2.1rem !important; font-size: 0.78rem !important; }}

      @media (max-width: 900px) {{
        .it-hero {{ padding: 1.5rem 1rem; }}
        .it-hero-top {{ align-items: flex-start; flex-direction: column; }}
        .st-key-it_context_workspace {{ width: calc(100vw - 1.25rem); margin-top: 1rem; }}
      }}
    </style>
    {navigation_html('it-context')}
    <section class="it-hero">
      <div class="it-hero-top">
        <div>
          <div class="it-eyebrow-row">
            <span class="it-eyebrow">Architecture &amp; IT Inventory</span>
            <span class="it-baseline">Sonaki GmbH · Technology Baseline</span>
          </div>
          <h1>IT Context &amp; Systems Intake</h1>
          <p>Catalog software systems, licensed editions, active capabilities and data objects to power technology-readiness scoring.</p>
        </div>
        <div class="it-jump-links">
          <a class="it-jump-link active" href="#system-registration">＋ Input Form</a>
          <a class="it-jump-link" href="#registered-systems">▣ Inventoried Systems ({system_count})</a>
        </div>
      </div>
    </section>
    """
)

if message := st.session_state.pop("it_context_flash", None):
    st.success(message)

workspace = st.container(key="it_context_workspace")
with workspace:
    left, right = st.columns([2, 1])

    with left:
        registration = st.container(key="system_registration")
        with registration:
            st.html('<span id="system-registration"></span>')
            st.markdown("## System Registration Specification")
            st.caption(
                f"All {len(OWNED_SYSTEM_DEFINITION)} architectural fields feed Sonaki GmbH readiness and capability matching."
            )
            st.markdown("**Quick presets:**")
            preset_columns = st.columns([1, 1.35, 1, 5])
            for column, preset in zip(preset_columns[:3], ("DATEV", "Microsoft 365", "Custom App")):
                with column:
                    st.button(
                        preset,
                        key=f"preset_{preset}",
                        on_click=_apply_preset,
                        args=(preset,),
                        use_container_width=True,
                    )

            editing_id = st.session_state.get("owned_system_editor_id")
            system_id = editing_id or next_owned_system_id()
            st.html(
                f'<div class="system-id-card"><strong>1. SYSTEM_ID · AUTO-ASSIGNED</strong><span>{escape(system_id)}</span></div>'
            )

            values: dict[str, Any] = {"system_id": system_id}
            with st.form("owned_system_form", enter_to_submit=False):
                for field in OWNED_SYSTEM_DEFINITION:
                    if field["input_type"] == "auto":
                        continue
                    name = field["field_name"]
                    required = " *" if field["required"] == "yes" else ""
                    label = f"{field['order']}. {field['question']} ({name}){required}"
                    key = f"owned_system_{name}"
                    if field["notes"]:
                        st.caption(field["notes"])
                    if field["input_type"] == "text":
                        values[name] = st.text_input(
                            label,
                            key=key,
                            placeholder="e.g. SAP S/4HANA, Salesforce Sales Cloud, Microsoft 365, DATEV…",
                        )
                    elif field["input_type"] == "free text":
                        values[name] = st.text_area(label, key=key, height=90)
                    elif field["input_type"] == "dropdown":
                        values[name] = st.selectbox(label, [""] + _options(field), key=key)
                    elif field["input_type"] == "multi-select":
                        values[name] = st.multiselect(label, _options(field), key=key)

                submitted = st.form_submit_button(
                    "Update system" if editing_id else "Register system",
                    type="primary",
                    use_container_width=True,
                )

            if submitted:
                try:
                    saved_id = persist_owned_system(values)
                    cluster_database()
                    _clear_editor()
                    st.session_state["it_context_flash"] = (
                        f"{saved_id} was saved. The opportunity pipeline now uses the updated IT inventory."
                    )
                    st.rerun()
                except ValueError as exc:
                    st.error(str(exc))

    with right:
        inventory = st.container(key="system_inventory")
        with inventory:
            st.html('<span id="registered-systems"></span>')
            title, action = st.columns([4, 1])
            with title:
                st.markdown(f"## ▣ Registered systems ({system_count})")
            with action:
                st.button("New", key="new_owned_system", on_click=_clear_editor)
            st.caption("Select a system to edit its registered context.")

            for system in systems:
                adoption = str(system.get("adoption") or "")
                adoption_class = (
                    "adoption-high"
                    if adoption == "Used by everyone who needs it"
                    else "adoption-medium"
                    if adoption == "Used by some teams"
                    else "adoption-low"
                )
                in_use = len(system.get("capabilities_in_use") or [])
                available = len(system.get("capabilities_available") or [])
                st.html(
                    f"""
                    <div class="system-record">
                      <div class="system-record-id">{escape(str(system['system_id']))}</div>
                      <div class="system-record-name">{escape(str(system['system_name']))}</div>
                      <div class="system-record-meta">{escape(str(system['category']))} · {in_use} in use · {available} available</div>
                      <span class="adoption-badge {adoption_class}">{escape(adoption)}</span>
                    </div>
                    """
                )
                st.button(
                    "Edit system",
                    key=f"edit_{system['system_id']}",
                    on_click=_edit_system,
                    args=(system,),
                    use_container_width=True,
                )
