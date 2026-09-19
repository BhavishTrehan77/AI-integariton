import React, { useState } from 'react';
import { 
  Bot, 
  Cpu, 
  CloudRain, 
  Calculator, 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  Loader2, 
  AlertCircle,
  Play
} from 'lucide-react';
import { planAndExecuteAgent, runWeatherTool } from '../../api/client';

export default function AgentStudioView() {
  const [query, setQuery] = useState('What is the weather in Rohtak and add 20 + 30?');
  const [loading, setLoading] = useState(false);
  const [agentResult, setAgentResult] = useState(null);
  const [error, setError] = useState(null);

  const presets = [
    'What is the weather in Rohtak and add 20 + 30?',
    'What is the weather in Mumbai and add 125 + 75?',
    'Calculate 450 + 550 using addNumbers tool',
    'Get weather information for London'
  ];

  const handleRunAgent = async (customQuery = null) => {
    const q = customQuery || query;
    if (!q.trim() || loading) return;

    setLoading(true);
    setError(null);
    setAgentResult(null);

    try {
      const data = await planAndExecuteAgent(q);
      setAgentResult(data);
    } catch (err) {
      setError(err.message || 'Agent planning execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '24px 32px',
      overflowY: 'auto',
      height: 'calc(100vh - 68px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--grad-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.35)'
          }}>
            <Bot size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              Autonomous AI Agent & Tool Registry
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Dynamic planning agent that breaks complex queries into executable tool calls, invokes external APIs, and synthesizes answers.
            </p>
          </div>
        </div>

        {/* Tool badges */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-cyan">
            <CloudRain size={12} />
            getWeather
          </span>
          <span className="badge badge-emerald">
            <Calculator size={12} />
            addNumbers
          </span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRunAgent()}
            placeholder="Ask agent with multi-tool requirements (e.g. What is the weather in Rohtak and add 20 + 30?)..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
          <button
            onClick={() => handleRunAgent()}
            disabled={loading || !query.trim()}
            style={{
              padding: '0 24px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--grad-cyan)',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            <span>Execute Agent</span>
          </button>
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(p);
                handleRunAgent(p);
              }}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fb7185',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Agent Activity Execution Breakdown */}
      {agentResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
          {/* Main Flow Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="#22d3ee" />
              Agent Activity Execution Flow
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'var(--bg-secondary)',
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              {/* Step 1: Thinking & Planning */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
                    Thinking & Plan Synthesis
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    (Gemini 3.5 Flash decomposed intent into {agentResult.plan?.length || 0} discrete steps)
                  </span>
                </div>
              </div>

              {/* Step 2: Executed Tools */}
              {(agentResult.plan || []).map((step, idx) => {
                const executed = (agentResult.result || []).find(r => r.tool === step.tool);
                const isWeather = step.tool.toLowerCase().includes('weather');

                return (
                  <div key={idx} style={{
                    marginLeft: '6px',
                    padding: '12px 14px',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          color: isWeather ? '#38bdf8' : '#34d399'
                        }}>
                          ✓ {step.tool}({JSON.stringify(step.args).replace(/[{}]/g, '')})
                        </span>
                      </div>
                      <span className={`badge ${isWeather ? 'badge-cyan' : 'badge-emerald'}`}>
                        {isWeather ? 'External REST API' : 'Compute Logic'}
                      </span>
                    </div>

                    {executed && (
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.76rem',
                        color: '#a7f3d0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ color: 'var(--text-muted)' }}>Return Payload:</span>
                        <span>{typeof executed.result === 'object' ? JSON.stringify(executed.result) : String(executed.result)}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Step 3: Final Synthesis */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
                  Final Multi-Tool Answer Synthesized
                </div>
              </div>
            </div>
          </div>

          {/* Final Answer Box */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#22d3ee', marginBottom: '10px' }}>
              Answer
            </h3>
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              color: '#f8fafc',
              lineHeight: 1.6
            }}>
              {(agentResult.result || []).map((res, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                  • <strong>{res.tool}</strong>: {typeof res.result === 'object' ? `${res.result.city}: ${res.result.temperature}°C, ${res.result.condition}` : res.result}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
