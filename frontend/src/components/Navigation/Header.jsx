import React from 'react';
import { Sparkles, Terminal, BookOpen, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export default function Header({ currentTab, chatMode, setChatMode, onClearChat, systemStatus }) {
  const titles = {
    chat: {
      title: 'AI Knowledge Assistant',
      desc: 'Multimodal conversational intelligence with streaming & RAG synthesis',
      icon: Sparkles
    },
    knowledge: {
      title: 'Knowledge Base & PDF RAG',
      desc: 'Chunking, MongoDB Atlas Vector Search embeddings & similarity retrieval',
      icon: BookOpen
    },
    'rag-studio': {
      title: 'Advanced RAG Pipeline Studio',
      desc: 'Query Rewriting, Multi-Query Expansion & Hybrid Reciprocal Rank Fusion (RRF)',
      icon: Terminal
    },
    'agent-tools': {
      title: 'Autonomous AI Agent Studio',
      desc: 'Function calling, tool registry execution loop & dynamic planning breakdown',
      icon: Zap
    },
    vision: {
      title: 'Multimodal Vision Analysis',
      desc: 'Deep image understanding & structured extraction via Gemini 3.6 Flash',
      icon: Sparkles
    },
    system: {
      title: 'System Health & Architecture Status',
      desc: 'Real-time telemetry for Express API, Gemini Models, and Vector Database',
      icon: ShieldCheck
    }
  };

  const current = titles[currentTab] || titles.chat;
  const Icon = current.icon;

  return (
    <header style={{
      height: '68px',
      minHeight: '68px',
      backgroundColor: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={18} color="#818cf8" />
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
            {current.title}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {current.desc}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* If on Chat tab, show Mode Switcher */}
        {currentTab === 'chat' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px',
            gap: '2px'
          }}>
            <button
              onClick={() => setChatMode('general')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: chatMode === 'general' ? 'var(--accent-primary)' : 'transparent',
                color: chatMode === 'general' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              General AI (Stream)
            </button>
            <button
              onClick={() => setChatMode('rag')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: chatMode === 'rag' ? 'var(--accent-secondary)' : 'transparent',
                color: chatMode === 'rag' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              🔍 RAG Search
            </button>
            <button
              onClick={() => setChatMode('agent')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: chatMode === 'agent' ? '#0891b2' : 'transparent',
                color: chatMode === 'agent' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              🤖 Agent Mode
            </button>
          </div>
        )}

        {/* System Latency Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.74rem',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)'
        }}>
          <span className={`status-dot ${systemStatus.connected ? 'active' : 'danger'}`} />
          <span>{systemStatus.latency ? `${systemStatus.latency}ms` : 'Ready'}</span>
        </div>

        {/* Clear Chat button */}
        {currentTab === 'chat' && (
          <button
            onClick={onClearChat}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <RefreshCw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </header>
  );
}
