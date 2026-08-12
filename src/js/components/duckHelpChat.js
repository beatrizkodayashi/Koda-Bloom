import { navigate } from '../router.js';
import { APP_NAME } from '../config/app.js';
import { scrollElement } from '../utils/scroll.js';
import {
  getWelcomeMessage,
  getSuggestedQuestions,
  getAnswerById,
  findAnswerByText,
  getFallbackMessage,
} from '../services/helpChatService.js';

let root = null;
let panel = null;
let messagesEl = null;
let isOpen = false;

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatAnswerHtml(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function renderChatAvatar() {
  return '<img src="/favicon.png" alt="" class="duck-help-message-icon" width="40" height="40" decoding="async" />';
}

function appendMessage(role, html) {
  if (!messagesEl) return;

  const bubble = document.createElement('div');
  bubble.className = `duck-help-message duck-help-message--${role}`;

  if (role === 'duck') {
    bubble.innerHTML = `
      <div class="duck-help-message-avatar" aria-hidden="true">${renderChatAvatar()}</div>
      <div class="duck-help-message-bubble">${html}</div>
    `;
  } else {
    bubble.innerHTML = `<div class="duck-help-message-bubble">${html}</div>`;
  }

  messagesEl.appendChild(bubble);
  scrollElement(messagesEl);
}

function renderSuggestions() {
  const wrap = panel?.querySelector('.duck-help-suggestions');
  if (!wrap) return;

  wrap.innerHTML = getSuggestedQuestions()
    .map(
      (q) =>
        `<button type="button" class="chip duck-help-suggestion" data-faq-id="${q.id}">${escapeHtml(q.label)}</button>`
    )
    .join('');

  wrap.querySelectorAll('[data-faq-id]').forEach((btn) => {
    btn.addEventListener('click', () => handleQuestion(btn.dataset.faqId, btn.textContent));
  });
}

function showAnswer(id) {
  const item = getAnswerById(id);
  if (!item) {
    appendMessage('duck', formatAnswerHtml(getFallbackMessage()));
    return;
  }

  let answerHtml = formatAnswerHtml(item.answer);

  if (item.action) {
    answerHtml += `<br><br><button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-sm duck-help-action" data-route="${item.action.route}">${escapeHtml(item.action.label)}</button>`;
  }

  appendMessage('duck', answerHtml);

  const actionBtn = messagesEl?.querySelector('.duck-help-message:last-child .duck-help-action');
  actionBtn?.addEventListener('click', () => {
    closePanel();
    navigate(actionBtn.dataset.route);
  });
}

function handleQuestion(id, userLabel) {
  appendMessage('user', escapeHtml(userLabel || id));
  showAnswer(id);
}

function handleUserInput(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  appendMessage('user', escapeHtml(trimmed));

  const match = findAnswerByText(trimmed);
  if (match) {
    showAnswer(match.id);
    return;
  }

  appendMessage('duck', formatAnswerHtml(getFallbackMessage()));
}

function openPanel() {
  if (!panel) return;
  isOpen = true;
  panel.hidden = false;
  panel.setAttribute('aria-hidden', 'false');
  root?.querySelector('.duck-help-fab')?.setAttribute('aria-expanded', 'true');

  if (!panel.dataset.initialized) {
    appendMessage('duck', formatAnswerHtml(getWelcomeMessage()));
    renderSuggestions();
    panel.dataset.initialized = 'true';
  }

  panel.querySelector('#duck-help-input')?.focus();
}

function closePanel() {
  if (!panel) return;
  isOpen = false;
  panel.hidden = true;
  panel.setAttribute('aria-hidden', 'true');
  root?.querySelector('.duck-help-fab')?.setAttribute('aria-expanded', 'false');
}

function togglePanel() {
  if (isOpen) closePanel();
  else openPanel();
}

function buildUi() {
  root = document.createElement('div');
  root.id = 'duck-help-root';
  root.className = 'duck-help-root';
  root.innerHTML = `
    <button type="button" class="duck-help-fab" aria-label="Abrir ajuda do ${APP_NAME}" aria-expanded="false" aria-controls="duck-help-panel">
      <img src="/favicon.png" alt="" class="duck-help-fab-icon" width="38" height="38" decoding="async" />
      <span class="duck-help-fab-badge" aria-hidden="true">?</span>
    </button>

    <div id="duck-help-panel" class="duck-help-panel" hidden aria-hidden="true" role="dialog" aria-labelledby="duck-help-title">
      <header class="duck-help-header">
        <div>
          <h2 id="duck-help-title" class="duck-help-title">${APP_NAME} , Ajuda</h2>
          <p class="duck-help-subtitle">Tire dúvidas sobre login, assinatura e erros</p>
        </div>
        <button type="button" class="duck-help-close btn-bloom btn-bloom-ghost btn-bloom-sm" aria-label="Fechar ajuda">
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </header>

      <div class="duck-help-messages" role="log" aria-live="polite" aria-relevant="additions"></div>

      <div class="duck-help-suggestions" aria-label="Sugestões de perguntas"></div>

      <form class="duck-help-form" id="duck-help-form">
        <label class="sr-only" for="duck-help-input">Sua dúvida</label>
        <input type="text" id="duck-help-input" placeholder="Digite sua dúvida..." maxlength="300" autocomplete="off" />
        <button type="submit" class="btn-bloom btn-bloom-primary btn-bloom-sm" aria-label="Enviar">
          <i class="bi bi-send-fill" aria-hidden="true"></i>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(root);

  panel = root.querySelector('#duck-help-panel');
  messagesEl = root.querySelector('.duck-help-messages');

  root.querySelector('.duck-help-fab')?.addEventListener('click', togglePanel);
  root.querySelector('.duck-help-close')?.addEventListener('click', closePanel);

  root.querySelector('#duck-help-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = root.querySelector('#duck-help-input');
    handleUserInput(input.value);
    input.value = '';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  document.addEventListener('click', (e) => {
    if (!isOpen || !root) return;
    if (root.contains(e.target)) return;
    closePanel();
  });
}

export function initDuckHelpChat() {
  if (document.getElementById('duck-help-root')) return;
  buildUi();
}

export function closeDuckHelpChat() {
  closePanel();
}
