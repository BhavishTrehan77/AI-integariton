import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Bot, 
  BookOpen, 
  Zap, 
  Terminal,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage() {
  const { login, signup, loading: authLoading } = useAuth();

  // Mode: 'login' or 'signup'
  const [mode, setMode] = useState('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFeedback = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSwitchMode = (targetMode) => {
    resetFeedback();
    setMode(targetMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetFeedback();

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter your password.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        // Call signup via Axios
        await signup(name, email, password);
        setSuccessMessage('Account created successfully! Logging you in...');
        
        // Auto-login right after signup for seamless experience
        setTimeout(async () => {
          try {
            await login(email, password);
          } catch (loginErr) {
            setSuccessMessage('Account created! Please sign in with your credentials.');
            setMode('login');
            setIsSubmitting(false);
          }
        }, 800);
      } else {
        // Call login via Axios
        await login(email, password);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'Multimodal Conversational AI',
      desc: 'Real-time streaming with Gemini Flash & markdown rendering'
    },
    {
      icon: BookOpen,
      title: 'Atlas Vector Search RAG',
      desc: 'Smart PDF chunking and similarity retrieval pipeline'
    },
    {
      icon: Terminal,
      title: 'Advanced Query Expansion',
      desc: 'Multi-query rewriting & hybrid reciprocal rank fusion'
    },
    {
      icon: Zap,
      title: 'Autonomous Tool Agent Loop',
      desc: 'Dynamic function calling & tool execution registry'
    }
  ];

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-dark)',
      backgroundImage: `
        radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 40%),
        radial-gradient(circle at 85% 80%, rgba(139, 92, 246, 0.16) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 60%)
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      color: 'var(--text-primary)'
    }}>
      {/* Background Grid Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        opacity: 0.6
      }} />

      {/* Main Auth Container */}
      <div style={{
        width: '100%',
        maxWidth: '1020px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        backgroundColor: 'rgba(11, 15, 25, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden'
      }}>

        {/* Left Side: Brand & Feature Showcase */}
        <div style={{
          padding: '44px 36px',
          background: 'linear-gradient(180deg, rgba(18, 24, 38, 0.8) 0%, rgba(11, 15, 25, 0.95) 100%)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '32px'
        }}>
          <div>
            {/* Top Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--grad-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.45)'
              }}>
                <Sparkles size={24} color="#ffffff" />
              </div>
              <div>
                <h1 style={{
                  fontSize: '1.28rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                  lineHeight: 1.15
                }}>
                  AI Knowledge Assistant
                </h1>
                <span style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  letterSpacing: '0.02em'
                }}>
                  Enterprise Multimodal & RAG Platform
                </span>
              </div>
            </div>

            {/* Tagline */}
            <p style={{
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '28px'
            }}>
              Connect, synthesize, and converse with high-speed AI pipelines backed by vector search and autonomous tool loops.
            </p>

            {/* Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{
                      marginTop: '2px',
                      padding: '6px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
                        {feat.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {feat.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.76rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot active" />
              <span style={{ color: 'var(--text-secondary)' }}>Express Auth Gateway</span>
            </div>
            <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>:3000/api/auth</span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div style={{
          padding: '44px 38px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Segmented Mode Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-secondary)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '28px'
          }}>
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'login' ? 'var(--grad-primary)' : 'transparent',
                color: mode === 'login' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: mode === 'login' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
              }}
            >
              <Lock size={15} />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('signup')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'signup' ? 'var(--grad-primary)' : 'transparent',
                color: mode === 'signup' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: mode === 'signup' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
              }}
            >
              <Sparkles size={15} />
              Create Account
            </button>
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: '22px' }}>
            <h2 style={{ fontSize: '1.38rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
              {mode === 'login' ? 'Welcome back' : 'Get started with AI'}
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {mode === 'login' 
                ? 'Sign in to access your chat sessions, knowledge bases, and tools.' 
                : 'Create an account to explore vector search, RAG pipelines, and agent tools.'}
            </p>
          </div>

          {/* Alert Error Message */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fb7185',
              fontSize: '0.84rem',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={17} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                title="Dismiss error"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fb7185',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.8
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Alert Success Message */}
          {successMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '0.84rem',
              marginBottom: '20px'
            }}>
              <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  transition: 'border-color var(--transition-fast)'
                }}>
                  <User size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      padding: '11px 12px',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 12px',
                transition: 'border-color var(--transition-fast)'
              }}>
                <Mail size={16} color="var(--text-muted)" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '11px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Password
                </label>
                {mode === 'signup' && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Min. 6 characters
                  </span>
                )}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 12px',
                transition: 'border-color var(--transition-fast)'
              }}>
                <Lock size={16} color="var(--text-muted)" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '11px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Confirm Password
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  transition: 'border-color var(--transition-fast)'
                }}>
                  <ShieldCheck size={16} color="var(--text-muted)" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      padding: '11px 12px',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '13px 20px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--grad-primary)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: (isSubmitting || authLoading) ? 'not-allowed' : 'pointer',
                opacity: (isSubmitting || authLoading) ? 0.75 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {isSubmitting || authLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Workspace' : 'Complete Registration'}</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch Link */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}>
            {mode === 'login' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signup')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Create one here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Sign in here
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
