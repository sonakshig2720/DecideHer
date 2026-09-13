"""Shared native-Streamlit navigation matching the React navigation bar."""
import base64
from pathlib import Path

ROOT = Path(__file__).parent
LOGO_PATH = ROOT / "static" / "Logo.jpeg"
TOP_NAVIGATION_CSS_PATH = ROOT / "static" / "top-navigation.css"

LOGO_DATA_URI = "data:image/jpeg;base64," + base64.b64encode(
    LOGO_PATH.read_bytes()
).decode("ascii")
TOP_NAVIGATION_CSS = TOP_NAVIGATION_CSS_PATH.read_text(encoding="utf-8")


def navigation_html(active_page: str) -> str:
    """Return the shared top navigation with the requested page highlighted."""

    def link_class(page: str, *, primary: bool = False) -> str:
        classes = ["dh-nav-link"]
        if page == active_page:
            classes.append("dh-nav-link--active")
        if primary:
            classes.append("dh-nav-link--primary")
        return " ".join(classes)

    return f"""
    <header class="dh-nav-bar">
      <div class="dh-nav-inner">
        <a class="dh-nav-brand" href="/" target="_self" aria-label="DecideHer Home">
          <span class="dh-nav-brand-mark"><img src="{LOGO_DATA_URI}" alt="" /></span>
          <span class="dh-nav-brand-name">Decide<span>Her</span></span>
        </a>
        <nav class="dh-nav-links" aria-label="Primary navigation">
          <a class="{link_class('home')}" href="/" target="_self">
            <svg class="dh-nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8"></path><path d="M5 10v10h14V10"></path><path d="M9 20v-6h6v6"></path></svg>
            Home
          </a>
          <span class="dh-nav-menu">
            <button class="dh-nav-button" type="button">
              <svg class="dh-nav-icon dh-nav-icon--accent" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4"></path><path d="M12 18h.01"></path></svg>
              How to Use
              <svg class="dh-nav-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <span class="dh-nav-popover">
              <span class="dh-nav-popover-heading">
                <span class="dh-nav-popover-heading-icon">
                  <svg class="dh-nav-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
                </span>
                <span>
                  <span class="dh-nav-popover-title">How to Use DecideHer</span>
                  <span class="dh-nav-popover-subtitle">From employee insight to a prioritised opportunity</span>
                </span>
              </span>
              <span class="dh-nav-popover-content">
                <span class="dh-nav-popover-card">
                  <span class="dh-nav-popover-card-title">1. Submit an improvement idea</span>
                  <p>Describe the current workflow, desired outcome, evidence and constraints.</p>
                </span>
                <span class="dh-nav-popover-card">
                  <span class="dh-nav-popover-card-title">2. Add IT context</span>
                  <p>Register owned systems, active capabilities and available modules.</p>
                </span>
                <span class="dh-nav-popover-card">
                  <span class="dh-nav-popover-card-title">3. Review the priority dashboard</span>
                  <p>Explore consolidated opportunities, concerns, readiness and evidence.</p>
                </span>
              </span>
            </span>
          </span>
          <a class="{link_class('it-context')}" href="/it-context" target="_self">
            <svg class="dh-nav-icon dh-nav-icon--accent" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="2"></rect><rect x="3" y="14" width="18" height="6" rx="2"></rect><path d="M7 7h.01M7 17h.01"></path></svg>
            IT Context
          </a>
          <a class="{link_class('input')}" href="/input" target="_self">
            <svg class="dh-nav-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M9 3v4h6V3M9 13h6M9 17h4"></path></svg>
            Employee Idea Input Form
          </a>
          <a class="{link_class('dashboard', primary=True)}" href="/output" target="_self">
            <svg class="dh-nav-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg>
            Priority Dashboard
          </a>
        </nav>
      </div>
    </header>
    """
