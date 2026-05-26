import { useState, useRef, useEffect, useCallback } from 'react';
import './chat.css';

// ── Types ─────────────────────────────────────────────────────────────────────
type WidgetState = 'closed' | 'open' | 'conversation';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  sources?: string[];
  streaming?: boolean;
}

// ── Config ────────────────────────────────────────────────────────────────────
const API_URL =
  (import.meta.env.VITE_CHAT_API_URL as string | undefined) ?? 'http://localhost:8000';

const SUGGESTIONS = [
  'Tell me about your AI work',
  'Are you open to new roles?',
  'Show me your best project',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2);

// ── Component ─────────────────────────────────────────────────────────────────
export function ChatWidget() {
  const [state,    setState]    = useState<WidgetState>('closed');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState('');
  const [busy,     setBusy]     = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (state !== 'closed') {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [state]);

  // ── Core send function ─────────────────────────────────────────────────────
  const send = useCallback(async (question: string) => {
    if (!question.trim() || busy) return;

    const q     = question.trim();
    const botId = uid();

    setInput('');
    setBusy(true);
    setState('conversation');
    setMessages(prev => [
      ...prev,
      { id: uid(), role: 'user', text: q },
      { id: botId, role: 'bot',  text: '', streaming: true },
    ]);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: q }),
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.token) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === botId ? { ...m, text: m.text + data.token } : m
                )
              );
            }

            if (data.done) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === botId
                    ? { ...m, streaming: false, sources: data.sources ?? [] }
                    : m
                )
              );
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === botId
            ? { ...m, text: 'Something went wrong. Please try again.', streaming: false }
            : m
        )
      );
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [busy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  // ── Closed state: FAB avatar bubble ───────────────────────────────────────
  if (state === 'closed') {
    return (
      <div
        className="cw-fab"
        onClick={() => setState('open')}
        role="button"
        aria-label="Open chat"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setState('open')}
      >
        <span className="cw-fab__ring" />
        <span className="cw-fab__ring cw-fab__ring--2" />
        <div className="cw-fab__pic" aria-hidden="true" />
        <span className="cw-fab__dot" aria-hidden="true" />
        <div className="cw-fab__tag" aria-hidden="true">
          <b>Ask me</b> anything →
        </div>
      </div>
    );
  }

  // ── Open / Conversation state: panel ──────────────────────────────────────
  return (
    <div className="cw-panel" role="dialog" aria-label="Portfolio chat">

      {/* Header — macOS dots + title + close */}
      <div className="cw-panel__header">
        <div className="cw-panel__dots" aria-hidden="true">
          <i /><i /><i />
        </div>
        <span className="cw-panel__title"><b>ask</b>.deepak</span>
        <button
          className="cw-panel__close"
          onClick={() => setState('closed')}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* ── Open: intro + suggestion chips ────────────────────────────────── */}
      {state === 'open' && (
        <>
          <div className="cw-intro">
            <div className="cw-intro__av">
              <div className="cw-intro__pic" aria-hidden="true" />
              <span className="cw-intro__status">
                <span className="cw-intro__dot" aria-hidden="true" />
                Online · grounded on portfolio
              </span>
            </div>
            <h2 className="cw-intro__heading">Hey — what's up?</h2>
          </div>

          <div className="cw-sugs">
            {SUGGESTIONS.map(s => (
              <button key={s} className="cw-sug" onClick={() => send(s)}>
                {s}
                <span className="cw-sug__arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />
        </>
      )}

      {/* ── Conversation: message thread ─────────────────────────────────── */}
      {state === 'conversation' && (
        <div className="cw-messages" role="log" aria-live="polite">
          {messages.map(m => (
            <div key={m.id} className={`cw-msg cw-msg--${m.role}`}>
              {m.role === 'bot' && (
                <div className="cw-msg__av" aria-hidden="true" />
              )}
              <div className="cw-msg__bubble">
                {m.text}
                {m.streaming && (
                  <span className="cw-cursor" aria-hidden="true" />
                )}
                {!m.streaming && m.sources && m.sources.length > 0 && (
                  <div className="cw-msg__sources">
                    · {m.sources.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Footer: input bar — always visible */}
      <form className="cw-footer" onSubmit={handleSubmit}>
        <div className="cw-input-row">
          <span className="cw-input-prefix" aria-hidden="true">›</span>
          <input
            ref={inputRef}
            className="cw-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={busy ? 'thinking…' : 'ask…'}
            disabled={busy}
            maxLength={500}
            aria-label="Ask a question"
          />
          <button
            className="cw-send"
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </form>

    </div>
  );
}
