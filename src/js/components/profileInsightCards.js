import { renderCard } from './card.js';
import { renderIcon } from './icons.js';

export function renderMyPatternPromoCard(summary) {
  const ready = summary.cycleCount >= 2;
  const hint = ready
    ? 'Descobertas, números e o tom do Bloom, tudo sobre você.'
    : `Registre mais ${Math.max(0, 2 - summary.cycleCount)} ciclo(s) para eu montar seu retrato completo.`;

  return `
    <button type="button" class="profile-pattern-card" id="btn-go-padrao">
      <span class="profile-pattern-card-glow" aria-hidden="true"></span>
      <span class="profile-pattern-card-inner">
        <span class="profile-pattern-card-duck">
          <img src="/pato_caderno.png" alt="" width="72" height="72" decoding="async" />
        </span>
        <span class="profile-pattern-card-copy">
          <span class="profile-pattern-card-eyebrow">${renderIcon('sparkles', 'bloom-icon bloom-icon--sm')} Seu padrão</span>
          <span class="profile-pattern-card-title">Meu padrão</span>
          <span class="profile-pattern-card-text">${hint}</span>
          <span class="profile-pattern-card-meta">
            ${summary.cycleCount} ciclo${summary.cycleCount !== 1 ? 's' : ''} · ${summary.totalCheckins} check-in${summary.totalCheckins !== 1 ? 's' : ''}
          </span>
        </span>
        <span class="profile-pattern-card-arrow" aria-hidden="true">
          <i class="bi bi-arrow-right"></i>
        </span>
      </span>
    </button>
  `;
}

export function renderSignatureCard(summary) {
  if (summary.signatureMood) {
    return renderCard('Sua assinatura emocional', `
      <div class="profile-signature">
        <span class="profile-signature-icon">${renderIcon(summary.signatureMood.moodIcon, 'bloom-icon bloom-icon--xl')}</span>
        <div>
          <p class="profile-signature-mood mb-1">${summary.signatureMood.label}</p>
          <p class="text-muted mb-0"><small>Apareceu ${summary.signatureMood.count} vez${summary.signatureMood.count > 1 ? 'es' : ''} nos seus registros recentes.</small></p>
        </div>
      </div>
    `, { className: 'card-bloom-soft' });
  }

  return renderCard('Sua assinatura emocional', `
    <p class="text-muted mb-0">Registre seu humor no check-in diário e eu mostro aqui o que mais aparece nos seus dias.</p>
  `, { className: 'card-bloom-soft' });
}

export function renderBadgesCard(summary) {
  return renderCard('Suas conquistas', `
    <p class="text-muted mb-0"><small>${summary.unlockedBadges.length} de ${summary.badges.length} desbloqueadas, cada uma conta sua jornada com o Bloom.</small></p>
    <div class="profile-badges" role="list">
      ${summary.badges.map((badge) => `
        <div class="profile-badge${badge.unlocked ? ' profile-badge--unlocked' : ''}" role="listitem" title="${badge.hint}">
          <span class="profile-badge-icon">${renderIcon(badge.icon, 'bloom-icon bloom-icon--md')}</span>
          <span class="profile-badge-label">${badge.label}</span>
        </div>
      `).join('')}
    </div>
  `);
}
