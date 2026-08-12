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

const HELP_CHAT_POSITION_KEY = 'bloom-help-chat-position';
const DRAG_THRESHOLD_PX = 6;

let root = null;
let panel = null;
let messagesEl = null;
let fab = null;
let isOpen = false;
let isDragging = false;
let suppressFabClick = false;

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

function loadSavedPosition() {
  try {
    const raw = localStorage.getItem(HELP_CHAT_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x !== 'number' || typeof parsed?.y !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function savePosition(x, y) {
  localStorage.setItem(HELP_CHAT_POSITION_KEY, JSON.stringify({ x, y }));
}

function getRootBounds(rootEl) {
  return rootEl.getBoundingClientRect();
}

function clampPosition(x, y, rootEl) {
  const rect = getRootBounds(rootEl);
  const pad = 8;
  const width = rect.width || rootEl.offsetWidth;
  const height = rect.height || rootEl.offsetHeight;

  return {
    x: Math.min(Math.max(pad, x), window.innerWidth - width - pad),
    y: Math.min(Math.max(pad, y), window.innerHeight - height - pad),
  };
}

function applyPosition(rootEl, x, y) {
  const next = clampPosition(x, y, rootEl);
  rootEl.classList.add('duck-help-root--positioned');
  rootEl.style.left = `${next.x}px`;
  rootEl.style.top = `${next.y}px`;
  rootEl.style.right = 'auto';
  updatePanelFlip(rootEl);
  return next;
}

function updatePanelFlip(rootEl) {
  const rect = getRootBounds(rootEl);
  const centerY = rect.top + rect.height / 2;
  rootEl.classList.toggle('duck-help-root--flip', centerY > window.innerHeight * 0.55);
}

function restoreSavedPosition(rootEl) {
  const saved = loadSavedPosition();
  if (!saved) {
    updatePanelFlip(rootEl);
    return;
  }

  const next = applyPosition(rootEl, saved.x, saved.y);
  savePosition(next.x, next.y);
}

function persistCurrentPosition(rootEl) {
  const rect = getRootBounds(rootEl);
  savePosition(rect.left, rect.top);
}

function initDrag(rootEl, handleEl) {
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let moved = false;

  function finishDrag() {
    if (!isDragging) return;

    isDragging = false;
    handleEl.classList.remove('duck-help-fab--dragging');

    if (pointerId != null && handleEl.hasPointerCapture(pointerId)) {
      handleEl.releasePointerCapture(pointerId);
    }

    pointerId = null;

    if (moved) {
      persistCurrentPosition(rootEl);
      suppressFabClick = true;
      window.setTimeout(() => {
        suppressFabClick = false;
      }, 0);
    }

    moved = false;
  }

  handleEl.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;

    const rect = getRootBounds(rootEl);
    if (!rootEl.classList.contains('duck-help-root--positioned')) {
      applyPosition(rootEl, rect.left, rect.top);
    }

    isDragging = true;
    moved = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    originX = rootEl.offsetLeft;
    originY = rootEl.offsetTop;

    handleEl.setPointerCapture(pointerId);
    handleEl.classList.add('duck-help-fab--dragging');
  });

  handleEl.addEventListener('pointermove', (e) => {
    if (!isDragging || e.pointerId !== pointerId) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

    moved = true;
    e.preventDefault();
    applyPosition(rootEl, originX + dx, originY + dy);
  });

  handleEl.addEventListener('pointerup', finishDrag);
  handleEl.addEventListener('pointercancel', finishDrag);

  window.addEventListener('resize', () => {
    if (!rootEl.classList.contains('duck-help-root--positioned')) {
      updatePanelFlip(rootEl);
      return;
    }

    const rect = getRootBounds(rootEl);
    const next = applyPosition(rootEl, rect.left, rect.top);
    savePosition(next.x, next.y);
  });
}

function renderChatAvatar() {
  return '<img src="/favicon.png" alt="" class="duck-help-message-icon" width="28" height="28" decoding="async" />';
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
  fab?.setAttribute('aria-expanded', 'true');
  if (root) updatePanelFlip(root);

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
  fab?.setAttribute('aria-expanded', 'false');
  if (root) updatePanelFlip(root);
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
    <button type="button" class="duck-help-fab" aria-label="Abrir ajuda do ${APP_NAME}. Arraste para mover." aria-expanded="false" aria-controls="duck-help-panel">
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
  fab = root.querySelector('.duck-help-fab');

  restoreSavedPosition(root);
  initDrag(root, fab);

  requestAnimationFrame(() => {
    if (root.classList.contains('duck-help-root--positioned')) {
      const rect = getRootBounds(root);
      const next = applyPosition(root, rect.left, rect.top);
      savePosition(next.x, next.y);
    } else {
      updatePanelFlip(root);
    }
  });

  fab?.addEventListener('click', () => {
    if (suppressFabClick) return;
    togglePanel();
  });
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
