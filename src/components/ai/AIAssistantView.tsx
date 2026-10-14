import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Info,
  ShieldCheck,
  RotateCcw,
  User,
  AlertCircle,
  HelpCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Role } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

interface AIAssistantViewProps {
  currentRole: Role;
  currentStudentId: string;
  onAskAI: (message: string) => Promise<{ text: string; isFallback: boolean }>;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  currentRole,
  currentStudentId,
  onAskAI,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I am your AI Discipline Monitoring Assistant.

I assist authorized faculty, staff, and students in maintaining accurate records, identifying supportive administrative follow-ups, and promoting a respectful learning environment.

**Core Principles:**
- Grounded strictly in authorized application records.
- Distinguishes reported observations from verified facts.
- Advisory and educational; formal disciplinary decisions are strictly made by human staff.

How may I assist you today? You can select a sample inquiry below or enter your own query.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    {
      label: '1. Weekly Summary',
      prompt: "Summarize this week's incident reports.",
      roleBadge: 'Faculty / Admin',
    },
    {
      label: '2. Report Writing Guidance',
      prompt: 'Help me write a report about repeated classroom interruptions.',
      roleBadge: 'Faculty',
    },
    {
      label: '3. Overdue Follow-ups',
      prompt: 'Which follow-up tasks are overdue?',
      roleBadge: 'Admin / Faculty',
    },
    {
      label: '4. Student Correction Guide',
      prompt: 'I believe the attendance entry for Monday is incorrect. What can I do?',
      roleBadge: 'Student / All',
    },
    {
      label: '5. Constructive Support',
      prompt: 'A student has repeatedly arrived late. What should I do?',
      roleBadge: 'Faculty Mentor',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputPrompt('');
    setLoading(true);

    try {
      const res = await onAskAI(textToSend);
      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: res.isFallback,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error processing request: ${err?.message || 'Server communication error'}. Please verify backend connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'assistant',
        text: 'Session history cleared. How can I help you with your college records or discipline policies?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1e1b4b] to-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-600/30 border border-purple-400/40">
                <Bot className="h-5 w-5 text-purple-300" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">AI Discipline Assistant</h2>
              <span className="text-[11px] font-semibold bg-purple-950 text-purple-200 border border-purple-700/60 px-2 py-0.5 rounded">
                Powered by Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Provides neutral incident summaries, identifies overdue mentor follow-ups, and assists with constructive student support.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition border border-slate-700 inline-flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>
        </div>

        {/* Safeguard transparency pill */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-purple-200">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Active Role Filter: <strong className="uppercase font-semibold">{currentRole}</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            Human verification required for disciplinary decisions.
          </span>
        </div>
      </div>

      {/* Preset CIE-3 Sample Prompts */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            CIE-3 Benchmark Evaluation Scenarios (Click to test)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {samplePrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.prompt)}
              disabled={loading}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition bg-slate-50 text-xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800 group-hover:text-purple-900">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {item.roleBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                "{item.prompt}"
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Thread */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                    <span className="font-semibold">
                      {isUser ? 'You' : 'Discipline Assistant'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed font-sans">
                    {msg.text}
                  </div>

                  {msg.isFallback && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      <span>Deterministic rulebook fallback mode</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-500 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs ml-1 font-medium">Analyzing records & applying fairness rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/70 rounded-b-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask the Discipline Assistant about records, follow-ups, or college rules..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold transition shadow-md disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="text-[10px] text-slate-400 mt-2 text-center">
            Advisory records assistant • AI does not impose automatic punishments or penalties
          </div>
        </div>
      </div>
    </div>
  );
};
