import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, ExternalLink, Check, Copy } from 'lucide-react';

export default function SourceCard({ sources, queryDetails }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!sources || sources.length === 0) return null;

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div style={{
      marginTop: '12px',
      border: '1px solid rgba(99, 102, 241, 0.25)',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      overflow: 'hidden'
    }}>
      {/* Header Accordion Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: 'none',
          color: '#c7d2fe',
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all var(--transition-fast)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isOpen ? <ChevronDown size={14} color="#818cf8" /> : <ChevronRight size={14} color="#818cf8" />}
          <FileText size={14} color="#818cf8" />
          <span>Retrieved Sources ({sources.length})</span>
          {queryDetails?.rewrittenQuery && (
            <span style={{
              fontSize: '0.68rem',
              color: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              padding: '1px 6px',
              borderRadius: '4px'
            }}>
              Query Rewritten ✓
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {isOpen ? 'Click to collapse' : 'Click to inspect chunks'}
        </span>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {queryDetails && (
            <div style={{
              fontSize: '0.75rem',
              padding: '8px 10px',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {queryDetails.rewrittenQuery && (
                <div>
                  <strong style={{ color: '#818cf8' }}>Rewritten Query: </strong>
                  <span style={{ color: '#e2e8f0' }}>"{queryDetails.rewrittenQuery}"</span>
                </div>
              )}
              {queryDetails.expandedQueries && queryDetails.expandedQueries.length > 0 && (
                <div>
                  <strong style={{ color: '#38bdf8' }}>Expanded Variants: </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {queryDetails.expandedQueries.join(' • ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {sources.map((item, idx) => {
            const score = item.score ? Number(item.score).toFixed(3) : null;
            const scorePct = item.score ? Math.round(item.score * 100) : null;
            const textContent = item.text || item.chunk || JSON.stringify(item);

            return (
              <div
                key={idx}
                style={{
                  padding: '10px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#818cf8',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      Source #{idx + 1}
                    </span>
                    {item.source && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        ({item.source})
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {score && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor: scorePct >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: scorePct >= 80 ? '#34d399' : '#a5b4fc',
                        border: `1px solid ${scorePct >= 80 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                        fontFamily: 'var(--font-mono)'
                      }}>
                        Similarity: {score}
                      </span>
                    )}
                    <button
                      onClick={() => handleCopy(textContent, idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Copy chunk text"
                    >
                      {copiedIndex === idx ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.78rem',
                  color: '#cbd5e1',
                  lineHeight: 1.45,
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  padding: '8px',
                  borderRadius: '4px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  borderLeft: '2px solid var(--accent-secondary)'
                }}>
                  "{textContent}"
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
