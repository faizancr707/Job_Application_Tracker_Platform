import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, X, Send, Maximize2, Bot, MessageSquare } from 'lucide-react';
import { COPILOT_API_END_POINT } from '@/utils/constant';
import MarkdownRenderer from '../shared/MarkdownRenderer';

const QUICK_PROMPTS = [
  'What jobs match my profile?',
  'Tips for my next interview',
  'How to boost my application rate?',
];

const FloatingCopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I’m your **HireHub AI Copilot**. How can I help accelerate your job search today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  // Hide floating widget if user is already on the dedicated /ai/copilot page
  if (location.pathname === '/ai/copilot') {
    return null;
  }

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || streaming) return;

    if (!user) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: query },
        {
          role: 'assistant',
          content: 'Please **[log in](/login)** to use the AI Copilot with your saved profile and applications!',
        },
      ]);
      setInput('');
      return;
    }

    setInput('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: query },
      { role: 'assistant', content: '' },
    ]);
    setStreaming(true);

    try {
      const response = await fetch(`${COPILOT_API_END_POINT}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = 'Unable to connect to Copilot. Please try again.';
          return updated;
        });
        setStreaming(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === 'content') {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    last.content += parsed.data;
                  }
                  return [...updated];
                });
              } else if (parsed.type === 'error') {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last) last.content += `\n*Error: ${parsed.data}*`;
                  return [...updated];
                });
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = 'Something went wrong. Please try again later.';
        return updated;
      });
    }
    setStreaming(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 40, scale: 0.9, x: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-[360px] sm:w-[400px] h-[520px] bg-neu-base border border-white/30 rounded-3xl shadow-neu-raised-lg flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-neu-base/95 backdrop-blur-md border-b border-white/20 flex items-center justify-between shadow-neu-flat">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-burnt-orange-dim to-burnt-orange text-white flex items-center justify-center shadow-neu-btn">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal">HireHub Copilot</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-deep-green font-semibold">Live Assistant</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/ai/copilot')}
                  title="Expand to Full Copilot"
                  className="p-1.5 text-charcoal-muted hover:text-burnt-orange rounded-xl hover:shadow-neu-flat transition"
                >
                  <Maximize2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-charcoal-muted hover:text-terracotta rounded-xl hover:shadow-neu-flat transition"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-3 py-2 bg-neu-base-light/50 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-neu-base border border-white/25 text-charcoal-dim hover:text-burnt-orange shadow-neu-flat shrink-0"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>

            {/* Messages Container with Sequential Animations */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-burnt-orange-dim to-burnt-orange text-white shadow-neu-btn'
                        : 'bg-neu-base border border-white/30 text-charcoal shadow-neu-raised'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      msg.content ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="text-[11px] text-charcoal-muted">Thinking</span>
                          {[0, 1, 2].map((dot) => (
                            <motion.span
                              key={dot}
                              animate={{ y: [0, -3, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15 }}
                              className="w-1.5 h-1.5 rounded-full bg-burnt-orange"
                            />
                          ))}
                        </div>
                      )
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}

              {streaming && messages[messages.length - 1]?.role === 'user' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 px-3 py-2 bg-neu-base rounded-xl shadow-neu-flat border border-white/20 w-fit"
                >
                  <span className="text-[11px] text-charcoal-muted mr-1">Thinking</span>
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15 }}
                      className="w-1.5 h-1.5 rounded-full bg-burnt-orange"
                    />
                  ))}
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/20 bg-neu-base">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI Copilot..."
                  disabled={streaming}
                  className="flex-1 bg-gradient-to-br from-neu-base-dark to-neu-base-light border border-white/10 rounded-xl px-3 py-2 text-xs text-charcoal shadow-neu-inset-sm focus:outline-none focus:ring-1 focus:ring-burnt-orange placeholder:text-charcoal-dim/60 disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="p-2.5 bg-gradient-to-br from-burnt-orange-dim to-burnt-orange hover:from-burnt-orange hover:to-burnt-orange-hover text-white disabled:opacity-50 rounded-xl shadow-neu-btn hover:shadow-glow-orange transition shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button with Ambient Floating Animation */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.92 }}
        animate={!isOpen ? { y: [0, -4, 0] } : undefined}
        transition={
          !isOpen
            ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            : { type: 'spring', stiffness: 400, damping: 25 }
        }
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-burnt-orange-dim via-burnt-orange to-amber-600 text-white font-bold text-xs sm:text-sm shadow-neu-btn hover:shadow-glow-orange border border-white/30 cursor-pointer"
      >
        <Sparkles className="w-4 h-4 animate-spin-slow" />
        <span>{isOpen ? 'Close Copilot' : 'AI Copilot'}</span>
        <span className="w-2 h-2 rounded-full bg-lime-green animate-ping" />
      </motion.button>
    </div>
  );
};

export default FloatingCopilot;