"""Hidden-navigation entry point for the DecideHer workflow."""
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / "api_key.env")
load_dotenv(override=True)

st.set_page_config(page_title="AI Transformation Roadmap", page_icon="🧭", layout="wide")

home_page = st.Page("pages/0_home.py", title="Home", default=True)
input_page = st.Page("pages/1_intake.py", title="Input", url_path="input")
it_context_page = st.Page(
    "pages/2_it_context.py", title="IT Context", url_path="it-context"
)
output_page = st.Page("pages/3_decision.py", title="Output", url_path="output")
st.navigation(
    [home_page, it_context_page, input_page, output_page], position="hidden"
).run()
