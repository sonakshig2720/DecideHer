"""AI Transformation Roadmap - Streamlit entry point."""
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="AI Transformation Roadmap", page_icon="🧭", layout="wide")
st.markdown(
    """
    <style>
      .stApp { font-size: 18px; }
      h1 { font-size: 2.5rem !important; }
      h2 { font-size: 1.8rem !important; }
      div[data-testid="stWidgetLabel"] p,
      div[data-testid="stCaptionContainer"] p { font-size: 1.05rem !important; }
      input, textarea, div[data-baseweb="select"] span { font-size: 1.05rem !important; }
      textarea { min-height: 120px !important; }
      button { font-size: 1.05rem !important; }
    </style>
    """,
    unsafe_allow_html=True,
)
st.title("AI Transformation Roadmap")
st.write("Start in **Intake** from the sidebar to turn use cases into evidence-ready clusters.")
st.info("Demo-safe mode is available: the app can use local fallback data if an API is unavailable.")
