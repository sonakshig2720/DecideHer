import React, { useState } from 'react';
import {
  TrendingUp,
  Database,
  Share2,
  Search,
  SlidersHorizontal,
  FileText,
  Send,
  Lock,
  ChevronRight,
  Sparkles,
  Bot,
  User,
  RotateCcw,
} from 'lucide-react';
import { ADVISOR_KNOWLEDGE_BASE, PORTFOLIO_METRICS } from '../data/dashboardData';

interface Message {
  sender: 'user' | 'advisor';
  text: string;
  timestamp: string;
}

export const AIAdvisorPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestedQuestions = [
    {
      id: 'top-3',
      text: 'What are the top 3 initiatives I should invest in next year?',
      icon: TrendingUp,
      key: 'top 3',
    },
    {
      id: 'existing-systems',
      text: 'Which opportunities could use existing systems?',
      icon: Database,
      key: 'existing systems',
    },
    {
      id: 'duplicating-effort',
      text: 'Where are we duplicating effort across departments?',
      icon: Share2,
      key: 'duplicating effort',
    },
    {
      id: 'need-evidence',
      text: 'Which initiatives need more evidence before we decide?',
      icon: Search,
      key: 'need more evidence',
    },
    {
      id: 'smaller-budget',
      text: 'How would the roadmap change with a smaller budget?',
      icon: SlidersHorizontal,
      key: 'smaller budget',
    },
    {
      id: 'board-summary',
      text: 'Summarize the key recommendations for the board.',
      icon: FileText,
      key: 'summarize',
    },
  ];

  const handleAsk = (query: string, lookupKey?: string) => {
    if (!query.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMessages: Message[] = [
      ...messages,
      { sender: 'user', text: query, timestamp: time },
    ];
    setMessages(newMessages);
    setInputValue('');
    setIsThinking(true);

    setTimeout(() => {
      let answer = '';
      const lower = query.toLowerCase();

      if (lookupKey && ADVISOR_KNOWLEDGE_BASE[lookupKey]) {
        answer = ADVISOR_KNOWLEDGE_BASE[lookupKey];
      } else if (lower.includes('top 3') || lower.includes('invest') || lower.includes('best')) {
        answer = ADVISOR_KNOWLEDGE_BASE['top 3'];
      } else if (lower.includes('existing') || lower.includes('crm') || lower.includes('erp') || lower.includes('m365')) {
        answer = ADVISOR_KNOWLEDGE_BASE['existing systems'];
      } else if (lower.includes('duplicat') || lower.includes('cross') || lower.includes('overlap')) {
        answer = ADVISOR_KNOWLEDGE_BASE['duplicating effort'];
      } else if (lower.includes('evidence') || lower.includes('investigate') || lower.includes('low evidence')) {
        answer = ADVISOR_KNOWLEDGE_BASE['need more evidence'];
      } else if (lower.includes('budget') || lower.includes('cost') || lower.includes('cheap')) {
        answer = ADVISOR_KNOWLEDGE_BASE['smaller budget'];
      } else if (lower.includes('summar') || lower.includes('board') || lower.includes('executive')) {
        answer = ADVISOR_KNOWLEDGE_BASE['summarize'];
      } else if (lower.includes('blocker') || lower.includes('agree')) {
        answer = `**Primary Blocker Insight:**\n\n${PORTFOLIO_METRICS.primaryBlocker.count} out of ${PORTFOLIO_METRICS.reports} reports (${PORTFOLIO_METRICS.primaryBlocker.percentage}%) cite **"${PORTFOLIO_METRICS.primaryBlocker.blocker}"**. Confirm ownership and evidence before selecting technology.`;
      } else {
        answer = ADVISOR_KNOWLEDGE_BASE['summarize'] || 'No portfolio evidence is available yet.';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'advisor',
          text: answer,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
      setIsThinking(false);
    }, 450);
  };

  return (
    <div
      id="ai-investment-advisor-panel"
      className="bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col h-full overflow-hidden"
    >
      {/* Panel Header */}
      <div className="p-5 pb-3 border-b border-stone-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#e11d48] to-[#f97316] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              Ask your AI investment advisor
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-rose-100/80 text-rose-800 border border-rose-200">
            BETA
          </span>
        </div>
        <p className="text-xs text-stone-500">
          Get answers based on all reports, analysis and evidence.
        </p>
      </div>

      {/* Suggested Prompts List or Active Conversation */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Recommended executive inquiries
            </div>
            {suggestedQuestions.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.id}
                  id={`suggested-question-${q.id}`}
                  onClick={() => handleAsk(q.text, q.key)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 text-left transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 pr-2">
                    <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600 shrink-0 group-hover:text-[#881337] transition-colors shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-stone-800 leading-snug group-hover:text-stone-950">
                      {q.text}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 group-hover:text-stone-700 transition-colors" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-[11px] font-semibold text-stone-500">
                Advisor Conversation
              </span>
              <button
                onClick={() => setMessages([])}
                className="flex items-center gap-1 text-[11px] text-[#881337] hover:underline font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset chat</span>
              </button>
            </div>

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'advisor' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#881337] to-[#e11d48] text-white flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#5c1628] text-white rounded-br-none shadow-xs'
                      : 'bg-stone-50 border border-stone-200 text-stone-800 rounded-bl-none shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{m.text}</div>
                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      m.sender === 'user' ? 'text-rose-200' : 'text-stone-400'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-stone-300 text-[#2b0813] font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                    ES
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-stone-500 italic p-2">
                <Sparkles className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                <span>Analyzing portfolio metrics & blocker records...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Form & Lock notice */}
      <div className="p-3 border-t border-stone-100 bg-stone-50/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <input
            id="advisor-input-field"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about our AI opportunities..."
            className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#881337]/30 focus:border-[#881337] transition-all shadow-inner"
          />
          <button
            id="advisor-submit-btn"
            type="submit"
            disabled={!inputValue.trim()}
            className="w-8 h-8 rounded-lg bg-[#5c1628] hover:bg-[#461020] disabled:bg-stone-200 text-white disabled:text-stone-400 flex items-center justify-center transition-all shrink-0 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-stone-500 font-medium">
          <Lock className="w-3 h-3 text-stone-400" />
          <span>The advisor uses your organization&apos;s data only.</span>
        </div>
      </div>
    </div>
  );
};
