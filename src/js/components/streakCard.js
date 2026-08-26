import { formatStreakLabel } from '../utils/streak.js';

export function renderStreakCard({
  streak,
  buttonId = 'btn-streak-register',
  buttonLabel = 'Registrar hoje',
  compact = false,
} = {}) {
  return `
    <div class="calendar-streak-card${compact ? ' calendar-streak-card--compact' : ''}" role="region" aria-label="Sequência de registros">
      <div class="calendar-streak-card-main">
        <div class="calendar-streak-card-icon" aria-hidden="true">
          <i class="bi bi-heart-fill"></i>
        </div>
        <div class="calendar-streak-card-text">
          <span class="calendar-streak-card-count">${streak}</span>
          <span class="calendar-streak-card-label">${formatStreakLabel(streak)}</span>
        </div>
      </div>
      <button type="button" class="btn-bloom btn-bloom-primary btn-bloom-sm calendar-streak-card-action" id="${buttonId}">
        ${compact ? 'Registrar' : buttonLabel}
      </button>
    </div>
  `;
}
