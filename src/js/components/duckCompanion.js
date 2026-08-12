/**
 * Duck Companion , mascote Bloom (estados SVG)
 */

import { APP_NAME } from '../config/app.js';

const DUCK_STATES = {
  welcome: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="95" rx="35" ry="8" fill="rgba(61,44,51,0.08)"/>
    <ellipse cx="60" cy="55" rx="32" ry="30" fill="#FFD93D"/>
    <ellipse cx="60" cy="30" rx="22" ry="14" fill="#FFB6C9"/>
    <circle cx="48" cy="28" r="6" fill="#FF8FAB"/><circle cx="60" cy="24" r="6" fill="#FFC2D4"/><circle cx="72" cy="28" r="6" fill="#FF8FAB"/>
    <circle cx="50" cy="52" r="4" fill="#4A3728"/><circle cx="70" cy="52" r="4" fill="#4A3728"/>
    <path d="M54 62 Q60 68 66 62" stroke="#E8879B" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="88" cy="58" rx="12" ry="8" fill="#FFA726" transform="rotate(15 88 58)"/>
    <path d="M30 70 Q20 85 28 95" stroke="#FFD93D" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M90 70 Q100 85 92 95" stroke="#FFD93D" stroke-width="8" fill="none" stroke-linecap="round"/>
  </svg>`,
  happy: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="95" rx="35" ry="8" fill="rgba(61,44,51,0.08)"/>
    <ellipse cx="60" cy="55" rx="32" ry="30" fill="#FFD93D"/>
    <ellipse cx="60" cy="30" rx="22" ry="14" fill="#FFB6C9"/>
    <circle cx="50" cy="52" r="4" fill="#4A3728"/><circle cx="70" cy="52" r="4" fill="#4A3728"/>
    <path d="M50 64 Q60 74 70 64" stroke="#E8879B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="88" cy="58" rx="12" ry="8" fill="#FFA726" transform="rotate(15 88 58)"/>
  </svg>`,
  sleeping: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="95" rx="35" ry="8" fill="rgba(61,44,51,0.08)"/>
    <ellipse cx="60" cy="58" rx="32" ry="28" fill="#FFD93D"/>
    <ellipse cx="60" cy="32" rx="22" ry="14" fill="#C4B5D4"/>
    <path d="M46 50 Q50 46 54 50" stroke="#4A3728" stroke-width="2" fill="none"/>
    <path d="M66 50 Q70 46 74 50" stroke="#4A3728" stroke-width="2" fill="none"/>
    <text x="78" y="38" font-size="14" fill="#8BB4D4">z</text>
    <text x="86" y="30" font-size="10" fill="#8BB4D4">z</text>
    <ellipse cx="88" cy="60" rx="12" ry="8" fill="#FFA726" transform="rotate(15 88 60)"/>
  </svg>`,
  period: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="95" rx="35" ry="8" fill="rgba(61,44,51,0.08)"/>
    <ellipse cx="60" cy="55" rx="32" ry="30" fill="#FFD93D"/>
    <ellipse cx="60" cy="30" rx="22" ry="14" fill="#FFB6C9"/>
    <circle cx="50" cy="52" r="4" fill="#4A3728"/><circle cx="70" cy="52" r="4" fill="#4A3728"/>
    <path d="M54 64 Q60 68 66 64" stroke="#E8879B" stroke-width="2" fill="none"/>
    <rect x="82" y="48" width="20" height="16" rx="4" fill="#E8879B" opacity="0.7"/>
    <path d="M82 52 L102 52" stroke="#fff" stroke-width="1" opacity="0.5"/>
    <ellipse cx="88" cy="58" rx="12" ry="8" fill="#FFA726" transform="rotate(15 88 58)"/>
  </svg>`,
  flower: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="95" rx="35" ry="8" fill="rgba(61,44,51,0.08)"/>
    <ellipse cx="60" cy="55" rx="32" ry="30" fill="#FFD93D"/>
    <ellipse cx="60" cy="30" rx="22" ry="14" fill="#FFB6C9"/>
    <circle cx="50" cy="52" r="4" fill="#4A3728"/><circle cx="70" cy="52" r="4" fill="#4A3728"/>
    <path d="M50 64 Q60 74 70 64" stroke="#E8879B" stroke-width="2.5" fill="none"/>
    <circle cx="20" cy="70" r="8" fill="#FF8FAB" opacity="0.8"/>
    <circle cx="100" cy="65" r="6" fill="#FFC2D4" opacity="0.8"/>
    <circle cx="15" cy="50" r="5" fill="#A8D5BA" opacity="0.8"/>
    <ellipse cx="88" cy="58" rx="12" ry="8" fill="#FFA726" transform="rotate(15 88 58)"/>
  </svg>`,
  celebrating: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="95" rx="35" ry="8" fill="rgba(61,44,51,0.08)"/>
    <ellipse cx="60" cy="50" rx="32" ry="30" fill="#FFD93D" transform="translate(0,-5)"/>
    <ellipse cx="60" cy="25" rx="22" ry="14" fill="#FFB6C9"/>
    <circle cx="50" cy="47" r="4" fill="#4A3728"/><circle cx="70" cy="47" r="4" fill="#4A3728"/>
    <path d="M48 60 Q60 72 72 60" stroke="#E8879B" stroke-width="2.5" fill="none"/>
    <path d="M30 30 L35 40 M90 30 L85 40 M60 15 L60 25" stroke="#FFD93D" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="88" cy="53" rx="12" ry="8" fill="#FFA726" transform="rotate(15 88 53)"/>
  </svg>`,
  empty: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="95" rx="35" ry="8" fill="rgba(61,44,51,0.08)"/>
    <ellipse cx="60" cy="55" rx="32" ry="30" fill="#FFD93D"/>
    <ellipse cx="60" cy="30" rx="22" ry="14" fill="#FFB6C9"/>
    <circle cx="50" cy="52" r="4" fill="#4A3728"/><circle cx="70" cy="52" r="4" fill="#4A3728"/>
    <ellipse cx="88" cy="58" rx="12" ry="8" fill="#FFA726" transform="rotate(15 88 58)"/>
    <path d="M40 75 L50 85 M80 75 L70 85" stroke="#8BB4D4" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  thinking: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="95" rx="35" ry="8" fill="rgba(61,44,51,0.08)"/>
    <ellipse cx="60" cy="55" rx="32" ry="30" fill="#FFD93D"/>
    <ellipse cx="60" cy="30" rx="22" ry="14" fill="#FFB6C9"/>
    <circle cx="50" cy="52" r="4" fill="#4A3728"/><circle cx="70" cy="52" r="4" fill="#4A3728"/>
    <path d="M56 64 Q60 66 64 64" stroke="#E8879B" stroke-width="2" fill="none"/>
    <circle cx="90" cy="35" r="4" fill="none" stroke="#8BB4D4" stroke-width="1.5"/>
    <circle cx="98" cy="25" r="5" fill="none" stroke="#8BB4D4" stroke-width="1.5"/>
    <ellipse cx="88" cy="58" rx="12" ry="8" fill="#FFA726" transform="rotate(15 88 58)"/>
  </svg>`,
};

const DUCK_MESSAGES = {
  welcome: 'Oi! Que bom ter você aqui. Vamos conhecer seu ciclo juntas?',
  happy: 'Continue registrando , cada informação ajuda a entender melhor seu corpo.',
  sleeping: 'Descanse bem. Seu corpo também precisa de pausa.',
  period: 'Cuidado extra hoje. Hidrate-se e escute seu corpo.',
  flower: 'Você está florescendo nesta fase do ciclo!',
  celebrating: 'Registro salvo! Parabéns por cuidar de você.',
  empty: 'Que tal fazer seu primeiro registro? Eu te acompanho!',
  thinking: 'Estou analisando seus padrões...',
};

let currentState = 'welcome';

export function setDuckState(state) {
  if (DUCK_STATES[state]) currentState = state;
}

export function getDuckState() {
  return currentState;
}

export function renderDuckCompanion(options = {}) {
  const { state = currentState, message, size = 'md', className = '' } = options;
  const duckState = DUCK_STATES[state] || DUCK_STATES.welcome;
  const duckMessage = message !== undefined ? message : (DUCK_MESSAGES[state] ?? '');

  const sizeClass = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : '';

  return `
    <div class="duck-companion ${sizeClass} ${state === 'celebrating' ? 'celebrating' : ''} ${className}" role="img" aria-label="${APP_NAME}, mascote do app">
      ${duckState}
      ${duckMessage ? `<p class="mascot-caption">${duckMessage}</p>` : ''}
    </div>
  `;
}

export function duckStateForPhase(phase) {
  const map = {
    menstruation: 'period',
    follicular: 'flower',
    ovulation: 'flower',
    luteal: 'sleeping',
    unknown: 'thinking',
  };
  return map[phase] || 'happy';
}

export function generateDailySummary({ cycleDay, phase, mood, symptoms = [], painLevel }) {
  let msg = `Hoje você está no dia ${cycleDay} do ciclo. `;

  if (mood) msg += `Você registrou humor ${mood}. `;
  if (symptoms.length) msg += `Notou ${symptoms.slice(0, 2).join(' e ')}. `;
  if (painLevel && painLevel > 5) msg += 'Que tal pegar leve hoje?';
  else if (phase === 'follicular') msg += 'Energia pode estar aumentando , aproveite!';
  else msg += 'Cuide-se com carinho.';

  return msg;
}
