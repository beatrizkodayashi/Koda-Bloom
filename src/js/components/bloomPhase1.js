import { renderCard } from './card.js';
import { renderIcon } from './icons.js';
import { APP_NAME, HEALTH_DISCLAIMER } from '../config/app.js';
import { getCycleExplanation } from '../services/bloomPhase1Service.js';

const PHASE_ICONS = {
  menstruation: 'period',
  follicular: 'seedling',
  ovulation: 'sparkles',
  luteal: 'moon',
};

let explainContext = {};

export function setExplainContext(ctx) {
  explainContext = ctx || {};
}

export function renderCycleJourneyCard(journey) {
  if (!journey) return '';

  const nodes = journey.phases
    .map((phase, i) => {
      const active = i === journey.activeIndex;
      const done = i < journey.activeIndex;
      return `
        <div class="cycle-journey-node ${active ? 'cycle-journey-node--active' : ''} ${done ? 'cycle-journey-node--done' : ''}" data-phase="${phase.id}">
          <div class="cycle-journey-node-top">
            ${active ? `
              <div class="cycle-journey-duck">
                <img src="/pato_correndo.png" alt="" width="40" height="40" class="cycle-journey-duck-img" />
              </div>
            ` : ''}
          </div>
          <span class="cycle-journey-dot" aria-hidden="true"></span>
          <span class="cycle-journey-label">${phase.label}</span>
          ${active ? '<span class="cycle-journey-here">Você está aqui</span>' : '<span class="cycle-journey-here cycle-journey-here--placeholder" aria-hidden="true">&nbsp;</span>'}
        </div>
      `;
    })
    .join('');

  return renderCard(
    'Onde estou no ciclo?',
    `
    <div class="cycle-journey" role="img" aria-label="Dia ${journey.cycleDay} do ciclo, fase ${journey.phaseLabel}">
      <div class="cycle-journey-track">
        <div class="cycle-journey-rail" aria-hidden="true">
          <div class="cycle-journey-progress" style="width: ${journey.phaseProgress}%"></div>
        </div>
        <div class="cycle-journey-nodes">${nodes}</div>
      </div>
      <div class="cycle-journey-meta">
        <p class="cycle-journey-day mb-0">
          ${renderIcon(PHASE_ICONS[journey.phase] || 'heart-soft', 'bloom-icon bloom-icon--sm')}
          <strong>Dia ${journey.cycleDay}</strong> · ${journey.phaseLabel}
        </p>
      </div>
      <div class="cycle-journey-footer">
        <button type="button" class="btn btn-sm btn-outline-bloom duck-explain-trigger" data-explain="body">
          ${renderIcon('thought', 'bloom-icon bloom-icon--sm')} Bloom, me explica
        </button>
      </div>
    </div>
  `,
    { className: 'card-bloom-soft cycle-journey-card' }
  );
}

export function renderPhaseSelfComparisonCard(comparison) {
  if (!comparison) return '';

  const rows = comparison.metrics
    .map((m) => {
      const cls = m.delta.neutral
        ? 'self-compare-delta--neutral'
        : m.delta.pct > 0
          ? 'self-compare-delta--up'
          : 'self-compare-delta--down';
      return `
        <div class="self-compare-row">
          <span class="self-compare-label">${m.label}</span>
          <span class="self-compare-delta ${cls}">
            <span class="self-compare-arrow">${m.delta.arrow}</span>
            ${m.delta.neutral ? 'parecido com seu padrão' : `${m.delta.label} vs seu histórico`}
          </span>
        </div>
      `;
    })
    .join('');

  return renderCard(
    'Você × você',
    `
    <p class="self-compare-intro mb-3">${comparison.intro}</p>
    <div class="self-compare-grid">${rows}</div>
    <p class="text-muted mb-0 mt-3"><small>Comparando esta ${comparison.phaseLabel.toLowerCase()} com suas fases anteriores semelhantes.</small></p>
  `,
    { className: 'card-bloom-soft self-compare-card' }
  );
}

export function renderMyPatternPage(pattern) {
  const header = `
    <section class="page-mascot-section page-mascot-section--pattern">
      <div class="page-header">
        <h1>Meu padrão</h1>
        <p>O que o Bloom aprendeu sobre você</p>
      </div>
      <div class="duck-companion">
        <img src="/pato_caderno.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--pattern" width="200" height="200" decoding="async" />
        <p class="mascot-caption">${pattern.enoughData ? pattern.duckIntro : 'Cada registro me ajuda a entender seu ritmo, no seu tempo.'}</p>
      </div>
    </section>
  `;

  if (!pattern.enoughData) {
    const steps = [
      {
        done: pattern.cycleCount >= 1,
        title: 'Registre sua menstruação',
        hint: 'Marque o início de pelo menos 2 ciclos no calendário.',
      },
      {
        done: pattern.totalCheckins >= 3,
        title: 'Faça check-ins diários',
        hint: 'Humor, energia e sintomas deixam o padrão mais rico.',
      },
      {
        done: pattern.cycleCount >= 2,
        title: 'Complete 2 ciclos',
        hint: 'Aí eu monto seu retrato pessoal completo.',
      },
    ];

    return `
      ${header}
      <div class="card-stack my-pattern-page">
        ${renderCard('Quase lá', `
          <div class="my-pattern-progress">
            <div class="my-pattern-progress-head">
              <span class="my-pattern-progress-label">Progresso do seu padrão</span>
              <span class="my-pattern-progress-value">${pattern.cycleCount}/2 ciclos</span>
            </div>
            <div class="my-pattern-progress-bar" role="progressbar" aria-valuenow="${pattern.readinessPercent}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso do padrão">
              <span class="my-pattern-progress-fill" style="width: ${pattern.readinessPercent}%"></span>
            </div>
            <p class="my-pattern-progress-hint mb-0">
              ${pattern.cyclesUntilReady === 2
                ? 'Comece registrando sua menstruação, eu cuido do resto com carinho.'
                : `Faltam ${pattern.cyclesUntilReady} ciclo${pattern.cyclesUntilReady > 1 ? 's' : ''} para eu montar seu padrão completo.`}
            </p>
          </div>
        `, { className: 'card-bloom-soft' })}

        ${renderCard('Como desbloquear', `
          <ol class="my-pattern-steps mb-0">
            ${steps
              .map(
                (step) => `
              <li class="my-pattern-step ${step.done ? 'my-pattern-step--done' : ''}">
                <span class="my-pattern-step-icon" aria-hidden="true">${step.done ? '✓' : '○'}</span>
                <div>
                  <p class="my-pattern-step-title mb-1">${step.title}</p>
                  <p class="my-pattern-step-hint mb-0">${step.hint}</p>
                </div>
              </li>
            `
              )
              .join('')}
          </ol>
        `, { className: 'card-bloom-soft' })}

        <div class="my-pattern-actions">
          <button type="button" class="btn-bloom btn-bloom-primary w-100" id="btn-pattern-register">
            ${renderIcon('calendar', 'bloom-icon bloom-icon--sm')} Registrar ciclo
          </button>
          <button type="button" class="btn-bloom btn-bloom-secondary w-100" id="btn-pattern-checkin">
            ${renderIcon('heart-soft', 'bloom-icon bloom-icon--sm')} Fazer check-in
          </button>
        </div>
      </div>
    `;
  }

  const statCards = [
    pattern.avgCycle && {
      icon: 'calendar',
      label: 'Ciclo médio',
      value: formatDays(pattern.avgCycle),
      hint: 'Entre menstruações registradas',
    },
    {
      icon: 'period',
      label: 'Menstruação',
      value: `~${pattern.avgPeriod} dias`,
      hint: 'Duração habitual',
    },
    pattern.variation != null && {
      icon: 'cycle',
      label: 'Variação',
      value: `±${pattern.variation} dias`,
      hint: 'Entre seus ciclos recentes',
    },
    pattern.avgPain != null && {
      icon: 'pain',
      label: 'Cólica média',
      value: `${pattern.avgPain}/10`,
      hint: 'Nos seus check-ins',
    },
  ].filter(Boolean);

  const discoveries = [
    pattern.topSymptom && {
      icon: 'pain',
      title: 'Sintoma mais comum',
      body: `${pattern.topSymptom.label} apareceu ${pattern.topSymptom.count} ve${pattern.topSymptom.count > 1 ? 'zes' : 'z'} nos registros.`,
    },
    pattern.maxEnergyDay && {
      icon: 'energy',
      title: 'Pico de energia',
      body: `Você tende a ter mais energia por volta do dia ${pattern.maxEnergyDay} do ciclo.`,
    },
    pattern.minEnergyDay &&
      pattern.minEnergyDay !== pattern.maxEnergyDay && {
        icon: 'moon',
        title: 'Dia mais lento',
        body: `Energia mais baixa costuma aparecer perto do dia ${pattern.minEnergyDay}.`,
      },
    pattern.phaseLabel &&
      pattern.cycleDay && {
        icon: 'seedling',
        title: 'Agora',
        body: `Hoje você está no dia ${pattern.cycleDay}, na ${pattern.phaseLabel.toLowerCase()}.`,
      },
  ].filter(Boolean);

  return `
    ${header}
    <div class="card-stack my-pattern-page">
      ${renderCard('O Bloom te conta', `
        <div class="my-pattern-hero">
          <div class="my-pattern-hero-bubble">
            <p class="my-pattern-hero-quote mb-0">"${pattern.duckIntro}"</p>
          </div>
          <div class="my-pattern-hero-meta">
            <span>${pattern.cycleCount} ciclo${pattern.cycleCount > 1 ? 's' : ''}</span>
            <span aria-hidden="true">·</span>
            <span>${pattern.totalCheckins} check-in${pattern.totalCheckins > 1 ? 's' : ''}</span>
          </div>
        </div>
      `, { className: 'card-bloom-soft my-pattern-hero-card' })}

      <div class="feature-grid my-pattern-stats">
        ${statCards
          .map((stat) =>
            renderCard(
              stat.label,
              `
              <div class="my-pattern-stat">
                <span class="my-pattern-stat-icon">${renderIcon(stat.icon, 'bloom-icon bloom-icon--md')}</span>
                <p class="stat-value mb-1">${stat.value}</p>
                <p class="my-pattern-stat-hint mb-0"><small>${stat.hint}</small></p>
              </div>
            `,
              { className: 'card-bloom--compact' }
            )
          )
          .join('')}
      </div>

      ${discoveries.length ? renderCard('Descobertas sobre você', `
        <div class="my-pattern-discoveries">
          ${discoveries
            .map(
              (item) => `
            <article class="my-pattern-discovery">
              <span class="my-pattern-discovery-icon">${renderIcon(item.icon, 'bloom-icon bloom-icon--md')}</span>
              <div>
                <p class="my-pattern-discovery-title mb-1">${item.title}</p>
                <p class="my-pattern-discovery-body mb-0">${item.body}</p>
              </div>
            </article>
          `
            )
            .join('')}
        </div>
      `, { className: 'card-bloom-soft' }) : ''}

      <p class="my-pattern-disclaimer">${HEALTH_DISCLAIMER}</p>
    </div>
  `;
}

function formatDays(n) {
  return `${n} dias`;
}

function ensureExplainModal() {
  let modal = document.getElementById('duck-explain-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'duck-explain-modal';
  modal.className = 'duck-explain-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="duck-explain-backdrop" data-close-explain></div>
    <div class="duck-explain-sheet" role="dialog" aria-labelledby="duck-explain-title" aria-modal="true">
      <button type="button" class="duck-explain-close" data-close-explain aria-label="Fechar">&times;</button>
      <div class="duck-explain-duck">
        <img src="/pato_padrao.png" alt="" width="56" height="56" />
      </div>
      <h2 id="duck-explain-title" class="duck-explain-title"></h2>
      <p class="duck-explain-body"></p>
      <p class="duck-explain-disclaimer mb-0"><small></small></p>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-explain]')) {
      e.preventDefault();
      closeDuckExplain();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeDuckExplain();
  });

  return modal;
}

export function openDuckExplain(topic) {
  const content = getCycleExplanation(topic, explainContext);
  const modal = ensureExplainModal();

  modal.querySelector('.duck-explain-title').textContent = content.title;
  modal.querySelector('.duck-explain-body').textContent = content.body;
  modal.querySelector('.duck-explain-disclaimer small').textContent = content.disclaimer;
  modal.hidden = false;
  document.body.classList.add('duck-explain-open');
}

export function closeDuckExplain() {
  const modal = document.getElementById('duck-explain-modal');
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('duck-explain-open');
}

export function mountDuckExplain(root) {
  if (!root) return;

  root.addEventListener('click', (e) => {
    const trigger = e.target.closest('.duck-explain-trigger');
    if (!trigger) return;
    e.preventDefault();
    openDuckExplain(trigger.dataset.explain || 'body');
  });
}
