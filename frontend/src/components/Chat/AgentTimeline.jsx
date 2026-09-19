import React from 'react';
import { CheckCircle2, Circle, Clock, Cpu, CloudRain, Calculator, Terminal } from 'lucide-react';

export default function AgentTimeline({ planData }) {
  if (!planData || (!planData.plan && !planData.result && !planData.steps)) return null;

  const steps = planData.steps || (planData.plan || []).map((step, idx) => {
    const executed = (planData.result || []).find(r => r.tool === step.tool);
    return {
      tool: step.tool,
      args: step.args,
      result: executed ? executed.result : null,
      status: 'completed'
    };
  });

  const getToolIcon = (name) => {
    if (name?.toLowerCase().includes('weather')) return <CloudRain size={14} color="#38bdf8" />;
    if (name?.toLowerCase().includes('add') || name?.toLowerCase().includes('calc') || name?.toLowerCase().includes('number')) {
      return <Calculator size={14} color="#34d399" />;
    }
    return <Terminal size={14} color="#818cf8" />;
  };

  return (
    <div style={{
      marginTop: '12px',
      border: '1px solid rgba(6, 182, 212, 0.3)',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: 'rgba(8, 145, 178, 0.05)',
      overflow: 'hidden'
    }}>
      {/* Title */}
      <div style={{
        padding: '8px 12px',
        backgroundColor: 'rgba(6, 182, 212, 0.12)',
        borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={15} color="#22d3ee" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#22d3ee' }}>
            Autonomous Agent Activity Loop
          </span>
        </div>
        <span style={{
          fontSize: '0.68rem',
          padding: '2px 8px',
          borderRadius: '10px',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontWeight: 600
        }}>
          {steps.length} Tools Executed ✓
        </span>
      </div>

      {/* Activity Timeline */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Step 1: Thinking & Planning */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={16} color="#10b981" />
          <div style={{ fontSize: '0.8rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600 }}>Decomposed Intent & Generated Multi-Step Plan</span>
          </div>
        </div>

        {/* Executed Tools */}
        {steps.map((step, idx) => {
          const argsStr = Object.entries(step.args || {})
            .map(([k, v]) => `${k}: ${typeof v === 'string' ? `"${v}"` : v}`)
            .join(', ');

          const resultStr = typeof step.result === 'object' 
            ? JSON.stringify(step.result) 
            : String(step.result ?? '');

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {getToolIcon(step.tool)}
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{step.tool}</span>
                  <span style={{ color: '#94a3b8' }}>({argsStr})</span>
                </div>
              </div>

              {step.result !== null && (
                <div style={{
                  marginLeft: '26px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Output ➔</span>
                  <span>{resultStr}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Final step */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={16} color="#10b981" />
          <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>
            Synthesized Final Response
          </div>
        </div>
      </div>
    </div>
  );
}
