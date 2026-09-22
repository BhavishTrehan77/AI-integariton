import React from 'react';
import { 
  MessageSquare, 
  FileText, 
  Search, 
  Bot, 
  Image as ImageIcon, 
  Activity, 
  Plus, 
  Trash2,
  Cpu,
  Layers,
  Sparkles,
  LogOut
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  chatSessions, 
  activeSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession,
  systemStatus,
  user,
  onLogout
}) {
  const navItems = [
    { id: 'chat', label: 'Main Chat', icon: MessageSquare, badge: 'Core' },
    { id: 'knowledge', label: 'Knowledge Base', icon: FileText, badge: 'PDF RAG' },
    { id: 'rag-studio', label: 'Advanced RAG', icon: Search, badge: 'RRF Hybrid' },
    { id: 'agent-tools', label: 'AI Agent & Tools', icon: Bot, badge: 'Function Call' },
    { id: 'vision', label: 'Vision (Multimodal)', icon: ImageIcon, badge: 'Gemini 3.6' },
    { id: 'system', label: 'System & Status', icon: Activity, badge: systemStatus.connected ? 'Online' : 'Offline' },
  ];

  return (
    <aside style={{
      width: '280px',
      minWidth: '280px',
      height: '100%',
      backgroundColor: 'var(--bg-primary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
      zIndex: 20
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--grad-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
        }}>
          <Sparkles size={20} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
            AI Assistant
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span className={`status-dot ${systemStatus.connected ? 'active' : 'danger'}`} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {systemStatus.connected ? 'Express v1 Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div style={{ padding: '16px 16px 8px 16px' }}>
        <button
          onClick={onNewChat}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#c7d2fe',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.35) 0%, rgba(139, 92, 246, 0.35) 100%)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ 
          fontSize: '0.68rem', 
          textTransform: 'uppercase', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          padding: '6px 8px 4px',
          letterSpacing: '0.06em'
        }}>
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--border-glow)' : '1px solid transparent',
                fontSize: '0.86rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left'
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={17} color={isActive ? '#818cf8' : '#94a3b8'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '0.66rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#c7d2fe' : 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Chat History Section */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '12px', 
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          fontSize: '0.68rem', 
          textTransform: 'uppercase', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          padding: '4px 8px 8px',
          letterSpacing: '0.06em'
        }}>
          Recent History
        </div>

        {chatSessions.length === 0 ? (
          <div style={{ 
            fontSize: '0.78rem', 
            color: 'var(--text-muted)', 
            padding: '12px 8px',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            No recent sessions
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {chatSessions.map((session) => {
              const isSelected = activeSessionId === session.id && currentTab === 'chat';
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    setCurrentTab('chat');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '180px'
                  }}>
                    {session.title || 'Untitled Chat'}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.6
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.color = '#fb7185';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '0.6';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                    title="Delete Chat"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logged-in User Profile & Sign Out */}
      {user && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
            }}>
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#f8fafc',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user.name || user.email}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user.email}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fb7185';
              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
              e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      )}

      {/* Backend & Environment Footer */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        fontSize: '0.74rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>API Gateway</span>
          <span style={{ color: '#818cf8', fontFamily: 'var(--font-mono)' }}>:3000/api/v1</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Vector Index</span>
          <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>vector_index</span>
        </div>
      </div>
    </aside>
  );
}
