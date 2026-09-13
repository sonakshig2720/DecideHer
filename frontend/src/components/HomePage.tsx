import React from 'react';
import { TopNavigation } from './TopNavigation';
import { PortfolioMetrics } from '../types';
import {
  ArrowRight,
  ClipboardEdit,
  LayoutDashboard,
} from 'lucide-react';

interface HomePageProps {
  metrics: PortfolioMetrics;
}

export const HomePage: React.FC<HomePageProps> = ({
  metrics,
}) => {
  return (
    <div id="home-page" className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col font-sans">
      <TopNavigation activePage="home" />

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full max-w-[1300px] mx-auto p-4 sm:p-6 lg:p-12 space-y-10 flex flex-col justify-center">
        {/* Hero Section */}
        <section id="hero-section" className="text-center max-w-4xl mx-auto space-y-4 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FDF2F4] text-[#700E22] text-xs font-extrabold border border-[#FBE0E5]">
            <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse" />
            <span>Sonaki GmbH • Strategic Transformation Roadmap</span>
          </div>

          {/* Heading as requested */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-tight">
            Turning AI Ideas in Action
          </h1>

          {/* Subheading as requested */}
          <p className="text-base sm:text-lg lg:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Cut through the AI noise. Prioritise what matters. Build what delivers value.
          </p>
        </section>

        {/* The 2 Core Navigation Tiles (3 middle tiles removed as requested) */}
        <section
          id="home-action-buttons-section"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full pt-2"
        >
          {/* Tile 1: Employee Idea Input Form */}
          <a
            id="nav-to-input-form-card"
            href="/input"
            target="_top"
            className="group relative bg-white hover:bg-[#FFFDFD] rounded-2xl border-2 border-[#FBE0E5] hover:border-[#700E22] p-7 sm:p-8 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FDF2F4] text-[#700E22] flex items-center justify-center border border-[#FBE0E5] group-hover:scale-105 transition-transform shadow-2xs">
                  <ClipboardEdit className="w-7 h-7 text-[#700E22]" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                  Input Form
                </span>
              </div>

              {/* Tile 1 Headline as requested */}
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 group-hover:text-[#700E22] transition-colors">
                Employee Idea Input Form
              </h2>

              {/* Tile 1 Text as requested */}
              <p className="text-sm sm:text-base text-stone-600 mt-2.5 leading-relaxed">
                Tell us your ideas and where you see things can be improved
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs font-bold text-[#700E22] flex items-center gap-1.5 group-hover:underline">
                <span>Open Idea Form</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </span>
              <span className="text-[11px] font-medium text-stone-400">
                {metrics.reports} inputs collected
              </span>
            </div>
          </a>

          {/* Tile 2: Priority Dashboard */}
          <a
            id="nav-to-dashboard-card"
            href="/output"
            target="_top"
            className="group relative bg-gradient-to-br from-[#700E22] via-[#5C0C1C] to-[#450814] text-white rounded-2xl border-2 border-[#580B1B] p-7 sm:p-8 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform shadow-2xs">
                  <LayoutDashboard className="w-7 h-7 text-[#F5A623]" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-white">
                  Executive View
                </span>
              </div>

              {/* Tile 2 Headline as requested */}
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#FDF2F4] transition-colors">
                Priority Dashboard
              </h2>

              {/* Tile 2 Text as requested */}
              <p className="text-sm sm:text-base text-stone-200 mt-2.5 leading-relaxed">
                See the full list and details per opportunity
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/15 flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5A623] flex items-center gap-1.5 group-hover:underline">
                <span>View Priority Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </span>
              <span className="text-[11px] font-medium text-rose-200">
                Top {Math.min(5, metrics.opportunities)} Opportunities
              </span>
            </div>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-stone-200/80 bg-white text-center text-xs text-stone-500">
        Sonaki GmbH Operational Transformation • Powered by DecideHer Intelligence Framework
      </footer>
    </div>
  );
};
