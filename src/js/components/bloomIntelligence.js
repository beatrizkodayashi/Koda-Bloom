import { renderCard } from './card.js';
import { APP_NAME } from '../config/app.js';
import { renderIcon } from './icons.js';

function retroItem(iconId, text) {
  return `<li class="cycle-retro-item">${renderIcon(iconId, 'bloom-icon bloom-icon--sm')}<span>${text}</span></li>`;
}

export function renderPredictionConfidenceCard(prediction) {
  if (!prediction) return '';

  return renderCard('Próxima menstruação', `
    <div class="bloom-prediction">
      <p class="bloom-prediction-headline">${renderIcon('heart-soft', 'bloom-icon bloom-icon--sm')} ${prediction.headline}</p>
      <p class="text-muted mb-3"><small>${prediction.formattedDate}</small></p>
      <div class="bloom-confidence-bar" role="progressbar" aria-valuenow="${prediction.percent}" aria-valuemin="0" aria-valuemax="100" aria-label="Confiança da previsão">
        <span class="bloom-confidence-fill" style="width: ${prediction.percent}%"></span>
      </div>
      <div class="bloom-confidence-meta">
        <span class="bloom-confidence-percent">${prediction.percent}%</span>
        <span class="bloom-confidence-label">confiança</span>
      </div>
      <p class="bloom-prediction-explanation mb-0"><small>${prediction.explanation}</small></p>
    </div>
  `, { className: 'card-bloom-soft bloom-prediction-card' });
}

export function renderDuckObservationsCard(observations) {
  if (!observations.length) {
    return renderCard('O Bloom percebeu', `
      <p class="text-muted mb-0">Continue registrando por alguns ciclos, eu começo a notar padrões só seus.</p>
    `, { className: 'card-bloom-soft' });
  }

  return renderCard('O Bloom percebeu', `
    <div class="duck-observations">
      ${observations.map((obs) => `
        <article class="duck-observation duck-observation--${obs.category}">
          <div class="duck-observation-icon">${renderIcon(obs.icon, 'bloom-icon bloom-icon--md')}</div>
          <div>
            <p class="duck-observation-title">${obs.title}</p>
            <p class="duck-observation-body mb-0">${obs.body}</p>
          </div>
        </article>
      `).join('')}
    </div>
  `, { className: 'card-bloom-soft' });
}

export function renderAnomalyAlert(anomaly) {
  if (!anomaly) return '';

  return `
    <div class="bloom-anomaly-alert" role="alert">
      <div class="bloom-anomaly-icon">${renderIcon(anomaly.icon, 'bloom-icon bloom-icon--md')}</div>
      <div>
        <p class="bloom-anomaly-title">${anomaly.title}</p>
        <p class="bloom-anomaly-body">${anomaly.body}</p>
        <p class="bloom-anomaly-disclaimer mb-0"><small>${anomaly.disclaimer}</small></p>
      </div>
    </div>
  `;
}

export function renderCycleComparisonCard(comparison) {
  if (!comparison) return '';

  return renderCard('Este ciclo × ciclo anterior', `
    <div class="cycle-comparison-table-wrap">
      <table class="cycle-comparison-table">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">Anterior</th>
            <th scope="col">Atual</th>
          </tr>
        </thead>
        <tbody>
          ${comparison.rows.map((row) => `
            <tr>
              <th scope="row">${row.label}</th>
              <td>${row.previous}</td>
              <td>${row.current}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="cycle-comparison-duck">
      ${renderIcon('duck', 'bloom-icon bloom-icon--sm')}
      <p class="mb-0">${comparison.duckReaction}</p>
    </div>
  `);
}

export function renderCycleRetrospectiveCard(retro) {
  if (!retro) return '';

  return renderCard(`Seu ciclo #${retro.cycleNumber}`, `
    <p class="cycle-retro-title">${renderIcon('sparkles', 'bloom-icon bloom-icon--sm')} Retrospectiva do ciclo</p>
    <p class="text-muted mb-3"><small>${retro.startLabel} → ${retro.endLabel}</small></p>
    <ul class="cycle-retro-list mb-0">
      ${retroItem('period', `${retro.periodLen} dias de menstruação`)}
      ${retroItem('moon', `${retro.duration} dias de ciclo`)}
      ${retroItem('heart', `Humor predominante: ${retro.mood}`)}
      ${retroItem('energy', `Energia média: ${retro.avgEnergy}/10`)}
      ${retroItem('pain', `Sintoma mais registrado: ${retro.topSymptom}`)}
    </ul>
    <div class="cycle-retro-duck mt-4">
      ${renderIcon('duck', 'bloom-icon bloom-icon--sm')}
      <p class="mb-0"><strong>"${retro.duckVerdict}"</strong></p>
    </div>
  `, { className: 'card-bloom-soft' });
}

function renderSimulatorChips(groupId, options, selectedValue = '') {
  return `
    <div class="chip-grid cycle-simulator-options" id="${groupId}" role="group">
      ${options.map(({ value, label }) => `
        <button
          type="button"
          class="chip${String(value) === String(selectedValue) ? ' selected' : ''}"
          data-value="${value}"
          aria-pressed="${String(value) === String(selectedValue)}"
        >${label}</button>
      `).join('')}
    </div>
  `;
}

export function renderCycleSimulator({ lastPeriodStart, avgCycle, avgPeriod, simulation }) {
  if (!lastPeriodStart) return '';

  return renderCard('E se meu ciclo mudar?', `
    <p class="text-muted mb-0"><small>Teste cenários, o calendário mental se reorganiza aqui.</small></p>
    <div class="cycle-simulator-controls mt-4">
      <div class="form-bloom">
        <span class="cycle-simulator-label">E se a menstruação viesse…</span>
        ${renderSimulatorChips('sim-offset', [
          { value: '-3', label: '3 dias antes' },
          { value: '-1', label: '1 dia antes' },
          { value: '0', label: 'No previsto' },
          { value: '2', label: '2 dias depois' },
          { value: '5', label: '5 dias depois' },
        ], '0')}
      </div>
      <div class="form-bloom">
        <span class="cycle-simulator-label">E se meu ciclo durasse…</span>
        ${renderSimulatorChips('sim-cycle', [
          { value: '', label: `Média atual (${avgCycle} dias)` },
          { value: '25', label: '25 dias' },
          { value: '28', label: '28 dias' },
          { value: '32', label: '32 dias' },
          { value: '35', label: '35 dias' },
        ], '')}
      </div>
    </div>
    <div id="sim-result" class="cycle-simulator-result mt-4">
      ${renderSimulatorResult(simulation)}
    </div>
  `);
}

export function renderSimulatorResult(simulation) {
  if (!simulation) return '<p class="text-muted mb-0">Ajuste os cenários acima.</p>';

  return `
    <p class="cycle-simulator-summary">${simulation.summary}</p>
    <div class="cycle-simulator-phases">
      ${simulation.phases.map((p) => `
        <div class="cycle-simulator-phase">
          <span class="cycle-simulator-phase-label">${p.label}</span>
          <span class="cycle-simulator-phase-dates">${p.start}${p.end && p.end !== p.start ? ` → ${p.end}` : ''}</span>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderSymptomBodyMap(bodyMap) {
  const active = bodyMap.filter((z) => z.active);
  if (!active.length) {
    return renderCard('Mapa de sintomas', `
      <p class="text-muted mb-0">Registre sintomas no check-in e eu mostro onde seu corpo mais pediu atenção neste ciclo.</p>
    `);
  }

  return renderCard('Onde você sentiu sintomas?', `
    <p class="text-muted mb-0 text-center"><small>Com base nos seus registros recentes.</small></p>
    <div class="row row-cols-2 row-cols-sm-3 g-3 mt-4 mx-0 justify-content-center symptom-body-map">
      ${active.map((zone) => `
        <div class="col">
          <div class="symptom-body-zone symptom-body-zone--active" style="--zone-intensity: ${Math.min(zone.intensity, 5)}">
            <span class="symptom-body-zone-icon">${renderIcon(zone.icon, 'bloom-icon bloom-icon--md')}</span>
            <span class="symptom-body-zone-label">${zone.label}</span>
            <span class="symptom-body-zone-count">${zone.intensity}×</span>
          </div>
        </div>
      `).join('')}
    </div>
  `, { className: 'card-bloom-soft' });
}

export function renderPersonalizedTips(tips) {
  if (!tips.length) return '';

  return renderCard('O Bloom aprende com você', `
    <div class="bloom-tips">
      ${tips.map((tip) => `
        <div class="bloom-tip${tip.action ? ' bloom-tip--action' : ''}" data-tip-action="${tip.action || ''}">
          <span class="bloom-tip-icon">${renderIcon(tip.icon, 'bloom-icon bloom-icon--sm')}</span>
          <p class="mb-0">${tip.text}</p>
        </div>
      `).join('')}
    </div>
  `, { className: 'card-bloom-soft' });
}

export function renderSmartFollowUpBanner(followUp) {
  if (!followUp) return '';

  return `
    <div class="smart-followup-banner" id="smart-followup">
      <div class="smart-followup-duck">${renderIcon('duck', 'bloom-icon bloom-icon--md')}</div>
      <div class="smart-followup-copy">
        <p class="smart-followup-question mb-2">${followUp.question}</p>
        <div class="smart-followup-actions">
          <button type="button" class="btn-bloom btn-bloom-primary btn-bloom-sm" data-followup="yes">Sim, melhorou</button>
          <button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-sm" data-followup="no">Ainda não</button>
        </div>
      </div>
    </div>
  `;
}

export function renderCareModeButton() {
  return `
    <button type="button" class="btn-bloom btn-bloom-care w-100 mt-4" id="btn-care-mode">
      <img src="/pato_triste.png" alt="" width="28" height="28" class="care-btn-duck" decoding="async" />
      Hoje não tô bem
    </button>
  `;
}

export function renderCareModePage(status = {}) {
  const {
    restActive = false,
    hydrationActive = false,
    discreteActive = false,
  } = status;

  const actions = [
    { id: 'care-breathe', icon: 'wind', label: 'Respiração guiada' },
    { id: 'care-water', icon: 'water', label: hydrationActive ? 'Hidratação ativa (toque para desligar)' : 'Lembrete de hidratação' },
    { id: 'care-rest', icon: 'bed', label: restActive ? 'Modo descanso ativo (toque para desligar)' : 'Modo descanso' },
    { id: 'care-journal', icon: 'book', label: 'Diário emocional' },
  ];

  return `
    <div class="care-mode-page gradient-bg floral-pattern">
      <div class="care-mode-inner">
        <section class="care-mode-hero">
          <div class="care-mode-mascot-wrap">
            <img src="/pato_triste.png" alt="${APP_NAME}" class="bloom-mascot-img care-mode-mascot" width="140" height="140" decoding="async" />
          </div>
          <h1>Hoje não tô bem</h1>
          <p class="care-mode-intro">Escolha só uma coisa por agora.</p>
          <p class="care-mode-subtitle">Tudo bem não estar bem. Vamos com calma, só o que você precisar hoje.</p>
        </section>

        <div class="care-mode-actions">
          ${actions.map((action) => `
            <button type="button" class="care-mode-action${(action.id === 'care-rest' && restActive) || (action.id === 'care-water' && hydrationActive) ? ' care-mode-action--active' : ''}" id="${action.id}">
              ${renderIcon(action.icon, 'bloom-icon bloom-icon--sm')}
              <span>${action.label}</span>
            </button>
          `).join('')}
        </div>

        <div class="care-mode-options">
          ${!restActive ? `
            <label class="care-mode-option card-bloom-check" for="care-rest-discrete">
              <input type="checkbox" id="care-rest-discrete" class="bloom-checkbox-input" checked />
              <span class="bloom-checkbox" aria-hidden="true">
                <i class="bi bi-check-lg bloom-checkbox-icon"></i>
              </span>
              <span class="card-bloom-check-label">Usar modo discreto ao ativar o descanso</span>
            </label>
          ` : ''}
          <label class="care-mode-option card-bloom-check" for="care-discrete-toggle">
            <input type="checkbox" id="care-discrete-toggle" class="bloom-checkbox-input"${discreteActive ? ' checked' : ''} />
            <span class="bloom-checkbox" aria-hidden="true">
              <i class="bi bi-check-lg bloom-checkbox-icon"></i>
            </span>
            <span class="card-bloom-check-label">${renderIcon('discrete', 'bloom-icon bloom-icon--sm')} Esconder termos sensíveis no app</span>
          </label>
        </div>

        <div id="care-breathe-panel" class="care-breathe-panel" hidden>
          <p class="care-breathe-phase" id="care-breathe-text">Inspire…</p>
          <div class="care-breathe-circle" id="care-breathe-circle"></div>
          <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm" id="care-breathe-stop">Parar</button>
        </div>

        <button type="button" class="btn-bloom btn-bloom-ghost care-mode-exit" id="care-exit">Voltar</button>
      </div>
    </div>
  `;
}
