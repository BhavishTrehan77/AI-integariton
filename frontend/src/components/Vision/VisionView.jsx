import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Eye, 
  Check,
  Zap
} from 'lucide-react';
import { optimizeImageBase64, formatBytes } from '../../utils/fileHelpers';
import { analyzeImage } from '../../api/client';
import { renderMarkdown } from '../../utils/markdown';

export default function VisionView() {
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDetails, setImageDetails] = useState(null);
  const [question, setQuestion] = useState('What is present in this image? Describe in detail.');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);

  // Preset sample image for instant demo without uploading
  const createSampleImage = (type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (type === 'diagram') {
      // Architectural diagram sample
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 600, 400);
      
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(50, 150, 140, 100);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('React Frontend', 65, 205);

      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(240, 150, 140, 100);
      ctx.fillStyle = '#fff';
      ctx.fillText('Express Gateway', 250, 205);

      ctx.fillStyle = '#10b981';
      ctx.fillRect(430, 150, 140, 100);
      ctx.fillStyle = '#fff';
      ctx.fillText('MongoDB Vector', 440, 205);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(190, 200);
      ctx.lineTo(240, 200);
      ctx.moveTo(380, 200);
      ctx.lineTo(430, 200);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('AI Architecture Diagram', 180, 70);
    } else {
      // Chart sample
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 600, 400);

      ctx.fillStyle = '#818cf8';
      ctx.fillRect(100, 240, 60, 120);
      ctx.fillRect(200, 180, 60, 180);
      ctx.fillRect(300, 120, 60, 240);
      ctx.fillRect(400, 80, 60, 280);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Quarterly AI Performance Growth', 140, 60);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Q1', 120, 380);
      ctx.fillText('Q2', 220, 380);
      ctx.fillText('Q3', 320, 380);
      ctx.fillText('Q4', 420, 380);
    }

    // High compression quality to stay around 20KB
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    const base64 = dataUrl.split(',')[1];
    setImagePreview(dataUrl);
    setImageBase64(base64);
    setImageDetails({
      name: type === 'diagram' ? 'sample_architecture.jpg' : 'sample_chart.jpg',
      size: `${Math.round((base64.length * 3) / 1024)} KB`
    });
    setAnswer(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPEG, WebP).');
      return;
    }

    try {
      setError(null);
      // Automatically optimize and scale image to max 1024px and compress to JPEG ~50KB
      const { base64, dataUrl, size } = await optimizeImageBase64(file, 1024, 1024, 0.75);
      setImageBase64(base64);
      setImagePreview(dataUrl);
      setImageDetails({
        name: file.name,
        size
      });
      setAnswer(null);
    } catch (err) {
      setError('Failed to load image: ' + err.message);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError('Please select or upload an image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await analyzeImage(imageBase64, question);
      setAnswer(res.answer || res);
    } catch (err) {
      console.error('Vision analysis error:', err);
      setError(`Image analysis failed: ${err.message}`);
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
        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid rgba(244, 63, 94, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f43f5e 0%, #d946ef 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(244, 63, 94, 0.35)'
          }}>
            <ImageIcon size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              Multimodal Vision Intelligence
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Direct visual reasoning with Gemini 3.6 Flash. Auto-optimized upload, object detection, diagram analysis & OCR.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => createSampleImage('diagram')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              color: '#e2e8f0',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Load Sample Architecture
          </button>
          <button
            onClick={() => createSampleImage('chart')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              color: '#e2e8f0',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Load Sample Chart
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: '24px' }}>
        {/* Left Column: Image Upload & Preview */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={16} color="#fb7185" />
            Upload Image
          </h3>

          {!imagePreview ? (
            <label style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              transition: 'border-color var(--transition-fast)'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#fb7185'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <ImageIcon size={42} color="#fb7185" style={{ marginBottom: '12px' }} />
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#e2e8f0' }}>
                Click or drop an image here
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                JPEG, PNG, WebP • Auto-optimized for Gemini 3.6
              </span>
            </label>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                maxHeight: '340px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000'
              }}>
                <img 
                  src={imagePreview} 
                  alt="Target" 
                  style={{ width: '100%', height: 'auto', maxHeight: '340px', objectFit: 'contain' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <span>{imageDetails?.name} ({imageDetails?.size})</span>
                <label style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>
                  Change Image
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Prompt & Answer */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
            Vision Query Console
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Prompt / Question:
            </label>
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="What is present in this image? Describe in detail..."
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !imageBase64}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: loading || !imageBase64 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)'
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
            <span>{loading ? 'Analyzing with Gemini 3.6...' : 'Analyze Image'}</span>
          </button>

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

          {answer && (
            <div style={{
              marginTop: '8px',
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Sparkles size={16} color="#fb7185" />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fca5a5' }}>
                  Gemini Vision Analysis
                </span>
              </div>
              <div 
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(answer) }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
