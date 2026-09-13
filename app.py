"""Hidden-navigation entry point for the two-screen roadmap flow."""
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / "api_key.env")
load_dotenv(override=True)

st.set_page_config(page_title="AI Transformation Roadmap", page_icon="🧭", layout="wide")

input_page = st.Page("pages/1_intake.py", title="Input", default=True)
output_page = st.Page("pages/3_decision.py", title="Output")
st.navigation([input_page, output_page], position="hidden").run()
