import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Search, Bot, Loader2, AlertCircle, ArrowDown } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { streamChat, fastChat, advancedRagChat, planAndExecuteAgent } from '../../api/client';

export default function ChatContainer({ 
  messages, 
  setMessages, 
  chatMode, 
  setChatMode, 
  onUpdateSession 
}) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    { text: 'What is Artificial Intelligence?', mode: 'general' },
    { text: 'What is photosynthesis and cellular respiration?', mode: 'rag' },
    { text: 'What is the weather in Rohtak and add 20 + 30?', mode: 'agent' },
    { text: 'Explain difference between supervised and unsupervised learning', mode: 'general' }
  ];

  const handleSend = async (customPrompt = null) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    setError(null);
    setInput('');

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    onUpdateSession(updatedMessages);
    setLoading(true);

    const aiMessageId = (Date.now() + 1).toString();

    // 1. General AI Mode (Streaming)
    if (chatMode === 'general') {
      let accumulatedText = '';
      
      const initialAiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        mode: 'general',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, initialAiMessage]);

      abortControllerRef.current = new AbortController();

      try {
        await streamChat(
          textToSend,
          (chunk) => {
            accumulatedText += chunk;
            setMessages(prev =>
              prev.map(m => m.id === aiMessageId ? { ...m, content: accumulatedText } : m)
            );
          },
          () => {
            setLoading(false);
            setMessages(prev => {
              const finalMsgs = prev.map(m => m.id === aiMessageId ? { ...m, content: accumulatedText } : m);
              onUpdateSession(finalMsgs);
              return finalMsgs;
            });
          },
          async (err) => {
            console.warn('Stream failed, falling back to fastChat', err);
            try {
              const fastAns = await fastChat(textToSend);
              setMessages(prev => {
                const finalMsgs = prev.map(m => m.id === aiMessageId ? { ...m, content: fastAns } : m);
                onUpdateSession(finalMsgs);
                return finalMsgs;
              });
            } catch (fallbackErr) {
              setError(fallbackErr.message || 'Failed to get response');
            } finally {
              setLoading(false);
            }
          },
          abortControllerRef.current.signal
        );
      } catch (err) {
        setError(err.message || 'Communication error');
        setLoading(false);
      }
    } 
    // 2. Advanced RAG Mode
    else if (chatMode === 'rag') {
      try {
        const ragData = await advancedRagChat(textToSend);
        const aiMessage = {
          id: aiMessageId,
          role: 'assistant',
          content: ragData.answer || 'No relevant information found in knowledge base.',
          sources: ragData.results || [],
          queryDetails: {
            rewrittenQuery: ragData.rewrittenQuery,
            expandedQueries: ragData.expandedQueries
          },
          mode: 'rag',
          timestamp: new Date().toISOString()
        };
        const finalMsgs = [...updatedMessages, aiMessage];
        setMessages(finalMsgs);
        onUpdateSession(finalMsgs);
      } catch (err) {
        setError(`RAG Retrieval error: ${err.message}. Ensure documents are indexed.`);
        const errMessage = {
          id: aiMessageId,
          role: 'assistant',
          content: 'Unable to retrieve relevant chunks from knowledge base. Please make sure the MongoDB vector index is populated.',
          mode: 'rag',
          timestamp: new Date().toISOString()
        };
        setMessages([...updatedMessages, errMessage]);
      } finally {
        setLoading(false);
      }
    } 
    // 3. Autonomous AI Agent Mode
    else if (chatMode === 'agent') {
      try {
        const agentData = await planAndExecuteAgent(textToSend);
        
        let synthesizedAnswer = '';
        if (agentData.result && agentData.result.length > 0) {
          const resultsSummary = agentData.result
            .map(r => `**${r.tool}** returned: \`${JSON.stringify(r.result)}\``)
            .join('\n- ');
          synthesizedAnswer = `### Autonomous Agent Results:\nI executed the planned tool calls successfully:\n- ${resultsSummary}\n\nAll tools executed according to the dynamically planned schedule.`;
        } else {
          synthesizedAnswer = `I processed your request using the agent tool planner.`;
        }

        const aiMessage = {
          id: aiMessageId,
          role: 'assistant',
          content: synthesizedAnswer,
          planData: agentData,
          mode: 'agent',
          timestamp: new Date().toISOString()
        };

        const finalMsgs = [...updatedMessages, aiMessage];
        setMessages(finalMsgs);
        onUpdateSession(finalMsgs);
      } catch (err) {
        setError(`Agent planning failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 68px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Scrollable Message List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 32px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto',
            maxWidth: '680px',
            textAlign: 'center',
            padding: '40px 20px',
            animation: 'fadeIn 0.4s ease-out'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Sparkles size={32} color="#fff" />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px', color: '#fff' }}>
              How can I assist your knowledge search today?
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.5 }}>
              Choose a mode above for Real-time Streaming, Multi-stage RAG with Vector Search, or Autonomous Function Calling Agents.
            </p>

            {/* Quick Prompt Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
              textAlign: 'left'
            }}>
              {quickPrompts.map((qp, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setChatMode(qp.mode);
                    handleSend(qp.text);
                  }}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--border-focus)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                  }}
                >
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: qp.mode === 'rag' ? '#818cf8' : qp.mode === 'agent' ? '#22d3ee' : '#34d399',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {qp.mode === 'rag' ? <Search size={11} /> : qp.mode === 'agent' ? <Bot size={11} /> : <Sparkles size={11} />}
                    <span>{qp.mode === 'rag' ? 'RAG Search' : qp.mode === 'agent' ? 'Agent Tools' : 'General AI'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 500 }}>
                    "{qp.text}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                margin: '18px 0',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--grad-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Loader2 size={18} color="#fff" className="animate-spin" />
                </div>
                <div style={{
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>
                    {chatMode === 'rag' 
                      ? 'Performing query expansion & vector retrieval...' 
                      : chatMode === 'agent' 
                      ? 'Agent decomposing intent & executing registered tools...' 
                      : 'Gemini generating response...'}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontSize: '0.84rem',
                margin: '12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area Bar */}
      <div style={{
        padding: '16px 32px 24px',
        backgroundColor: 'rgba(7, 9, 14, 0.85)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 8px 6px 16px',
            boxShadow: 'var(--shadow-md)',
            transition: 'border-color var(--transition-fast)'
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                chatMode === 'rag' 
                  ? 'Ask anything from your Knowledge Base (e.g. What is photosynthesis?)...' 
                  : chatMode === 'agent' 
                  ? 'Ask agent with tools (e.g. What is the weather in Rohtak and add 20 + 30?)...' 
                  : 'Ask Gemini anything (Enter to send, Shift+Enter for newline)...'
              }
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '0.92rem',
                fontFamily: 'inherit',
                resize: 'none',
                padding: '6px 0',
                lineHeight: 1.4,
                maxHeight: '140px'
              }}
            />

            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: input.trim() && !loading ? 'var(--grad-primary)' : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all var(--transition-fast)',
                boxShadow: input.trim() && !loading ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none'
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
            padding: '0 4px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Mode: <strong style={{ color: '#c7d2fe' }}>{chatMode.toUpperCase()}</strong></span>
              <span>•</span>
              <span>Backend: <strong style={{ color: '#34d399' }}>Live</strong></span>
            </div>
            <span>Powered by Gemini 3.5 & 3.6 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
}
