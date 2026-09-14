'use client';

import { FormEvent, MouseEvent, useEffect, useRef, useState } from 'react';
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

const STORAGE_KEY = 'bloom_help_chat_messages';

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

function welcomeMessage(): ChatMessage {
  return { role: 'duck', html: formatAnswerHtml(getWelcomeMessage()) };
}

function loadSavedMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function DuckHelpChat() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadSavedMessages();
    setMessages(saved.length ? saved : [welcomeMessage()]);
  }, []);

  useEffect(() => {
    if (messages.length) saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (open && messagesRef.current) scrollElement(messagesRef.current);
  }, [messages, open]);

  useEffect(() => {
    if (!open) return undefined;

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function openChat(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setOpen(true);
  }

  function closeChat(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();
    setOpen(false);
  }

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
        aria-label={open ? `Ajuda do ${APP_NAME} aberta` : `Abrir ajuda do ${APP_NAME}`}
        aria-expanded={open}
        aria-controls="duck-help-panel"
        onClick={openChat}
      >
        <img src="/favicon.png" alt="" className="duck-help-fab-icon" width={38} height={38} />
        <span className="duck-help-fab-badge" aria-hidden="true">
          ?
        </span>
      </button>

      {open ? (
        <div
          id="duck-help-panel"
          className="duck-help-panel is-open"
          aria-hidden="false"
          role="dialog"
          aria-labelledby="duck-help-title"
          onClick={(event) => event.stopPropagation()}
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
              onClick={closeChat}
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
      ) : null}
    </div>
  );
}
