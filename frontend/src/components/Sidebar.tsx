import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  FileText,
  FileSearch,
  Sparkles,
  BarChart3,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { DecideHerLogo } from './DecideHerLogo';

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeNav, setActiveNav }) => {
  const navItems = [
    { id: 'executive', label: 'Executive view', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Investment roadmap', icon: TrendingUp },
    { id: 'themes', label: 'Themes & opportunities', icon: Boxes },
    { id: 'usecases', label: 'Use cases', icon: FileText },
    { id: 'evidence', label: 'Evidence & interviews', icon: FileSearch },
    { id: 'advisor', label: 'Ask AI advisor', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-[#2A050E] text-stone-200 flex flex-col justify-between shrink-0 border-r border-[#460D1A] select-none h-screen sticky top-0"
    >
      <div>
        {/* Horizontal Logo Lockup on white background */}
        <div id="brand-header" className="p-3.5 border-b border-[#400B17]">
          <DecideHerLogo
            size="md"
            variant="dark"
            withBackground={true}
            className="w-full"
          />
        </div>

        {/* Navigation items */}
        <nav id="sidebar-navigation" className="px-3 space-y-1 mt-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#700E22] text-white shadow-sm shadow-[#1a040b] border-l-2 border-[#EA580C]'
                    : 'text-stone-300 hover:text-white hover:bg-[#3D0A16]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#F5A623]' : 'text-stone-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile and Organization Section */}
      <div id="sidebar-footer" className="p-3 border-t border-[#400B17] space-y-3">
        {/* Workspace selector */}
        <button
          id="workspace-selector-btn"
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#3A0714] hover:bg-[#4A0A1A] text-xs font-medium text-stone-200 transition-colors border border-[#520C1D]"
        >
          <span className="truncate">GlobalTech (demo)</span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        </button>

        {/* User Card */}
        <div id="user-profile-badge" className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center shadow-xs">
            ES
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-white leading-tight">
              Executive User
            </div>
            <div className="text-[11px] text-stone-400">CIO / VP Transformation</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
