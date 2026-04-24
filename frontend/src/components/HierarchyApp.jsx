import React, { useState, useEffect, useCallback } from 'react';
import TreeView from './TreeView';
import JsonView from './JsonView';
import { toDot, downloadText, b64urlEncode, b64urlDecode } from '../lib/dot';

const API = process.env.REACT_APP_BACKEND_URL
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : 'http://localhost:8001/api';

const EXAMPLES = [
  { label: 'Two trees',            value: '["A->B", "A->C", "B->D"]' },
  { label: 'With invalids & dupes', value: '["A->B", "AB->C", "B->D", "A->B"]' },
  { label: 'Cycle',                value: '["A->B", "B->C", "C->A"]' },
  { label: 'Multi-parent',         value: '["A->B", "C->B"]' },
];

/* ── tiny toast state ───────────────────────────────────────── */
let _toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'default') => {
    const id = ++_toastId;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return { toasts, add };
}

export default function HierarchyApp() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeRoot, setActiveRoot] = useState('');
  const [activeTab, setActiveTab] = useState('tree');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const { toasts, add: toast } = useToasts();

  /* hydrate from ?q= on mount */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) {
      const decoded = b64urlDecode(q);
      if (decoded) setInput(decoded);
    }
  }, []);

  const parseInput = (text) => {
    try {
      const p = JSON.parse(text);
      if (Array.isArray(p)) return p;
    } catch (_) {}
    return text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  };

  const processData = async (raw = input) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/bfhl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parseInput(raw), save: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult(json);
      if (json.hierarchies?.length) setActiveRoot(json.hierarchies[0].root);
      toast('Processed successfully ✓', 'ok');
    } catch (e) {
      setError('Failed to reach API. Make sure the backend is running on port 8001.');
      toast('Error: ' + e.message, 'err');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInput(''); setResult(null); setError(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleCopyCurl = () => {
    const body = JSON.stringify({ data: parseInput(input), save: true });
    const cmd = `curl -X POST "${API}/bfhl" -H 'Content-Type: application/json' -d '${body}'`;
    navigator.clipboard.writeText(cmd).then(() => toast('Copied curl ↗', 'ok'));
  };

  const handleShareUrl = () => {
    const enc = b64urlEncode(input);
    const url = `${window.location.origin}${window.location.pathname}?q=${enc}`;
    window.history.replaceState(null, '', url);
    navigator.clipboard.writeText(url).then(() => toast('Shareable URL copied ↗', 'ok'));
  };

  const handleExportDot = () => {
    if (!result) return;
    downloadText('hierarchy.dot', toDot(result));
    toast('Exported hierarchy.dot', 'ok');
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API}/bfhl/history?limit=25`);
      const data = await res.json();
      setHistoryItems(data.items || []);
    } catch (_) { toast('Could not load history', 'err'); }
  };

  const openHistory = () => { setHistoryOpen(true); loadHistory(); };

  const restoreHistory = async (id) => {
    try {
      const res = await fetch(`${API}/bfhl/history/${id}`);
      const data = await res.json();
      const str = JSON.stringify(data.input, null, 2);
      setInput(str);
      setResult(data.response);
      if (data.response?.hierarchies?.length) setActiveRoot(data.response.hierarchies[0].root);
      window.history.replaceState(null, '', `?q=${b64urlEncode(str)}`);
      setHistoryOpen(false);
    } catch (_) { toast('Failed to restore', 'err'); }
  };

  const currentHierarchy = result?.hierarchies?.find(h => h.root === activeRoot) || result?.hierarchies?.[0];

  return (
    <div className="app-container">

      {/* ── Toasts ── */}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>

      {/* ── Header ── */}
      <header className="rise-1">
        <div className="header-kicker" data-testid="app-kicker">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
          v1.0.0 — SRM Hierarchy Processor
        </div>
        <h1 className="app-title" data-testid="app-title">
          SRM Hierarchy <em>Processor</em>
        </h1>
        <div className="header-links">
          <a href="http://localhost:8001/docs" target="_blank" rel="noreferrer" className="header-link" data-testid="header-docs-link">
            API Docs ↗
          </a>
          <button className="header-btn" onClick={openHistory} data-testid="history-open-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            History
          </button>
        </div>
      </header>

      {/* ── Input section ── */}
      <div className="main-grid rise-2">
        <div>
          <textarea
            className="input-textarea"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'[\n  "A->B",\n  "A->C",\n  "B->D"\n]'}
            data-testid="input-textarea"
          />
          <div className="example-row" data-testid="example-buttons">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                className="chip"
                onClick={() => setInput(ex.value)}
                data-testid={`example-btn-${i}`}
              >{ex.label}</button>
            ))}
          </div>
          <div className="btn-row">
            <button className="btn-primary" onClick={() => processData()} disabled={loading} data-testid="submit-btn">
              {loading
                ? <span className="spinner">↻</span>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>}
              {loading ? 'Processing…' : 'Process'}
            </button>
            <button className="btn-secondary" onClick={handleReset} data-testid="reset-btn">Reset</button>
          </div>
        </div>

        {/* Sidebar tools */}
        <div>
          <div className="side-card">
            <h3>Utilities</h3>
            <div className="side-list">
              <button className="side-list-btn" onClick={handleCopyCurl} data-testid="copy-curl-btn">
                Copy as curl <span>↗</span>
              </button>
              <button className="side-list-btn" onClick={handleShareUrl} data-testid="share-url-btn">
                Share URL <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="alert alert-err" data-testid="error-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div><h4>Processing Failed</h4><p>{error}</p></div>
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="rise-3">
          {/* Cycle alert */}
          {result.has_cycle && (
            <div className="alert alert-warn" data-testid="cycle-alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
              <div><h4>Cycle Detected</h4><p>The edges form a cycle — hierarchies cannot be built.</p></div>
            </div>
          )}

          {/* Identity strip */}
          <div className="identity-strip" data-testid="identity-strip">
            <span className="chip chip-ok" style={{cursor:'default'}}># {result.user_id}</span>
            <span className="chip chip-ok" style={{cursor:'default'}}>{result.email_id}</span>
            <span className="chip chip-ok" style={{cursor:'default'}}>{result.college_roll_number}</span>
          </div>

          {/* Stats */}
          <div className="summary-grid" data-testid="summary-grid">
            <div className="stat-card" data-testid="stat-total-trees">
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14c.7-.7 1-1.6 1-2.5a3.5 3.5 0 0 0-7 0c0 .9.3 1.8 1 2.5M7 21v-3a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v3"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="stat-value">{result.summary.total_trees}</div>
              <div className="stat-label">Total Trees</div>
            </div>
            <div className="stat-card" data-testid="stat-total-cycles">
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
              </div>
              <div className="stat-value">{result.summary.total_cycles}</div>
              <div className="stat-label">Cycles</div>
            </div>
            <div className="stat-card" data-testid="stat-largest-root">
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
              </div>
              <div className="stat-value" style={{fontSize:'1.5rem'}}>{result.summary.largest_tree_root || 'N/A'}</div>
              <div className="stat-label">Deepest Root</div>
            </div>
            <div className="stat-card" data-testid="stat-duplicates">
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="stat-value">{result.duplicate_edges.length}</div>
              <div className="stat-label">Duplicates</div>
            </div>
          </div>

          {/* Main tree + sidebar */}
          <div className="results-grid">
            <div>
              {/* Tree card */}
              <div className="card">
                <div className="card-header">
                  <div className="tree-selector" data-testid="tree-selector">
                    {result.hierarchies.map((h, i) => (
                      <button
                        key={i}
                        className={`chip ${activeRoot === h.root ? 'chip-active' : ''}`}
                        onClick={() => setActiveRoot(h.root)}
                        data-testid={`tree-chip-${h.root}`}
                      >
                        root {h.root || 'N/A'}{h.depth ? ` · depth ${h.depth}` : ''}
                      </button>
                    ))}
                  </div>
                  <button
                    className="side-list-btn"
                    style={{width:'auto', padding:'4px 8px', fontSize:'12px'}}
                    onClick={handleExportDot}
                    data-testid="export-dot-btn"
                  >
                    ↓ .dot
                  </button>
                </div>

                {/* Tabs */}
                <div className="tab-bar">
                  <button
                    className={`tab-btn ${activeTab === 'tree' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tree')}
                    data-testid="tab-tree"
                  >Tree view</button>
                  <button
                    className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
                    onClick={() => setActiveTab('json')}
                    data-testid="tab-json"
                  >JSON</button>
                </div>

                <div className="tree-wrap">
                  {activeTab === 'tree' && currentHierarchy && (
                    <TreeView
                      root={currentHierarchy.root}
                      tree={currentHierarchy.tree}
                    />
                  )}
                  {activeTab === 'json' && currentHierarchy && (
                    <JsonView data={currentHierarchy.tree} />
                  )}
                </div>
              </div>

              {/* Raw response */}
              <div className="raw-card" data-testid="raw-response-card">
                <div className="raw-card-header">
                  Raw Response
                  <a
                    href="https://dreampuf.github.io/GraphvizOnline/"
                    target="_blank"
                    rel="noreferrer"
                    className="ext-link"
                  >Render .dot online ↗</a>
                </div>
                <div className="raw-card-body">
                  <JsonView data={result} />
                </div>
              </div>
            </div>

            {/* Info sidebar */}
            <div>
              <div className="info-card" data-testid="invalid-card">
                <div className="info-card-header">
                  Invalid Entries
                  <span className="badge badge-err">{result.invalid_entries.length}</span>
                </div>
                <div className="chips-wrap">
                  {result.invalid_entries.length === 0
                    ? <span className="no-items">None</span>
                    : result.invalid_entries.map((inv, i) => (
                        <span key={i} className="chip chip-err" data-testid={`invalid-${i}`}>{inv || '""'}</span>
                      ))}
                </div>
              </div>

              <div className="info-card" data-testid="duplicates-card">
                <div className="info-card-header">
                  Duplicate Edges
                  <span className="badge badge-warn">{result.duplicate_edges.length}</span>
                </div>
                <div className="chips-wrap">
                  {result.duplicate_edges.length === 0
                    ? <span className="no-items">None</span>
                    : result.duplicate_edges.map((dup, i) => (
                        <span key={i} className="chip chip-warn" data-testid={`duplicate-${i}`}>{dup}</span>
                      ))}
                </div>
              </div>

              {result.submission_id && (
                <div className="info-card">
                  <div className="info-card-header">Submission ID</div>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'11px',wordBreak:'break-all',color:'var(--ink-2)'}}>
                    {result.submission_id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── History Drawer ── */}
      {historyOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setHistoryOpen(false)} />
          <div className="drawer">
            <button className="drawer-close" onClick={() => setHistoryOpen(false)}>×</button>
            <div className="drawer-title">Recent Runs</div>
            <div data-testid="history-list">
              {historyItems.length === 0 && <p className="no-items">No history yet.</p>}
              {historyItems.map(item => (
                <div
                  key={item.id}
                  className="history-item"
                  onClick={() => restoreHistory(item.id)}
                  data-testid={`history-item-${item.id}`}
                >
                  <div className="history-time">
                    {new Date(item.created_at).toLocaleString()}
                    {item.has_cycle && ' 🔄'}
                  </div>
                  <div className="history-preview">
                    {JSON.stringify(item.input).substring(0, 40)}…
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
