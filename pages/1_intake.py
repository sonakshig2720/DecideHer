"""Single visible input screen; submission runs Engine 1 before output."""
import streamlit as st
from pydantic import ValidationError

from engine1 import derive_issue_fields, validate_meaningful_submission
from form_loader import render_intake_form
from pipeline import cluster_database
from privacy import AnonymizationError, anonymize_record, anonymized_role_label
from sample_data import seed_database
from schemas import IssueSubmission
from storage import persist_submission

st.html(
    """
    <style>
      [data-testid="stAppViewContainer"] {
        background:
          radial-gradient(circle at 92% 4%, rgba(234, 88, 12, 0.09), transparent 24rem),
          #FAF8F5;
      }

      .stMainBlockContainer {
        width: min(1540px, calc(100vw - 3rem)) !important;
        max-width: 1540px !important;
        padding: 1.5rem 0 4rem !important;
      }

      .intake-hero {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2.5rem;
        padding: 2rem 2.25rem;
        border: 1px solid #4D0A18;
        border-radius: 20px;
        color: white;
        background: linear-gradient(125deg, #340712 0%, #700E22 66%, #8F172F 100%);
        box-shadow: 0 18px 45px rgba(52, 7, 18, 0.18);
      }

      .intake-hero::after {
        content: "";
        position: absolute;
        width: 280px;
        height: 280px;
        right: -90px;
        top: -140px;
        border-radius: 999px;
        background: rgba(245, 166, 35, 0.18);
      }

      .intake-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.3rem 0.65rem;
        border: 1px solid rgba(255,255,255,0.24);
        border-radius: 999px;
        color: #FDE8D5;
        background: rgba(255,255,255,0.1);
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .intake-badge-dot {
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 999px;
        background: #F5A623;
      }

      .intake-hero h1 {
        position: relative;
        z-index: 1;
        max-width: 980px;
        margin: 0.85rem 0 0.65rem;
        color: white;
        font-size: clamp(2.65rem, 4.6vw, 4.35rem);
        line-height: 1;
        letter-spacing: -0.035em;
      }

      .intake-hero h2 {
        position: relative;
        z-index: 1;
        margin: 0 0 0.7rem;
        color: #FFF8F6;
        font-size: clamp(1.5rem, 2.2vw, 2rem);
        line-height: 1.25;
        letter-spacing: -0.015em;
      }

      .intake-hero p {
        position: relative;
        z-index: 1;
        max-width: 1000px;
        margin: 0;
        color: #F3E7EA;
        font-size: 1.18rem;
        line-height: 1.55;
      }

      .intake-hero p + p {
        margin-top: 0.6rem;
        color: #F9EEF0;
      }

      .intake-hero-copy {
        position: relative;
        z-index: 1;
        flex: 1 1 auto;
      }

      .intake-logo {
        position: relative;
        z-index: 1;
        flex: 0 0 auto;
        width: clamp(230px, 19vw, 285px);
        height: clamp(230px, 19vw, 285px);
        object-fit: cover;
        border: 1px solid rgba(255,255,255,0.38);
        border-radius: 18px;
        background: white;
        box-shadow: 0 14px 30px rgba(20, 2, 7, 0.26);
      }

      .privacy-note {
        display: flex;
        gap: 0.85rem;
        align-items: flex-start;
        margin: 1rem 0 1.35rem;
        padding: 0.9rem 1rem;
        border: 1px solid #F5D4C6;
        border-radius: 12px;
        color: #5B2118;
        background: #FFF8F6;
        font-size: 1.05rem;
        line-height: 1.5;
      }

      .privacy-icon {
        flex: 0 0 auto;
        display: grid;
        place-items: center;
        width: 1.8rem;
        height: 1.8rem;
        border-radius: 9px;
        color: white;
        background: #EA580C;
        font-weight: 900;
      }

      [data-testid="stForm"] {
        padding: 2rem 2.1rem 2.25rem !important;
        border: 1px solid #E9E2DE !important;
        border-radius: 18px !important;
        background: rgba(255,255,255,0.96) !important;
        box-shadow: 0 12px 35px rgba(52, 7, 18, 0.07) !important;
      }

      [data-testid="stForm"] h3 {
        margin: 0.25rem 0 0 !important;
        color: #700E22 !important;
        font-size: 1.4rem !important;
        letter-spacing: -0.01em;
      }

      .required-key {
        margin-top: -0.15rem;
        padding-top: 0;
        color: #6B625E;
        font-size: 1.08rem;
        font-weight: 700;
        text-align: right;
        white-space: nowrap;
      }

      .required-key span {
        color: #EA580C;
        font-weight: 900;
      }

      [data-testid="stForm"] hr {
        margin: 0.65rem 0 1.15rem !important;
        border-color: #F0E8E4 !important;
      }

      [data-testid="stWidgetLabel"] p {
        color: #3F3A37 !important;
        font-size: 1.14rem !important;
        font-weight: 650 !important;
      }

      [data-testid="stForm"] input,
      [data-testid="stForm"] textarea,
      [data-testid="stForm"] [role="combobox"],
      [data-testid="stForm"] [role="radiogroup"] label,
      [data-testid="stForm"] [data-testid="stCaptionContainer"] p {
        font-size: 1.08rem !important;
      }

      [data-testid="stTextInputRootElement"],
      [data-testid="stTextAreaRootElement"],
      [data-testid="stSelectbox"] div[role="group"],
      [data-testid="stMultiSelect"] div[role="group"] {
        min-height: 3.15rem !important;
        border: 1px solid #C7C2BF !important;
        border-radius: 10px !important;
        background: #FFFFFF !important;
        box-shadow: 0 1px 4px rgba(52, 7, 18, 0.06) !important;
      }

      [data-testid="stTextInputRootElement"]:focus-within,
      [data-testid="stTextAreaRootElement"]:focus-within,
      [data-testid="stSelectbox"] div[role="group"]:focus-within,
      [data-testid="stMultiSelect"] div[role="group"]:focus-within {
        border-color: #700E22 !important;
        box-shadow: 0 0 0 2px rgba(112, 14, 34, 0.12), 0 2px 7px rgba(52, 7, 18, 0.07) !important;
      }

      [data-testid="stTextArea"] textarea {
        min-height: 7.5rem !important;
        background: transparent !important;
      }

      [data-testid="stTextInput"] input,
      [data-testid="stSelectbox"] input,
      [data-testid="stMultiSelect"] input {
        min-height: 3rem !important;
        background: transparent !important;
      }

      [data-testid="stFormSubmitButton"] button {
        width: 100% !important;
        min-height: 3rem !important;
        margin-top: 0.75rem !important;
        border: 1px solid #4D0A18 !important;
        border-radius: 11px !important;
        color: white !important;
        background: #700E22 !important;
        font-weight: 800 !important;
        font-size: 1.08rem !important;
        box-shadow: 0 7px 18px rgba(112, 14, 34, 0.2) !important;
      }

      [data-testid="stFormSubmitButton"] button:hover {
        border-color: #EA580C !important;
        background: #580B1B !important;
      }

      @media (max-width: 700px) {
        .stMainBlockContainer {
          width: calc(100vw - 1.2rem) !important;
          padding: 0.8rem 0 2.5rem !important;
        }
        .intake-hero { padding: 1.4rem 1.25rem; border-radius: 15px; gap: 1.25rem; }
        .intake-logo { width: 125px; height: 125px; border-radius: 12px; }
        [data-testid="stForm"] { padding: 1.1rem 1rem 1.3rem !important; }
      }

      @media (max-width: 520px) {
        .intake-hero { align-items: center; flex-direction: column; gap: 1rem; }
        .intake-logo { width: 120px; height: 120px; }
        .intake-hero h1 { font-size: 2.15rem; }
        .intake-hero h2 { font-size: 1.3rem; }
        .intake-hero p { font-size: 1rem; }
      }
    </style>

    <section class="intake-hero">
      <img class="intake-logo" src="/app/static/decideher-logo.jpeg" alt="DecideHer logo" />
      <div class="intake-hero-copy">
        <div class="intake-badge"><span class="intake-badge-dot"></span>DecideHer · Secure intake</div>
        <h1>YOUR IDEAS. YOUR COMPANY’S AI FUTURE.</h1>
        <h2>Where could AI make your work easier?</h2>
        <p>Tell us about a task you’d like to improve, a challenge you face, or an AI idea you’d like to explore. No technical expertise needed—just your experience.</p>
        <p>Your input will help your company identify shared needs and prioritise where AI could make a meaningful difference.</p>
      </div>
    </section>

    <div class="privacy-note">
      <span class="privacy-icon">✓</span>
      <span><strong>Your details stay private.</strong> Direct identifiers are removed before the submission is stored.</span>
    </div>
    """
)

seed_database()

if st.button("Preview sample dashboard", type="secondary"):
    clusters, _ = cluster_database()
    st.session_state["clusters"] = clusters
    st.session_state["interviews_by_cluster"] = {}
    st.session_state["pipeline_complete_engine1"] = True
    st.switch_page("pages/3_decision.py")

values = render_intake_form()
if values:
    try:
        submission = IssueSubmission.model_validate(values)
        validate_meaningful_submission(submission)
        privacy_result = anonymize_record(
            submission.model_dump(mode="json"),
            {
                "person": submission.name,
                "email": submission.email,
                "company": submission.company,
                anonymized_role_label(submission.submitter_role): submission.submitter_role or "",
            },
        )
        safe_answers = privacy_result.anonymized_data
        safe_model_text = "\n".join(
            filter(
                None,
                [
                    safe_answers.get("idea"),
                    safe_answers.get("what_happens_today"),
                    safe_answers.get("why_we_want_this"),
                ],
            )
        )
        issue_id, storage_backend = persist_submission(
            submitter={
                "name": str(safe_answers["name"]),
                "email": str(safe_answers["email"]),
                "company": str(safe_answers["company"]),
                "department": str(safe_answers["department"]),
            },
            issue=safe_answers,
            derived=derive_issue_fields(submission).model_dump(),
            model_text=safe_model_text,
        )
        clusters, selected_cluster_id = cluster_database(issue_id)
        for cluster in clusters:
            if cluster["cluster_id"] == selected_cluster_id:
                cluster["anonymization_provider"] = privacy_result.provider
                cluster["anonymization_warning"] = privacy_result.warning
        st.session_state["clusters"] = clusters
        st.session_state["selected_cluster_id"] = selected_cluster_id
        st.session_state["interviews_by_cluster"] = {}
        st.session_state["pipeline_complete_engine1"] = True
        st.session_state["submission_reference"] = f"DH-{issue_id.split('-')[0].upper()}"
        st.session_state["storage_backend"] = storage_backend
        st.switch_page("pages/3_decision.py")
    except (ValidationError, ValueError, AnonymizationError) as exc:
        st.error("Please correct the form before submitting.")
        st.code(str(exc))
