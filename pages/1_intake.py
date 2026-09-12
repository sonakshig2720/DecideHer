import streamlit as st
from engine1 import derive_issue_fields
from form_loader import render_intake_form
from schemas import IssueSubmission
from storage import StorageConfigurationError, save_submission

st.title("1. Intake")
st.caption("Your contact details are stored separately in the Drive sheet. Issue text is currently stored and processed as entered.")

def show_submission_success(reference: str) -> None:
    st.success("Your improvement idea has been saved successfully.")
    st.subheader("Submission reference")
    st.code(reference, language=None)
    st.write("Keep this reference if you need to discuss the submission with the team.")
    st.subheader("What happens next")
    st.markdown(
        """
        1. Your submission is now in the shared Drive pipeline.
        2. Engine 1 groups it with similar requests and checks existing systems.
        3. The next engine uses the resulting cluster to prepare one recommendation.
        """
    )
    if st.button("Submit another idea"):
        st.session_state.pop("last_submission_reference", None)
        for key in list(st.session_state):
            if key.startswith("form_"):
                del st.session_state[key]
        st.rerun()


if reference := st.session_state.get("last_submission_reference"):
    show_submission_success(reference)
else:
    values = render_intake_form()

if not st.session_state.get("last_submission_reference") and values:
    submission = IssueSubmission.model_validate(values)
    model_text = "\n".join(filter(None, [submission.idea, submission.what_happens_today, submission.why_we_want_this]))
    derived = derive_issue_fields(submission)
    try:
        issue_id = save_submission(
            submitter={
                "name": submission.name,
                "email": submission.email,
                "company": submission.company,
                "department": submission.department,
            },
            issue=submission.model_dump(exclude={"name", "email", "company"}),
            derived=derived.model_dump(),
            model_text=model_text,
        )
        reference = f"DH-{issue_id.split('-')[0].upper()}"
        st.session_state["last_submission_reference"] = reference
        st.rerun()
    except StorageConfigurationError as error:
        st.error(str(error))
        st.info("Your response was not saved. Configure hosted storage, then submit it again.")
