import React, { useState } from 'react';
import { 
  Search, 
  GitMerge, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  Database,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { advancedRagChat, hybridSearchRRF, keywordSearch } from '../../api/client';
import { renderMarkdown } from '../../utils/markdown';

export default function RagExplorerView() {
  const [query, setQuery] = useState('What are the foundational principles of artificial intelligence?');
  const [activeSubTab, setActiveSubTab] = useState('pipeline'); // 'pipeline' or 'rrf'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rrfResult, setRrfResult] = useState(null);
  const [error, setError] = useState(null);

  const sampleQueries = [
    'What are the foundational principles of artificial intelligence?',
    'Explain how neural networks learn via backpropagation',
    'What is the difference between vector search and full text search?',
    'What is photosynthesis in plants?'
  ];

  const handleRunPipeline = async (customQuery = null) => {
    const q = customQuery || query;
    if (!q.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      if (activeSubTab === 'pipeline') {
        const data = await advancedRagChat(q);
        setResult(data);
      } else {
        const data = await hybridSearchRRF(q);
        setRrfResult(data);
      }
    } catch (err) {
      setError(err.message || 'RAG Pipeline execution failed');
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
      {/* Header */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            Advanced RAG Pipeline Visualizer
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Transparently inspect Query Rewriting, Multi-Query Expansion, MongoDB Vector Search, and Reciprocal Rank Fusion (RRF).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => { setActiveSubTab('pipeline'); setResult(null); }}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeSubTab === 'pipeline' ? 'var(--accent-primary)' : 'transparent',
              color: activeSubTab === 'pipeline' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Rewriting & Expansion
          </button>
          <button
            onClick={() => { setActiveSubTab('rrf'); setRrfResult(null); }}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeSubTab === 'rrf' ? 'var(--accent-secondary)' : 'transparent',
              color: activeSubTab === 'rrf' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Hybrid Search & RRF
          </button>
        </div>
      </div>

      {/* Input bar */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRunPipeline()}
            placeholder="Enter query to test RAG retrieval..."
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
            onClick={() => handleRunPipeline()}
            disabled={loading || !query.trim()}
            style={{
              padding: '0 24px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--grad-primary)',
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Execute Pipeline</span>
          </button>
        </div>

        {/* Quick queries */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(sq);
                handleRunPipeline(sq);
              }}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              {sq}
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

      {/* Pipeline 1: Rewriting & Expansion View */}
      {activeSubTab === 'pipeline' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', animation: 'fadeIn 0.3s ease-out' }}>
          {/* Step Flow Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* Step 1 */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-indigo">Step 1</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>Query Rewriting</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Optimized by Gemini Flash Lite:
              </div>
              <div style={{
                padding: '8px 10px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#818cf8',
                fontFamily: 'var(--font-mono)'
              }}>
                "{result.rewrittenQuery || query}"
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-cyan">Step 2</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>Multi-Query Expansion</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                3 Parallel Variations:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(result.expandedQueries && result.expandedQueries.length > 0 ? result.expandedQueries : [query]).map((qVariant, i) => (
                  <div key={i} style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    • {qVariant}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-emerald">Step 3</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>Deduplication & Threshold</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Cosine Similarity Filtering:
              </div>
              <div style={{
                padding: '8px 10px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: '#34d399',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div>Retrieved: <strong>{result.results?.length || 0} unique chunks</strong></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Threshold: score &gt;= 0.50</div>
              </div>
            </div>
          </div>

          {/* Synthesized Response */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={18} color="#818cf8" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                Synthesized RAG Answer
              </h3>
            </div>
            <div 
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(result.answer) }}
            />
          </div>

          {/* Retrieved Chunks with Similarity Scores */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
              Retrieved Context Chunks ({result.results?.length || 0})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.results && result.results.length > 0 ? (
                result.results.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
                        Chunk #{idx + 1}
                      </span>
                      {item.score && (
                        <span className="badge badge-emerald">
                          Similarity: {Number(item.score).toFixed(3)}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1.45,
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      padding: '8px',
                      borderRadius: '4px'
                    }}>
                      "{item.text}"
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No high-similarity chunks matched the threshold in the MongoDB vector index.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pipeline 2: Hybrid Search & RRF View */}
      {activeSubTab === 'rrf' && rrfResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* Vector Results */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#818cf8', marginBottom: '10px' }}>
                1. Vector Search ($vectorSearch)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(rrfResult.vectorResults || []).slice(0, 3).map((item, i) => (
                  <div key={i} style={{ padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '0.74rem' }}>
                    <div style={{ color: '#38bdf8', fontWeight: 600 }}>Score: {item.score?.toFixed(3) || 'N/A'}</div>
                    <div style={{ color: '#94a3b8', maxHeight: '48px', overflow: 'hidden' }}>"{item.text}"</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword Results */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#22d3ee', marginBottom: '10px' }}>
                2. Keyword Search ($search BM25)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(rrfResult.KeyWordResults || []).slice(0, 3).map((item, i) => (
                  <div key={i} style={{ padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '0.74rem' }}>
                    <div style={{ color: '#22d3ee', fontWeight: 600 }}>Score: {item.score?.toFixed(3) || 'N/A'}</div>
                    <div style={{ color: '#94a3b8', maxHeight: '48px', overflow: 'hidden' }}>"{item.text}"</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fused RRF Results */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#34d399', marginBottom: '10px' }}>
                3. Reciprocal Rank Fusion (RRF)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(rrfResult.fusedResults || []).slice(0, 3).map((item, i) => (
                  <div key={i} style={{ padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '0.74rem' }}>
                    <div style={{ color: '#34d399', fontWeight: 600 }}>RRF Score: {item.score?.toFixed(4) || 'N/A'}</div>
                    <div style={{ color: '#cbd5e1', maxHeight: '48px', overflow: 'hidden' }}>"{item.text}"</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
