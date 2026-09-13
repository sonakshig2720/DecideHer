import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ClipboardEdit,
  HelpCircle,
  Home,
  Info,
  LayoutDashboard,
  ServerCog,
} from 'lucide-react';
import { DecideHerLogo } from './DecideHerLogo';

type ActivePage = 'home' | 'it-context' | 'input' | 'dashboard';
type OpenPanel = 'how-to-use' | null;

interface TopNavigationProps {
  activePage: ActivePage;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ activePage }) => {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPanel = (panel: Exclude<OpenPanel, null>) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenPanel(panel);
  };

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setOpenPanel(null), 180);
  };

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const pageLinkClass = (page: ActivePage, emphasis = false) => {
    if (emphasis) {
      return 'dh-nav-link dh-nav-link--primary';
    }
    return `dh-nav-link${activePage === page ? ' dh-nav-link--active' : ''}`;
  };

  return (
    <div
      id="decideher-top-navigation"
      className="dh-nav-bar no-print"
    >
      <div className="dh-nav-inner">
        <a
          href="/"
          target="_top"
          className="dh-nav-brand"
          title="DecideHer Home"
        >
          <span className="dh-nav-brand-mark">
            <DecideHerLogo
              showText={false}
              withBackground={false}
              size="sm"
              variant="color"
            />
          </span>
          <span className="dh-nav-brand-name">
            Decide<span>Her</span>
          </span>
        </a>

        <nav ref={navRef} className="dh-nav-links">
          <a href="/" target="_top" className={pageLinkClass('home')}>
            <Home className="dh-nav-icon" />
            <span>Home</span>
          </a>

          <div
            className="dh-nav-menu"
            onMouseEnter={() => showPanel('how-to-use')}
            onMouseLeave={scheduleClose}
          >
            <button
              id="nav-how-to-use-btn"
              onClick={() => setOpenPanel(openPanel === 'how-to-use' ? null : 'how-to-use')}
              className="dh-nav-button"
              aria-haspopup="true"
              aria-expanded={openPanel === 'how-to-use'}
            >
              <HelpCircle className="dh-nav-icon dh-nav-icon--accent" />
              <span>How to Use</span>
              <ChevronDown className={`dh-nav-chevron ${openPanel === 'how-to-use' ? 'dh-nav-chevron--open' : ''}`} />
            </button>

            {openPanel === 'how-to-use' && (
              <div
                className="dh-nav-popover dh-nav-popover--open"
                onMouseEnter={() => showPanel('how-to-use')}
                onMouseLeave={scheduleClose}
              >
                <div className="dh-nav-popover-heading">
                  <div className="dh-nav-popover-heading-icon">
                    <Info className="dh-nav-icon" />
                  </div>
                  <div>
                    <h4 className="dh-nav-popover-title">How to Use DecideHer</h4>
                    <p className="dh-nav-popover-subtitle">From employee insight to a prioritised opportunity</p>
                  </div>
                </div>
                <div className="dh-nav-popover-content">
                  <div className="dh-nav-popover-card">
                    <div className="dh-nav-popover-card-title">
                      <ClipboardEdit className="dh-nav-icon" />
                      <span>1. Submit an improvement idea</span>
                    </div>
                    <p>Describe the current workflow, desired outcome, evidence and constraints.</p>
                  </div>
                  <div className="dh-nav-popover-card">
                    <div className="dh-nav-popover-card-title">
                      <LayoutDashboard className="dh-nav-icon dh-nav-icon--accent" />
                      <span>2. Review the priority dashboard</span>
                    </div>
                    <p>Explore consolidated opportunities, blockers, readiness and evidence.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <a href="/it-context" target="_top" className={pageLinkClass('it-context')}>
            <ServerCog className="dh-nav-icon dh-nav-icon--accent" />
            <span>IT Context</span>
          </a>

          <a href="/input" target="_top" className={pageLinkClass('input')}>
            <ClipboardEdit className="dh-nav-icon" />
            <span>Employee Idea Input Form</span>
          </a>

          <a href="/output" target="_top" className={pageLinkClass('dashboard', true)}>
            <LayoutDashboard className="dh-nav-icon" />
            <span>Priority Dashboard</span>
          </a>
        </nav>
      </div>
    </div>
  );
};
