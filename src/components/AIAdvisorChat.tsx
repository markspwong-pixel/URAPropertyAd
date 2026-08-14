import React, { useState, useRef, useEffect } from 'react';
import { PropertyListing, InvestorObjective, BuyerProfileType } from '../types/property';
import { SINGAPORE_PROPERTIES } from '../data/singaporeProperties';
import { askAdvisor } from '../services/api';
import { 
  MessageSquareCode, 
  Send, 
  Sparkles, 
  User, 
  Building2, 
  ShieldCheck, 
  Compass, 
  Trash2,
  RefreshCw,
  Info
} from 'lucide-react';

interface AIAdvisorChatProps {
  selectedProperty: PropertyListing | null;
  investorObjective: InvestorObjective;
  buyerProfile: BuyerProfileType;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'advisor';
  text: string;
  timestamp: string;
}

export const AIAdvisorChat: React.FC<AIAdvisorChatProps> = ({
  selectedProperty,
  investorObjective,
  buyerProfile
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'advisor',
      text: `Hello. I am your Senior Property Investment Advisor for Singapore real estate.

I provide grounded, data-disciplined investment advice separating **[FACT]** (URA/IRAS authoritative data), **[CALCULATION]** (IRAS Stamp Duties & Net Yields), and **[ESTIMATE]** (Fair Value ranges & Balas curve leasehold decay).

Currently tailored for:
- **Buyer Profile:** ${buyerProfile}
- **Investment Objective:** ${investorObjective}
${selectedProperty ? `- **Active Property Context:** ${selectedProperty.name} ($${selectedProperty.askingPsf} PSF, Asking $${(selectedProperty.askingPrice / 1000000).toFixed(2)}M)` : ''}

How can I advise on your acquisition, disposal, rental, or valuation decision today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachedProperty, setAttachedProperty] = useState<PropertyListing | null>(selectedProperty);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedProperty) {
      setAttachedProperty(selectedProperty);
    }
  }, [selectedProperty]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const promptShortcuts = [
    {
      title: 'CCR vs RCR Yield & Growth',
      query: 'Compare investing $2.5M into a prime CCR 99-year luxury condo (e.g. Marina One) vs a freehold RCR condo (e.g. The Continuum). Which offers superior risk-adjusted net cash flow and exit liquidity?'
    },
    {
      title: 'Commercial Shophouse (0% ABSD)',
      query: 'Evaluate buying a commercial shophouse in Tanjong Pagar / D02 versus a 2nd residential property under 20% ABSD. Walk through the cash outlay, GST, financing LTV, and net yield implications.'
    },
    {
      title: 'Leasehold Decay & Balas Curve',
      query: 'How does the remaining 70-year lease on an OCR condominium affect exit value versus a freehold counterpart over a 10-year holding period?'
    },
    {
      title: 'TDSR & Mortgage Stress Test',
      query: 'With MAS 55% TDSR and current interest rates at 3.5%, what is the maximum recommended gearing and minimum gross rental yield needed to achieve positive cash flow?'
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsSending(true);

    try {
      const response = await askAdvisor({
        message: query,
        propertyContext: attachedProperty,
        investorProfile: {
          objective: investorObjective,
          buyerProfile
        }
      });

      const advisorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'advisor',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, advisorMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'advisor',
        text: `⚠️ Advisory Communication Error: ${err.message || 'Unable to connect to advisory engine. Please retry.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-white backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                GEMINI 3.7 FLASH REASONING ENGINE
              </span>
              <span className="text-xs text-slate-400">Strict Singapore Property Investment Discipline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Senior Property Investment Advisor
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Direct, analytical, and institutional advisory on any Singapore acquisition, disposal, or rental strategy. Dissects micro-market pricing, ABSD taxation, yield compression, and leasehold amortization.
            </p>
          </div>

          {/* Attached Context Selector */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <select
              value={attachedProperty?.id || ''}
              onChange={(e) => {
                const found = SINGAPORE_PROPERTIES.find(p => p.id === e.target.value);
                setAttachedProperty(found || null);
              }}
              className="bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-white/10 focus:outline-none cursor-pointer"
            >
              <option value="">No Property Attached (Macro Mode)</option>
              {SINGAPORE_PROPERTIES.map(p => (
                <option key={p.id} value={p.id}>{p.name} (D{p.district})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Prompt Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {promptShortcuts.map((sc, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(sc.query)}
            className="p-4 bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 rounded-2xl text-left text-xs space-y-1.5 backdrop-blur-md shadow-lg transition-all group cursor-pointer"
          >
            <div className="font-bold text-white group-hover:text-emerald-400 flex items-center justify-between">
              <span>{sc.title}</span>
              <Compass className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
            </div>
            <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{sc.query}</p>
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col h-[600px]">
        {/* Chat Ribbon */}
        <div className="bg-white/5 border-b border-white/10 px-6 py-3.5 flex items-center justify-between text-xs text-slate-300 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="font-semibold text-white">Senior Property Advisor Online</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Targeting: <strong className="text-slate-200">{investorObjective}</strong></span>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'advisor' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 shadow-lg">
                  SG
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl px-5 py-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-100 rounded-tr-xs shadow-lg'
                    : 'bg-slate-950/60 border border-white/10 text-slate-200 rounded-tl-xs whitespace-pre-wrap backdrop-blur-md shadow-lg'
                }`}
              >
                <div className="font-sans whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    msg.sender === 'user' ? 'text-emerald-300/70 text-right' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 animate-pulse">
                SG
              </div>
              <div className="bg-slate-950/60 border border-white/10 rounded-2xl rounded-tl-xs px-5 py-3.5 text-xs text-slate-400 flex items-center gap-2 backdrop-blur-md shadow-lg">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Advisor is evaluating transaction comparables, yields, and regulatory rules...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask the Senior Property Advisor (e.g. 'Evaluate D15 vs D05 for capital growth under 3.5% yield requirement')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isSending}
              className="flex-1 px-4 py-3 bg-slate-950/50 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isSending}
              className="p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4 font-bold" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
