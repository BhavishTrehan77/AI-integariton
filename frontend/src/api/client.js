// API Client mapped to Express backend routes

const API_BASE = '/api/v1';

/**
 * Streaming chat via /api/v1/chunk
 * @param {string} message 
 * @param {(chunk: string) => void} onChunk 
 * @param {() => void} onComplete 
 * @param {(err: Error) => void} onError 
 * @param {AbortSignal} signal 
 */
export async function streamChat(message, onChunk, onComplete, onError, signal) {
  try {
    const response = await fetch(`${API_BASE}/chunk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Server responded with ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      onChunk(text);
    }
    onComplete();
  } catch (err) {
    if (err.name === 'AbortError') return;
    onError(err);
  }
}

/**
 * Fast direct response via /api/v1/payal
 */
export async function fastChat(message) {
  const response = await fetch(`${API_BASE}/payal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!response.ok) throw new Error(`Chat failed: ${response.statusText}`);
  return await response.json();
}

/**
 * Structured Task Assistant via /api/v1/chat
 */
export async function extractTask(message) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!response.ok) throw new Error(`Task extraction failed: ${response.statusText}`);
  return await response.json();
}

/**
 * Advanced RAG (Rewriting + Expansion + Multi-Query Vector Search + Deduplication)
 * Endpoint: /api/v1/expandQuery
 */
export async function advancedRagChat(query) {
  try {
    const response = await fetch(`${API_BASE}/expandQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (response.ok) {
      const data = await response.json();
      return {
        answer: data.answer,
        results: data.results || [],
        rewrittenQuery: data.rewrittenQuery,
        expandedQueries: data.expandedQueries || []
      };
    }
  } catch (e) {
    console.warn('expandQuery failed, trying fallback standard RAG', e);
  }

  // Fallback to standard RAG
  const fallback = await fetch(`${API_BASE}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!fallback.ok) throw new Error('RAG search failed');
  return await fallback.json();
}

/**
 * Hybrid Search with Reciprocal Rank Fusion (RRF)
 * Endpoint: /api/v1/rrf
 */
export async function hybridSearchRRF(query) {
  const response = await fetch(`${API_BASE}/rrf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error(`Hybrid search failed: ${response.statusText}`);
  return await response.json();
}

/**
 * Keyword Search (BM25 Atlas Text Search)
 * Endpoint: /api/v1/ret
 */
export async function keywordSearch(query) {
  const response = await fetch(`${API_BASE}/ret`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error(`Keyword search failed: ${response.statusText}`);
  return await response.json();
}

/**
 * Agent Planner & Executor
 * Endpoint: /api/v1/planningexecution
 * Returns: { query, plan, result }
 */
export async function planAndExecuteAgent(query) {
  const response = await fetch(`${API_BASE}/planningexecution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error(`Planning agent failed: ${response.statusText}`);
  return await response.json();
}

/**
 * Full Agent Loop
 * Endpoint: /api/v1/agent
 */
export async function runAgentLoop(query) {
  const response = await fetch(`${API_BASE}/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error(`Agent loop failed: ${response.statusText}`);
  return await response.json();
}

/**
 * Weather Tool Direct
 * Endpoint: /api/v1/weathercontrol
 */
export async function runWeatherTool(query) {
  const response = await fetch(`${API_BASE}/weathercontrol`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error(`Weather tool failed: ${response.statusText}`);
  return await response.json();
}

/**
 * Direct PDF Analysis (Gemini 3.6 Multimodal)
 * Endpoint: /api/v1/pdf
 */
export async function analyzeDirectPdf(pdfBase64, question) {
  const response = await fetch(`${API_BASE}/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfBase64, question })
  });
  if (!response.ok) throw new Error(`Direct PDF analysis failed: ${response.statusText}`);
  return await response.json();
}

/**
 * PDF Vector RAG
 * Endpoint: /api/v1/pdfRagAns
 */
export async function queryPdfRag(query, filePath = 'uploads/class12th.pdf') {
  const response = await fetch(`${API_BASE}/pdfRagAns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, filePath })
  });
  if (!response.ok) throw new Error(`PDF RAG failed: ${response.statusText}`);
  return await response.json();
}

/**
 * Upload PDF and trigger backend indexing into MongoDB
 * Endpoint: /api/upload-pdf (handled by Vite middleware to write to uploads/ and call storepdfthings)
 */
export async function uploadAndIndexPdf(filename, base64) {
  const response = await fetch('/api/upload-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, base64 })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed with status ${response.status}`);
  }
  return await response.json();
}

/**
 * Trigger PDF Extraction, Chunking & Embedding Storage
 * Endpoint: /api/v1/storepdfthings
 */
export async function processAndStorePdf(filePath = 'uploads/class12th.pdf') {
  const response = await fetch(`${API_BASE}/storepdfthings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath })
  });
  if (!response.ok) throw new Error(`PDF storage failed: ${response.statusText}`);
  return await response.json();
}

/**
 * Vision: Multimodal Image Analysis
 * Endpoint: /api/v1/image
 */
export async function analyzeImage(imageBase64, question) {
  const response = await fetch(`${API_BASE}/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, question })
  });
  if (!response.ok) throw new Error(`Image analysis failed: ${response.statusText}`);
  return await response.json();
}

/**
 * Health & Diagnostics
 */
export async function checkSystemHealth() {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/payal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'ping' })
    });
    const latency = Math.round(performance.now() - start);
    return {
      connected: res.ok,
      latency,
      status: res.status
    };
  } catch (e) {
    return {
      connected: false,
      latency: Math.round(performance.now() - start),
      error: e.message
    };
  }
}
