import { renderCard } from './card.js';
import { renderIcon } from './icons.js';
import { APP_NAME, HEALTH_DISCLAIMER, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import {
  NECESSAIRE_ITEMS,
  getNecessaireSummary,
} from '../services/bloomPhase2Service.js';

export function renderMobileBackButton() {
  return `
    <button type="button" class="mobile-back-btn" id="mobile-back-btn" aria-label="Voltar para página anterior">
      <i class="bi bi-arrow-left" aria-hidden="true"></i>
      <span>Voltar</span>
    </button>
  `;
}

export function mountMobileBackButton(container, fallbackRoute = ROUTES.INSIGHTS) {
  container.querySelector('#mobile-back-btn')?.addEventListener('click', () => {
    if (window.history.length > 1) {
      history.back();
      return;
    }
    navigate(fallbackRoute);
  });
}

export function renderNecessairePage(data) {
  const summary = getNecessaireSummary(data);

  return `
    ${renderMobileBackButton()}
    <section class="page-mascot-section page-mascot-section--tools">
      <div class="page-header">
        <h1>Minha bolsinha</h1>
        <p>Sua nécessaire menstrual virtual, pronta para viagens e dias imprevisíveis.</p>
      </div>
      <div class="duck-companion">
        <img src="/pato_bolsinha.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--tools" width="180" height="180" decoding="async" />
        <p class="mascot-caption">${summary.complete ? 'Tudo conferido! Você está preparada.' : 'Marque o que já está na bolsinha.'}</p>
      </div>
    </section>

    <div class="card-stack phase2-page">
      ${renderCard('Progresso', `
        <div class="necessaire-progress">
          <div class="necessaire-progress-head">
            <span>${summary.checked} de ${summary.total} itens</span>
            <span class="necessaire-progress-percent">${summary.total ? Math.round((summary.checked / summary.total) * 100) : 0}%</span>
          </div>
          <div class="phase2-progress-bar" role="progressbar" aria-valuenow="${summary.checked}" aria-valuemin="0" aria-valuemax="${summary.total}">
            <span class="phase2-progress-fill" style="width: ${summary.total ? (summary.checked / summary.total) * 100 : 0}%"></span>
          </div>
        </div>
      `, { className: 'card-bloom-soft' })}

      ${renderCard('Itens essenciais', `
        <div class="necessaire-list">
          ${NECESSAIRE_ITEMS.map(
            (item) => `
            <label class="necessaire-item" for="nec-${item.id}">
              <input type="checkbox" id="nec-${item.id}" class="bloom-checkbox-input necessaire-check" data-item-id="${item.id}" ${data.checked[item.id] ? 'checked' : ''} />
              <span class="bloom-checkbox" aria-hidden="true"><i class="bi bi-check-lg bloom-checkbox-icon"></i></span>
              <span class="necessaire-item-label">${item.label}</span>
            </label>
          `
          ).join('')}
          ${data.custom
            .map(
              (item) => `
            <label class="necessaire-item necessaire-item--custom" for="nec-${item.id}">
              <input type="checkbox" id="nec-${item.id}" class="bloom-checkbox-input necessaire-check" data-custom-id="${item.id}" ${item.checked ? 'checked' : ''} />
              <span class="bloom-checkbox" aria-hidden="true"><i class="bi bi-check-lg bloom-checkbox-icon"></i></span>
              <span class="necessaire-item-label">${item.label}</span>
              <button type="button" class="necessaire-remove" data-remove-custom="${item.id}" aria-label="Remover item">&times;</button>
            </label>
          `
            )
            .join('')}
        </div>
      `, { className: 'card-bloom-soft' })}

      ${renderCard('Adicionar item', `
        <div class="phase2-inline-form">
          <input type="text" id="nec-custom-input" class="form-control bloom-input" maxlength="40" placeholder="Ex.: Chocolate, chá de camomila..." />
          <button type="button" class="btn-bloom btn-bloom-secondary" id="nec-add-custom">Adicionar</button>
        </div>
      `, { className: 'card-bloom-soft' })}

      <div class="phase2-actions">
        <button type="button" class="btn-bloom btn-bloom-secondary w-100" id="nec-reset">Recomeçar conferência</button>
      </div>
    </div>
  `;
}

export function renderPlannerPage(events, analyses) {
  const analysisMap = Object.fromEntries(analyses.map((a) => [a.event.id, a]));

  return `
    ${renderMobileBackButton()}
    <section class="page-mascot-section page-mascot-section--tools page-mascot-section--compact">
      <div class="page-header">
        <h1>Planejador</h1>
        <p>Cruze seus planos com o ritmo do seu ciclo.</p>
      </div>
      <div class="duck-companion">
        <img src="/pato_viajando.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--tools" width="160" height="160" decoding="async" />
        <p class="mascot-caption">Viagem, festa ou prova, eu te aviso se a menstruação pode aparecer.</p>
      </div>
    </section>

    <div class="card-stack phase2-page planner-page">
      ${renderCard('Novo evento', `
        <form id="planner-form" class="planner-form">
          <div class="form-bloom planner-field">
            <label for="evt-title">Nome do evento</label>
            <input type="text" id="evt-title" maxlength="60" placeholder="Ex.: Viagem para a praia" required />
          </div>
          <div class="planner-date-grid">
            <div class="form-bloom planner-field">
              <label for="evt-start">Início</label>
              <input type="date" id="evt-start" required />
            </div>
            <div class="form-bloom planner-field">
              <label for="evt-end">Fim</label>
              <input type="date" id="evt-end" required />
            </div>
          </div>
          <button type="submit" class="btn-bloom btn-bloom-primary w-100 planner-submit">Adicionar evento</button>
        </form>
        ${
          !events.length
            ? `<p class="planner-empty-hint mb-0">Nenhum evento ainda, adicione uma viagem ou compromisso acima.</p>`
            : ''
        }
      `, { className: 'card-bloom-soft planner-form-card' })}

      ${
        events.length
          ? events
              .map((event) => renderEventAnalysisCard(event, analysisMap[event.id]))
              .join('')
          : ''
      }
    </div>
  `;
}

function renderEventAnalysisCard(event, analysis) {
  if (!analysis) return '';

  const dateRange = `${formatShort(event.startDate)} – ${formatShort(event.endDate)}`;
  const riskClass = analysis.overlaps ? 'phase2-badge--warn' : 'phase2-badge--ok';

  return renderCard(
    event.title,
    `
    <div class="planner-event">
      <div class="planner-event-meta">
        <span class="phase2-badge ${riskClass}">${analysis.riskLabel}</span>
        <span class="text-muted"><small>${dateRange}</small></span>
      </div>
      <div class="planner-duck">
        ${renderIcon('duck', 'bloom-icon bloom-icon--sm')}
        <p class="mb-0">${analysis.duckMessage}</p>
      </div>
      ${
        analysis.windows?.length
          ? `<p class="planner-windows mb-2"><small>Menstruação estimada: ${analysis.windows
              .map((w) => `${formatShort(w.start)} – ${formatShort(w.end)}`)
              .join(' · ')}</small></p>`
          : ''
      }
      ${
        analysis.suggestions?.length
          ? `<ul class="planner-suggestions mb-3">
              ${analysis.suggestions.map((s) => `<li>${s}</li>`).join('')}
            </ul>`
          : ''
      }
      <div class="planner-event-actions">
        ${analysis.overlaps ? '<button type="button" class="btn btn-sm btn-outline-bloom" data-go-necessaire>Conferir bolsinha</button>' : ''}
        <button type="button" class="btn btn-sm btn-outline-bloom phase2-btn-muted" data-delete-event="${event.id}">Remover</button>
      </div>
    </div>
  `,
    { className: `card-bloom-soft planner-card${analysis.overlaps ? ' planner-card--warn' : ''}` }
  );
}

export function renderDoctorReportPage(report) {
  if (!report.enoughData) {
    return `
      ${renderMobileBackButton()}
      <section class="page-mascot-section page-mascot-section--tools">
        <div class="page-header">
          <h1>Relatório</h1>
          <p>Resumo para levar ao ginecologista</p>
        </div>
      </section>
      <div class="card-stack phase2-page">
        ${renderCard('', `
          <div class="phase2-empty text-center py-4">
            <img src="/pato_caderno.png" alt="" width="72" height="72" class="mb-3" />
            <p class="mb-0 text-muted">Registre pelo menos um ciclo para gerar o relatório.</p>
          </div>
        `, { plain: true, className: 'card-bloom-soft' })}
      </div>
    `;
  }

  return `
    ${renderMobileBackButton()}
    <section class="page-mascot-section page-mascot-section--tools page-mascot-section--no-print">
      <div class="page-header">
        <h1>Relatório</h1>
        <p>Resumo organizado dos seus registros</p>
      </div>
      <div class="duck-companion">
        <img src="/pato_laptop.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--tools" width="160" height="160" decoding="async" />
      </div>
    </section>

    <div class="card-stack phase2-page">
      <div class="phase2-actions phase2-actions--no-print">
        <button type="button" class="btn-bloom btn-bloom-primary w-100" id="btn-print-report">
          ${renderIcon('book', 'bloom-icon bloom-icon--sm')} Imprimir / salvar PDF
        </button>
      </div>

      <article id="doctor-report" class="doctor-report">
        <header class="doctor-report-header">
          <h2 class="doctor-report-title">Relatório de ciclo menstrual</h2>
          <p class="doctor-report-meta"><strong>${report.patientName}</strong> · Gerado em ${report.generatedAt}</p>
        </header>

        <section class="doctor-report-section">
          <h3>Resumo geral</h3>
          <ul class="doctor-report-list">
            ${report.avgCycle ? `<li>Ciclo médio: ${report.avgCycle} dias</li>` : ''}
            <li>Menstruação média: ${report.avgPeriod} dias</li>
            ${report.variation != null ? `<li>Variação entre ciclos: ${report.variation} dias</li>` : ''}
            <li>Ciclos registrados: ${report.cycleCount}</li>
            <li>Total de check-ins: ${report.totalCheckins}</li>
          </ul>
        </section>

        <section class="doctor-report-section">
          <h3>Histórico de ciclos</h3>
          ${report.cycles
            .map(
              (cycle) => `
            <div class="doctor-report-cycle">
              <p class="doctor-report-cycle-title">${cycle.startLabel}${cycle.inProgress ? ' (em andamento)' : ''}</p>
              <ul class="doctor-report-list">
                <li>Duração: ${cycle.duration} dias${cycle.inProgress ? ' até hoje' : ''}</li>
                <li>Menstruação: ${cycle.periodLen} dias</li>
                ${cycle.avgPain != null ? `<li>Cólica média: ${cycle.avgPain}/10</li>` : ''}
                ${cycle.topMood ? `<li>Humor predominante: ${cycle.topMood}</li>` : ''}
                ${cycle.topSymptoms.length ? `<li>Sintomas: ${cycle.topSymptoms.map((s) => `${s.label} (${s.count}×)`).join(', ')}</li>` : ''}
                <li>Check-ins: ${cycle.checkins}</li>
              </ul>
            </div>
          `
            )
            .join('')}
        </section>

        ${
          report.symptomSummary.length
            ? `
        <section class="doctor-report-section">
          <h3>Sintomas mais registrados</h3>
          <ul class="doctor-report-list">
            ${report.symptomSummary.map((s) => `<li>${s.label}: ${s.count} registro(s)</li>`).join('')}
          </ul>
        </section>
        `
            : ''
        }

        <footer class="doctor-report-footer">
          <p>${report.disclaimer}</p>
        </footer>
      </article>
    </div>
  `;
}

export function renderIsThisNormalInline(analyses) {
  if (!analyses.length) return '';

  return `
    <div class="normalcy-list">
      ${analyses
        .map(
          (a) => `
        <article class="normalcy-item normalcy-item--${a.status}">
          <div class="normalcy-icon">${renderIcon(statusIcon(a.status), 'bloom-icon bloom-icon--md')}</div>
          <div>
            <p class="normalcy-title mb-1">${a.label}</p>
            <p class="normalcy-body mb-0">${a.duckMessage}</p>
          </div>
        </article>
      `
        )
        .join('')}
    </div>
    <p class="text-muted mb-0 mt-2"><small>${analyses[0]?.disclaimer || HEALTH_DISCLAIMER}</small></p>
  `;
}

export function renderIsThisNormalCard(analyses) {
  if (!analyses.length) return '';

  return renderCard('Isso é normal para mim?', renderIsThisNormalInline(analyses), {
    className: 'card-bloom-soft normalcy-card',
  });
}

export function renderIsThisNormalTool(symptoms, selectedSymptom, analysis) {
  return renderCard('Isso é normal para mim?', `
    <p class="mb-3 text-muted"><small>Escolha um sintoma e eu consulto seu histórico pessoal.</small></p>
    <div class="chip-grid normalcy-chips">
      ${symptoms
        .map(
          (s) =>
            `<button type="button" class="chip${selectedSymptom === s.value ? ' selected' : ''}" data-normalcy="${s.value}">${s.label}</button>`
        )
        .join('')}
    </div>
    ${
      analysis
        ? `
      <div class="normalcy-result normalcy-item normalcy-item--${analysis.status} mt-3">
        <div class="normalcy-icon">${renderIcon(statusIcon(analysis.status), 'bloom-icon bloom-icon--md')}</div>
        <div>
          <p class="normalcy-body mb-0">${analysis.duckMessage}</p>
          ${
            analysis.occurrences
              ? `<p class="text-muted mb-0 mt-2"><small>${analysis.occurrences} de ${analysis.totalCycles} ciclo(s) · ${analysis.currentPhaseLabel || ''}</small></p>`
              : ''
          }
        </div>
      </div>
    `
        : ''
    }
  `, { className: 'card-bloom-soft' });
}

export function renderPhase2ToolsCard() {
  return renderCard('Ferramentas do dia a dia', `
    <div class="phase2-tools-grid">
      <button type="button" class="phase2-tool-btn" data-go-planner>
        ${renderIcon('calendar', 'bloom-icon bloom-icon--md')}
        <span>Planejador</span>
      </button>
      <button type="button" class="phase2-tool-btn" data-go-necessaire>
        ${renderIcon('tea', 'bloom-icon bloom-icon--md')}
        <span>Minha bolsinha</span>
      </button>
      <button type="button" class="phase2-tool-btn" data-go-report>
        ${renderIcon('book', 'bloom-icon bloom-icon--md')}
        <span>Relatório</span>
      </button>
    </div>
  `, { className: 'card-bloom-soft' });
}

function statusIcon(status) {
  if (status === 'typical') return 'heart-soft';
  if (status === 'unusual') return 'warning';
  if (status === 'occasional') return 'thought';
  return 'duck';
}

function formatShort(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  });
}

export function mountPhase2Navigation(root, navigate, routes) {
  root.querySelectorAll('[data-go-planner]').forEach((el) => {
    el.addEventListener('click', () => navigate(routes.PLANEJADOR));
  });
  root.querySelectorAll('[data-go-necessaire]').forEach((el) => {
    el.addEventListener('click', () => navigate(routes.NECESSAIRE));
  });
  root.querySelectorAll('[data-go-report]').forEach((el) => {
    el.addEventListener('click', () => navigate(routes.RELATORIO));
  });
}
