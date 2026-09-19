import React, { useState } from 'react';
import { User, Sparkles, Copy, Check, Bot, Search, Terminal } from 'lucide-react';
import { renderMarkdown } from '../../utils/markdown';
import SourceCard from './SourceCard';
import AgentTimeline from './AgentTimeline';

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getModeBadge = (mode) => {
    if (mode === 'rag') {
      return (
        <span className="badge badge-indigo">
          <Search size={11} />
          RAG Synthesized
        </span>
      );
    }
    if (mode === 'agent') {
      return (
        <span className="badge badge-cyan">
          <Bot size={11} />
          Agent Tools
        </span>
      );
    }
    return (
      <span className="badge badge-emerald">
        <Sparkles size={11} />
        Gemini 3.6
      </span>
    );
  };

  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      alignItems: 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
      margin: '18px 0',
      width: '100%',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      {/* Avatar */}
      <div style={{
        width: '36px',
        height: '36px',
        minWidth: '36px',
        borderRadius: '10px',
        background: isUser ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'var(--grad-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isUser ? '0 2px 10px rgba(59, 130, 246, 0.3)' : '0 2px 12px rgba(99, 102, 241, 0.35)'
      }}>
        {isUser ? <User size={18} color="#fff" /> : <Sparkles size={18} color="#fff" />}
      </div>

      {/* Message Body */}
      <div style={{
        maxWidth: isUser ? '75%' : '85%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start'
      }}>
        {/* Header meta */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isUser ? '#93c5fd' : '#c7d2fe' }}>
            {isUser ? 'You' : 'Knowledge Assistant'}
          </span>
          {!isUser && message.mode && getModeBadge(message.mode)}
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>

        {/* Card Bubble */}
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isUser ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card)',
          border: isUser ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-subtle)',
          backdropFilter: 'blur(12px)',
          boxShadow: isUser ? '0 4px 16px rgba(0, 0, 0, 0.2)' : 'var(--shadow-md)',
          width: '100%',
          position: 'relative'
        }}>
          {/* Agent execution timeline if available */}
          {message.planData && (
            <AgentTimeline planData={message.planData} />
          )}

          {/* Rendered Text */}
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />

          {/* Expandable Source citations if available */}
          {message.sources && message.sources.length > 0 && (
            <SourceCard sources={message.sources} queryDetails={message.queryDetails} />
          )}

          {/* Action footer */}
          {!isUser && message.content && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: '8px',
              paddingTop: '6px',
              borderTop: '1px solid rgba(255, 255, 255, 0.04)'
            }}>
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  transition: 'color var(--transition-fast)'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                title="Copy response"
              >
                {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
