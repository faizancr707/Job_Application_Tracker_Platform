import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiSend, FiPlus, FiMessageSquare, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { COPILOT_API_END_POINT } from '../../utils/constant';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import Navbar from '../shared/Navbar';
import {
  setCopilotSessions, setCurrentSessionId, setCurrentMessages,
  addMessage, appendToLastMessage,
} from '../../redux/aiSlice';

const CopilotChat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { copilotSessions, currentSessionId, currentMessages } = useSelector(s => s.ai);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSessions();
  }, [user]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentMessages]);

  const fetchSessions = async () => {
    try {
      const { data } = await axios.get(`${COPILOT_API_END_POINT}/sessions`, { withCredentials: true });
      if (data.success) dispatch(setCopilotSessions(data.data));
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const loadSession = async (sessionId) => {
    dispatch(setCurrentSessionId(sessionId));
    try {
      const { data } = await axios.get(`${COPILOT_API_END_POINT}/sessions/${sessionId}`, { withCredentials: true });
      if (data.success) dispatch(setCurrentMessages(data.data.map(m => ({ role: m.role, content: m.content }))));
    } catch {}
  };

  const newSession = () => {
    dispatch(setCurrentSessionId(null));
    dispatch(setCurrentMessages([]));
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${COPILOT_API_END_POINT}/sessions/${sessionId}`, { withCredentials: true });
      dispatch(setCopilotSessions(copilotSessions.filter(s => s.sessionId !== sessionId)));
      if (currentSessionId === sessionId) newSession();
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const message = input.trim();
    setInput('');
    dispatch(addMessage({ role: 'user', content: message }));
    dispatch(addMessage({ role: 'assistant', content: '' }));
    setStreaming(true);

    try {
      const response = await fetch(`${COPILOT_API_END_POINT}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message, sessionId: currentSessionId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = 'Failed to get response. Please try again.';
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.message || errorMsg;
        } catch {}
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        dispatch(appendToLastMessage(`\n\n*Error: ${errorMsg}*`));
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
              if (parsed.type === 'session') {
                dispatch(setCurrentSessionId(parsed.sessionId));
              } else if (parsed.type === 'content') {
                dispatch(appendToLastMessage(parsed.data));
              } else if (parsed.type === 'error') {
                dispatch(appendToLastMessage(`\n\n*Error: ${parsed.data}*`));
              } else if (parsed.type === 'done') {
                fetchSessions();
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      dispatch(appendToLastMessage('\n\n*Error: Failed to get response. Please try again.*'));
    }
    setStreaming(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neu-base text-charcoal flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        {/* Neumorphic Sidebar */}
        {sidebarOpen && (
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} className="w-72 border-r border-white/20 bg-neu-base flex flex-col shadow-neu-flat">
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="text-xs text-charcoal-muted hover:text-burnt-orange font-bold flex items-center gap-1.5 transition"
              >
                <FiArrowLeft /> Back to Home
              </button>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neu-base text-burnt-orange border border-burnt-orange/20 shadow-neu-flat">
                AI Copilot
              </span>
            </div>

            <div className="p-4">
              <button
                onClick={newSession}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-burnt-orange-dim to-burnt-orange hover:from-burnt-orange hover:to-burnt-orange-hover text-white rounded-neu text-sm font-bold shadow-neu-btn hover:shadow-glow-orange transition"
              >
                <FiPlus /> New Conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1.5">
              <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-charcoal-dim">Recent Chats</p>
              {copilotSessions.map(s => {
                const isActive = currentSessionId === s.sessionId;
                return (
                  <div
                    key={s.sessionId}
                    onClick={() => loadSession(s.sessionId)}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-sm transition ${
                      isActive
                        ? 'bg-neu-base text-burnt-orange font-bold shadow-neu-inset-xs border border-burnt-orange/20'
                        : 'hover:shadow-neu-flat text-charcoal-muted hover:text-charcoal'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate flex-1">
                      <FiMessageSquare className="shrink-0 text-burnt-orange" />
                      <span className="truncate">{(s.firstMessage || 'New chat').substring(0, 26)}</span>
                    </div>
                    <button
                      onClick={(e) => deleteSession(s.sessionId, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-terracotta p-1 transition"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
          <div className="border-b border-white/20 bg-neu-base/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shadow-neu-flat">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl text-charcoal-muted hover:text-burnt-orange shadow-neu-flat hover:shadow-neu-raised-xs border border-white/20 transition"
              >
                <FiMessageSquare size={18} />
              </button>
              <h1 className="text-base font-extrabold text-charcoal">AI Career Copilot</h1>
            </div>
            <span className="text-xs font-bold text-deep-green bg-lime-green-light px-3 py-1 rounded-full border border-lime-green/30 shadow-neu-flat">
              ● Intelligent Mode Active
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {currentMessages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 max-w-lg p-8 bg-neu-base border border-white/25 rounded-neu-lg shadow-neu-raised">
                  <div className="text-5xl">🤖</div>
                  <h2 className="text-2xl font-extrabold text-charcoal">How can I help your career today?</h2>
                  <p className="text-charcoal-muted text-sm leading-relaxed font-normal">
                    Ask me anything about your job applications, resume optimization, interview answers, or industry skill recommendations.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {[
                      'What jobs match my resume?',
                      'Analyze my applied jobs status',
                      'What skills are most in demand for Full Stack?',
                      'How can I prepare for a React interview?'
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="text-xs px-3.5 py-2 border border-white/25 rounded-full bg-neu-base shadow-neu-flat hover:shadow-neu-raised-xs hover:text-burnt-orange text-charcoal font-semibold transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-neu px-5 py-3.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-burnt-orange-dim to-burnt-orange text-white shadow-neu-btn'
                      : 'bg-neu-base border border-white/25 text-charcoal shadow-neu-raised'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownRenderer content={msg.content || 'Thinking...'} />
                  ) : (
                    <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Inset Neumorphic Input area */}
          <div className="border-t border-white/20 bg-neu-base p-4 shadow-neu-flat">
            <div className="flex items-center gap-3 max-w-3xl mx-auto">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask your AI Career Copilot..."
                disabled={streaming}
                className="flex-1 bg-gradient-to-br from-neu-base-dark to-neu-base-light border border-white/10 rounded-neu px-4 py-3 text-sm text-charcoal shadow-neu-inset-sm focus:outline-none focus:ring-2 focus:ring-burnt-orange placeholder:text-charcoal-dim/60 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={streaming || !input.trim()}
                className="p-3.5 bg-gradient-to-br from-burnt-orange-dim to-burnt-orange hover:from-burnt-orange hover:to-burnt-orange-hover text-white disabled:opacity-50 rounded-xl transition shadow-neu-btn hover:shadow-glow-orange active:shadow-neu-btn-active"
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopilotChat;
