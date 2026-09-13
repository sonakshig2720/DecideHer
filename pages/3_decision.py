"""Render the integrated React dashboard as the complete output screen."""
from pathlib import Path

import streamlit as st

from dashboard_export import DASHBOARD_DATA_PATH, publish_dashboard
from engine2 import build_decision_portfolio

clusters = st.session_state.get("clusters", [])
if not clusters or not st.session_state.get("pipeline_complete_engine1"):
    st.warning("Submit the input form first so the complete pipeline can prepare the output.")
    if st.button("Go to input"):
        st.switch_page("pages/1_intake.py")
    st.stop()

dashboard = build_decision_portfolio(clusters)
publish_dashboard(dashboard)

built_dashboard = Path(__file__).parents[1] / "static" / "dashboard" / "index.html"
if built_dashboard.exists() and DASHBOARD_DATA_PATH.exists():
    st.html(
        """
        <style>
          [data-testid="stHeader"],
          [data-testid="stToolbar"],
          [data-testid="stAppToolbar"],
          [data-testid="stElementToolbar"],
          [data-testid="stDecoration"],
          [data-testid="stStatusWidget"],
          #MainMenu,
          footer {
            display: none !important;
          }

          [data-testid="stAppViewContainer"],
          [data-testid="stMain"],
          .stMainBlockContainer,
          [data-testid="stVerticalBlock"] {
            height: 100vh !important;
            min-height: 100vh !important;
            overflow: hidden !important;
          }

          [data-testid="stAppViewContainer"],
          [data-testid="stMain"] {
            background: #FAF8F5 !important;
          }

          .stMainBlockContainer {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
          }

          [data-testid="stVerticalBlock"] {
            gap: 0 !important;
          }

          [data-testid="stIFrame"],
          [data-testid="stIFrame"] iframe {
            width: 100% !important;
            height: 100vh !important;
            border: 0 !important;
            display: block !important;
          }
        </style>
        """
    )
    st.iframe(
        "/app/static/dashboard/index.html",
        width="stretch",
        height="stretch",
        tab_index=0,
    )
else:
    st.error("The executive dashboard has not been built. Run `cd frontend && npm run build`.")
