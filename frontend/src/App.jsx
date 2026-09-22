import React, { useState, useEffect } from 'react';
import Sidebar from './components/Navigation/Sidebar';
import Header from './components/Navigation/Header';
import ChatContainer from './components/Chat/ChatContainer';
import KnowledgeBaseView from './components/KnowledgeBase/KnowledgeBaseView';
import RagExplorerView from './components/AdvancedRAG/RagExplorerView';
import AgentStudioView from './components/Tools/AgentStudioView';
import VisionView from './components/Vision/VisionView';
import SystemStatusView from './components/System/SystemStatusView';
import AuthPage from './components/Auth/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { checkSystemHealth } from './api/client';

function MainApp() {
  const { user, isAuthenticated, logout } = useAuth();

  const [currentTab, setCurrentTab] = useState('chat');
  const [chatMode, setChatMode] = useState('general'); // 'general', 'rag', 'agent'

  // Sessions state stored in localStorage
  const [chatSessions, setChatSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_assistant_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return chatSessions.length > 0 ? chatSessions[0].id : null;
  });

  const [currentMessages, setCurrentMessages] = useState([]);

  // System status
  const [systemStatus, setSystemStatus] = useState({
    connected: true,
    latency: 28,
    status: 200
  });

  // Initial health check
  useEffect(() => {
    checkSystemHealth().then(res => setSystemStatus(res));
    const interval = setInterval(() => {
      checkSystemHealth().then(res => setSystemStatus(res));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_assistant_sessions', JSON.stringify(chatSessions));
    } catch (e) {
      console.warn('Failed to save sessions:', e);
    }
  }, [chatSessions]);

  // Sync messages when activeSessionId changes
  useEffect(() => {
    if (!activeSessionId) {
      setCurrentMessages([]);
      return;
    }
    const session = chatSessions.find(s => s.id === activeSessionId);
    if (session) {
      setCurrentMessages(session.messages || []);
      if (session.mode) setChatMode(session.mode);
    }
  }, [activeSessionId]);

  const handleNewChat = () => {
    const newSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      mode: chatMode,
      messages: [],
      createdAt: new Date().toISOString()
    };
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setCurrentMessages([]);
    setCurrentTab('chat');
  };

  const handleUpdateSession = (updatedMsgs) => {
    let targetSessionId = activeSessionId;

    if (!targetSessionId) {
      const firstUserMsg = updatedMsgs.find(m => m.role === 'user');
      const title = firstUserMsg ? firstUserMsg.content.slice(0, 32) + '...' : 'New Chat';
      const newSession = {
        id: Date.now().toString(),
        title,
        mode: chatMode,
        messages: updatedMsgs,
        createdAt: new Date().toISOString()
      };
      setChatSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      return;
    }

    setChatSessions(prev =>
      prev.map(s => {
        if (s.id === targetSessionId) {
          const firstUserMsg = updatedMsgs.find(m => m.role === 'user');
          const title = firstUserMsg ? firstUserMsg.content.slice(0, 32) + '...' : s.title;
          return {
            ...s,
            title,
            messages: updatedMsgs,
            mode: chatMode
          };
        }
        return s;
      })
    );
  };

  const handleDeleteSession = (id) => {
    setChatSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setCurrentMessages([]);
    }
  };

  const handleClearCurrentChat = () => {
    setCurrentMessages([]);
    if (activeSessionId) {
      handleUpdateSession([]);
    }
  };

  // If user is not logged in, display the AuthPage (Signup & Login)
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        systemStatus={systemStatus}
        user={user}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-dark)' }}>
        <Header
          currentTab={currentTab}
          chatMode={chatMode}
          setChatMode={setChatMode}
          onClearChat={handleClearCurrentChat}
          systemStatus={systemStatus}
          user={user}
          onLogout={logout}
        />

        {/* Dynamic Tab Views */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {currentTab === 'chat' && (
            <ChatContainer
              messages={currentMessages}
              setMessages={setCurrentMessages}
              chatMode={chatMode}
              setChatMode={setChatMode}
              onUpdateSession={handleUpdateSession}
            />
          )}

          {currentTab === 'knowledge' && (
            <KnowledgeBaseView />
          )}

          {currentTab === 'rag-studio' && (
            <RagExplorerView />
          )}

          {currentTab === 'agent-tools' && (
            <AgentStudioView />
          )}

          {currentTab === 'vision' && (
            <VisionView />
          )}

          {currentTab === 'system' && (
            <SystemStatusView 
              systemStatus={systemStatus}
              setSystemStatus={setSystemStatus}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
