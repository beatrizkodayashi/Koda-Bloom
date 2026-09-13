'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APP_NAME } from '@/lib/config/app';
import { scrollElement } from '@/lib/utils/scroll';
import {
  findAnswerByText,
  getAnswerById,
  getFallbackMessage,
  getSuggestedQuestions,
  getWelcomeMessage,
} from '@/lib/services/helpChatService';

type ChatMessage = {
  role: 'duck' | 'user';
  html: string;
  action?: { route: string; label: string } | null;
};

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatAnswerHtml(text: string) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

export function DuckHelpChat() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !initialized) {
      setMessages([{ role: 'duck', html: formatAnswerHtml(getWelcomeMessage()) }]);
      setInitialized(true);
    }
  }, [open, initialized]);

  useEffect(() => {
    if (messagesRef.current) scrollElement(messagesRef.current);
  }, [messages, open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) setOpen(false);
    }
    function onClick(event: MouseEvent) {
      if (!open || !rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [open]);

  function showAnswer(id: string) {
    const item = getAnswerById(id);
    if (!item) {
      setMessages((prev) => [...prev, { role: 'duck', html: formatAnswerHtml(getFallbackMessage()) }]);
      return;
    }
    setMessages((prev) => [
      ...prev,
      { role: 'duck', html: formatAnswerHtml(item.answer), action: item.action || null },
    ]);
  }

  function handleQuestion(id: string, label: string) {
    setMessages((prev) => [...prev, { role: 'user', html: escapeHtml(label || id) }]);
    showAnswer(id);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', html: escapeHtml(trimmed) }]);
    const match = findAnswerByText(trimmed) as { id: string } | null;
    if (match) {
      showAnswer(match.id);
      return;
    }
    setMessages((prev) => [...prev, { role: 'duck', html: formatAnswerHtml(getFallbackMessage()) }]);
  }

  return (
    <div ref={rootRef} id="duck-help-root" className="duck-help-root">
      <button
        type="button"
        className="duck-help-fab"
        aria-label={`Abrir ajuda do ${APP_NAME}`}
        aria-expanded={open}
        aria-controls="duck-help-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <img src="/favicon.png" alt="" className="duck-help-fab-icon" width={38} height={38} />
        <span className="duck-help-fab-badge" aria-hidden="true">
          ?
        </span>
      </button>

      <div
        id="duck-help-panel"
        className="duck-help-panel"
        hidden={!open}
        aria-hidden={!open}
        role="dialog"
        aria-labelledby="duck-help-title"
      >
        <header className="duck-help-header">
          <div>
            <h2 id="duck-help-title" className="duck-help-title">
              {APP_NAME}, Ajuda
            </h2>
            <p className="duck-help-subtitle">Tire dúvidas sobre login, assinatura e erros</p>
          </div>
          <button
            type="button"
            className="duck-help-close btn-bloom btn-bloom-ghost btn-bloom-sm"
            aria-label="Fechar ajuda"
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div ref={messagesRef} className="duck-help-messages" role="log" aria-live="polite" aria-relevant="additions">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`duck-help-message duck-help-message--${message.role}`}>
              {message.role === 'duck' ? (
                <div className="duck-help-message-avatar" aria-hidden="true">
                  <img src="/favicon.png" alt="" className="duck-help-message-icon" width={28} height={28} />
                </div>
              ) : null}
              <div className="duck-help-message-bubble">
                <span dangerouslySetInnerHTML={{ __html: message.html }} />
                {message.action ? (
                  <>
                    <br />
                    <br />
                    <button
                      type="button"
                      className="btn-bloom btn-bloom-secondary btn-bloom-sm duck-help-action"
                      onClick={() => {
                        setOpen(false);
                        router.push(message.action!.route);
                      }}
                    >
                      {message.action.label}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="duck-help-suggestions" aria-label="Sugestões de perguntas">
          {getSuggestedQuestions().map((question) => (
            <button
              key={question.id}
              type="button"
              className="chip duck-help-suggestion"
              onClick={() => handleQuestion(question.id, question.label)}
            >
              {question.label}
            </button>
          ))}
        </div>

        <form className="duck-help-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="duck-help-input">
            Sua dúvida
          </label>
          <input
            type="text"
            id="duck-help-input"
            placeholder="Digite sua dúvida..."
            maxLength={300}
            autoComplete="off"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="submit" className="btn-bloom btn-bloom-primary btn-bloom-sm" aria-label="Enviar">
            <span aria-hidden="true">➤</span>
          </button>
        </form>
      </div>
    </div>
  );
}
