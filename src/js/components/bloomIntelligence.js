import { renderCard } from './card.js';
import { APP_NAME } from '../config/app.js';

export function renderPredictionConfidenceCard(prediction) {
  if (!prediction) return '';

  return renderCard('Próxima menstruação', `
    <div class="bloom-prediction">
      <p class="bloom-prediction-headline">🩷 ${prediction.headline}</p>
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
    return renderCard('O pato percebeu', `
      <p class="text-muted mb-0">Continue registrando por alguns ciclos — eu começo a notar padrões só seus.</p>
    `, { className: 'card-bloom-soft' });
  }

  return renderCard('O pato percebeu', `
    <div class="duck-observations">
      ${observations.map((obs) => `
        <article class="duck-observation duck-observation--${obs.category}">
          <p class="duck-observation-icon" aria-hidden="true">${obs.icon}</p>
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
      <p class="bloom-anomaly-icon" aria-hidden="true">${anomaly.icon}</p>
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
      <span aria-hidden="true">🦆</span>
      <p class="mb-0">${comparison.duckReaction}</p>
    </div>
  `);
}

export function renderCycleRetrospectiveCard(retro) {
  if (!retro) return '';

  return renderCard(`✨ Seu ciclo #${retro.cycleNumber}`, `
    <p class="text-muted mb-3"><small>${retro.startLabel} → ${retro.endLabel}</small></p>
    <ul class="cycle-retro-list mb-0">
      <li>🩸 ${retro.periodLen} dias de menstruação</li>
      <li>🌙 ${retro.duration} dias de ciclo</li>
      <li>💗 Humor predominante: ${retro.mood}</li>
      <li>⚡ Energia média: ${retro.avgEnergy}/10</li>
      <li>🤕 Sintoma mais registrado: ${retro.topSymptom}</li>
    </ul>
    <div class="cycle-retro-duck mt-4">
      <span aria-hidden="true">🦆</span>
      <p class="mb-0"><strong>"${retro.duckVerdict}"</strong></p>
    </div>
  `, { className: 'card-bloom-soft' });
}

export function renderCycleSimulator({ lastPeriodStart, avgCycle, avgPeriod, simulation }) {
  if (!lastPeriodStart) return '';

  return renderCard('E se meu ciclo mudar?', `
    <p class="text-muted mb-0"><small>Teste cenários — o calendário mental se reorganiza aqui.</small></p>
    <div class="cycle-simulator-controls mt-4">
      <div class="form-bloom">
        <label for="sim-offset">E se a menstruação viesse…</label>
        <select id="sim-offset" class="bloom-select">
          <option value="-3">3 dias antes</option>
          <option value="-1">1 dia antes</option>
          <option value="0" selected>No previsto</option>
          <option value="2">2 dias depois</option>
          <option value="5">5 dias depois</option>
        </select>
      </div>
      <div class="form-bloom mt-3">
        <label for="sim-cycle">E se meu ciclo durasse…</label>
        <select id="sim-cycle" class="bloom-select">
          <option value="">Média atual (${avgCycle} dias)</option>
          <option value="25">25 dias</option>
          <option value="28">28 dias</option>
          <option value="32">32 dias</option>
          <option value="35">35 dias</option>
        </select>
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
    <p class="text-muted mb-0"><small>Com base nos seus registros recentes.</small></p>
    <div class="symptom-body-map mt-4">
      ${bodyMap.map((zone) => `
        <div class="symptom-body-zone${zone.active ? ' symptom-body-zone--active' : ''}" style="--zone-intensity: ${Math.min(zone.intensity, 5)}">
          <span class="symptom-body-zone-icon" aria-hidden="true">${zone.icon}</span>
          <span class="symptom-body-zone-label">${zone.label}</span>
          ${zone.active ? `<span class="symptom-body-zone-count">${zone.intensity}×</span>` : ''}
        </div>
      `).join('')}
    </div>
  `, { className: 'card-bloom-soft' });
}

export function renderPersonalizedTips(tips) {
  if (!tips.length) return '';

  return renderCard('O pato aprende com você', `
    <div class="bloom-tips">
      ${tips.map((tip) => `
        <div class="bloom-tip${tip.action ? ' bloom-tip--action' : ''}" data-tip-action="${tip.action || ''}">
          <span class="bloom-tip-icon" aria-hidden="true">${tip.icon}</span>
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
      <p class="smart-followup-duck" aria-hidden="true">🦆</p>
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
      <span aria-hidden="true">🥺</span> Hoje não tô bem
    </button>
  `;
}

export function renderCareModePage() {
  return `
    <div class="care-mode-page gradient-bg floral-pattern">
      <section class="care-mode-hero">
        <img src="/pato_padrao.png" alt="${APP_NAME}" class="bloom-mascot-img care-mode-mascot" width="180" height="180" decoding="async" />
        <h1>Hoje não tô bem</h1>
        <p>Tudo bem não estar bem. Vamos com calma — só o que você precisar agora.</p>
      </section>

      <div class="card-stack care-mode-actions">
        <button type="button" class="care-mode-action" id="care-quick-log">
          <span aria-hidden="true">📝</span>
          <span>Registrar sintomas rapidamente</span>
        </button>
        <button type="button" class="care-mode-action" id="care-breathe">
          <span aria-hidden="true">🌬️</span>
          <span>Respiração guiada</span>
        </button>
        <button type="button" class="care-mode-action" id="care-water">
          <span aria-hidden="true">💧</span>
          <span>Lembrete de hidratação</span>
        </button>
        <button type="button" class="care-mode-action" id="care-rest">
          <span aria-hidden="true">🛌</span>
          <span>Modo descanso</span>
        </button>
        <button type="button" class="care-mode-action" id="care-journal">
          <span aria-hidden="true">📖</span>
          <span>Diário emocional</span>
        </button>
      </div>

      <div id="care-breathe-panel" class="care-breathe-panel" hidden>
        <p class="care-breathe-phase" id="care-breathe-text">Inspire…</p>
        <div class="care-breathe-circle" id="care-breathe-circle"></div>
        <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm" id="care-breathe-stop">Parar</button>
      </div>

      <button type="button" class="btn-bloom btn-bloom-ghost w-100 mt-5" id="care-exit">Voltar</button>
    </div>
  `;
}
