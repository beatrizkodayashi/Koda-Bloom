import { APP_NAME, HEALTH_DISCLAIMER, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState, resetState } from '../state/store.js';
import { signOut } from '../services/authService.js';
import { upsertProfile, getCycleStarts } from '../services/cycleService.js';
import { savePreferences, getPreferences, getDefaultPreferences, getDailyLogs } from '../services/dailyLogService.js';
import { buildProfileSummary } from '../services/profileSummaryService.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderStreakCard } from '../components/streakCard.js';
import { renderCard } from '../components/card.js';
import { showToast } from '../components/toast.js';
import { isAuthConfigured } from '../services/authService.js';
import { isDiscreteMode, setDiscreteMode, discreteNotificationPreview } from '../utils/discreteMode.js';
import { formatStreakLabel } from '../utils/streak.js';

const PREF_ITEMS = [
  ['track_mood', 'Humor'],
  ['track_symptoms', 'Sintomas'],
  ['track_pain', 'Dor'],
  ['track_sleep', 'Sono'],
  ['track_energy', 'Energia'],
  ['track_flow', 'Fluxo menstrual'],
  ['track_discharge', 'Corrimento'],
  ['track_activity', 'Atividade física'],
  ['track_water', 'Água'],
  ['track_notes', 'Notas'],
];

function formatMemberSince(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function renderProfileStats(summary) {
  return `
    <div class="feature-grid profile-stats-grid">
      ${renderCard('Check-ins', `
        <p class="stat-value">${summary.totalCheckins}</p>
        <p class="profile-stat-hint mb-0"><small>registros no total</small></p>
      `, { className: 'card-bloom--compact' })}
      ${renderCard('Ciclos', `
        <p class="stat-value">${summary.cycleCount}</p>
        <p class="profile-stat-hint mb-0"><small>menstruações registradas</small></p>
      `, { className: 'card-bloom--compact' })}
      ${renderCard('Sequência', `
        <p class="stat-value">${summary.streak}</p>
        <p class="profile-stat-hint mb-0"><small>${formatStreakLabel(summary.streak).toLowerCase()}</small></p>
      `, { className: 'card-bloom--compact' })}
      ${renderCard('Check-in', `
        <p class="stat-value">${summary.activeCategories}</p>
        <p class="profile-stat-hint mb-0"><small>categorias ativas</small></p>
      `, { className: 'card-bloom--compact' })}
    </div>
  `;
}

function renderKnowScoreCard(summary) {
  const milestonePercent = summary.nextMilestone
    ? Math.round((summary.nextMilestone.progress / summary.nextMilestone.target) * 100)
    : 100;

  return renderCard('Mapa do Bloom', `
    <div class="profile-know-score">
      <div class="profile-know-score-ring" style="--know-score: ${summary.knowScore}" aria-hidden="true">
        <span class="profile-know-score-value">${summary.knowScore}%</span>
      </div>
      <div class="profile-know-score-copy">
        <p class="mb-2">Quanto mais você registra, melhor eu entendo seu ritmo — sempre no seu tempo.</p>
        <div class="profile-confidence">
          <span class="profile-confidence-label">Confiança das estimativas</span>
          <span class="profile-confidence-badge profile-confidence-badge--${summary.confidence}">${summary.confidenceLabel}</span>
        </div>
        ${summary.nextMilestone ? `
          <div class="profile-milestone mt-4">
            <div class="profile-milestone-head">
              <span class="profile-milestone-label">Próximo marco: ${summary.nextMilestone.label}</span>
              <span class="profile-milestone-percent">${milestonePercent}%</span>
            </div>
            <div class="profile-milestone-bar" role="progressbar" aria-valuenow="${milestonePercent}" aria-valuemin="0" aria-valuemax="100">
              <span class="profile-milestone-fill" style="width: ${milestonePercent}%"></span>
            </div>
            <p class="profile-milestone-hint mb-0"><small>${summary.nextMilestone.hint}</small></p>
          </div>
        ` : '<p class="text-muted mb-0 mt-3"><small>Você já desbloqueou todos os marcos principais. Incrível!</small></p>'}
      </div>
    </div>
  `, { className: 'card-bloom-soft' });
}

function renderBadgesCard(summary) {
  return renderCard('Suas conquistas', `
    <p class="text-muted mb-0"><small>${summary.unlockedBadges.length} de ${summary.badges.length} desbloqueadas — cada uma conta sua jornada com o Bloom.</small></p>
    <div class="profile-badges" role="list">
      ${summary.badges.map((badge) => `
        <div class="profile-badge${badge.unlocked ? ' profile-badge--unlocked' : ''}" role="listitem" title="${badge.hint}">
          <span class="profile-badge-icon" aria-hidden="true">${badge.icon}</span>
          <span class="profile-badge-label">${badge.label}</span>
        </div>
      `).join('')}
    </div>
  `);
}

function renderSignatureCard(summary) {
  if (summary.signatureMood) {
    return renderCard('Sua assinatura emocional', `
      <div class="profile-signature">
        <span class="profile-signature-emoji" aria-hidden="true">${summary.signatureMood.emoji}</span>
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

export async function renderProfile(container) {
  const { user, profile } = getState();

  let prefs = getDefaultPreferences();
  let periodStarts = [];
  let dailyLogs = [];

  if (isAuthConfigured() && user) {
    try {
      [prefs, periodStarts, dailyLogs] = await Promise.all([
        getPreferences(user.id).then((p) => p || getDefaultPreferences()),
        getCycleStarts(user.id),
        getDailyLogs(user.id),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  const summary = buildProfileSummary(profile, user, periodStarts, dailyLogs, prefs);
  const memberSince = formatMemberSince(summary.memberSince);
  const headerName = summary.name === 'você' ? 'Perfil' : summary.name;

  const content = `
    <section class="page-mascot-section page-mascot-section--profile">
      <div class="page-header">
        <h1>Olá, ${headerName}!</h1>
        <p>${memberSince ? `Comigo desde ${memberSince}.` : 'Seu espaço, no seu ritmo.'}</p>
      </div>

      <div class="duck-companion">
        <img src="/pato_cheirando_rosa.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--profile" width="240" height="240" decoding="async" />
        <p class="mascot-caption">${summary.bloomMessage}</p>
      </div>
    </section>

    <div class="card-stack">
      ${summary.cycleDay ? renderCard('Seu momento', `
        <span class="badge-bloom badge-phase-${summary.phase === 'menstruation' ? 'menstruation' : summary.phase === 'follicular' ? 'follicular' : summary.phase === 'ovulation' ? 'ovulation' : 'luteal'}">${summary.phaseLabel}</span>
        <p class="mb-0 mt-3">Hoje é o dia <strong>${summary.cycleDay}</strong> do seu ciclo estimado.</p>
      `, { className: 'card-bloom-soft' }) : ''}

      ${renderStreakCard({ streak: summary.streak, buttonId: 'btn-profile-streak', buttonLabel: 'Registrar hoje' })}

      ${renderProfileStats(summary)}
      ${renderKnowScoreCard(summary)}
      ${renderSignatureCard(summary)}
      ${renderBadgesCard(summary)}

      <div class="profile-quick-links">
        <button type="button" class="btn-bloom btn-bloom-secondary flex-fill" id="btn-go-insights">
          <i class="bi bi-graph-up" aria-hidden="true"></i> Ver insights
        </button>
        <button type="button" class="btn-bloom btn-bloom-secondary flex-fill" id="btn-go-calendar">
          <i class="bi bi-calendar3" aria-hidden="true"></i> Calendário
        </button>
      </div>

      ${renderCard('Modo discreto', `
        <p class="text-muted mb-0"><small>Esconde termos sensíveis na tela. Ideal para privacidade no dia a dia.</small></p>
        <label class="card-bloom-check mt-4" for="discrete-mode">
          <input type="checkbox" id="discrete-mode" class="bloom-checkbox-input" ${isDiscreteMode() ? 'checked' : ''} />
          <span class="bloom-checkbox" aria-hidden="true">
            <i class="bi bi-check-lg bloom-checkbox-icon"></i>
          </span>
          <span class="card-bloom-check-label">🫥 Ativar modo discreto</span>
        </label>
        <p class="text-muted mt-3 mb-0"><small>Exemplo: ${discreteNotificationPreview(isDiscreteMode())}</small></p>
      `, { className: 'card-bloom-soft' })}

      ${renderCard('Conta', `
        <p class="text-muted mb-1"><small>E-mail</small></p>
        <p class="mb-0">${user?.email || '-'}</p>
        ${memberSince ? `<p class="text-muted mt-3 mb-0"><small>Membro desde ${memberSince}</small></p>` : ''}
        <div class="form-bloom mt-4">
          <label for="display_name">Como você quer ser chamada?</label>
          <input type="text" id="display_name" value="${profile?.display_name || ''}" maxlength="50" placeholder="Seu nome ou apelido" />
        </div>
        <button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-sm mt-4" id="btn-save-profile">Salvar perfil</button>
      `)}

      ${renderCard('Categorias do check-in', `
        <p class="text-muted mb-0"><small>Escolha o que aparece no registro diário — personalize do seu jeito.</small></p>
        <div class="chip-grid" id="pref-chips">
          ${PREF_ITEMS.map(([key, label]) =>
            `<button type="button" class="chip${prefs[key] ? ' selected' : ''}" data-key="${key}">${label}</button>`
          ).join('')}
        </div>
        <button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-sm mt-4" id="btn-save-prefs">Salvar preferências</button>
      `)}

      ${renderCard('Seu ciclo', `
        <p class="text-muted mb-0"><small>Esses números ajudam nas estimativas do calendário e dos insights.</small></p>
        <div class="form-bloom mt-4">
          <label for="avg_cycle">Duração média do ciclo (dias)</label>
          <input type="number" id="avg_cycle" value="${profile?.average_cycle_length || 28}" min="21" max="45" />
        </div>
        <div class="form-bloom mt-4">
          <label for="avg_period">Duração média da menstruação (dias)</label>
          <input type="number" id="avg_period" value="${profile?.average_period_length || 5}" min="1" max="10" />
        </div>
        <div class="profile-cycle-regular mt-4">
          <p class="mb-2"><small>Seu ciclo costuma ser regular?</small></p>
          <div class="chip-grid" id="cycle-regular-chips">
            <button type="button" class="chip${profile?.cycle_regular !== false ? ' selected' : ''}" data-regular="true">Sim, bem regular</button>
            <button type="button" class="chip${profile?.cycle_regular === false ? ' selected' : ''}" data-regular="false">Varia bastante</button>
          </div>
        </div>
      `)}
    </div>

    <p class="health-disclaimer mt-5">${HEALTH_DISCLAIMER}</p>

    <button type="button" class="btn-bloom btn-bloom-ghost w-100 mt-4" id="btn-logout">
      <i class="bi bi-box-arrow-right" aria-hidden="true"></i> Sair
    </button>

    <p class="text-center text-muted mt-4"><small>${APP_NAME} v0.1.0</small></p>
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);

  const localPrefs = { ...prefs };
  let cycleRegular = profile?.cycle_regular !== false;

  container.querySelectorAll('#pref-chips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.key;
      localPrefs[key] = !localPrefs[key];
      chip.classList.toggle('selected');
    });
  });

  container.querySelectorAll('#cycle-regular-chips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      cycleRegular = chip.dataset.regular === 'true';
      container.querySelectorAll('#cycle-regular-chips .chip').forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  container.querySelector('#btn-profile-streak')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
  container.querySelector('#btn-go-insights')?.addEventListener('click', () => navigate(ROUTES.INSIGHTS));
  container.querySelector('#btn-go-calendar')?.addEventListener('click', () => navigate(ROUTES.CALENDARIO));

  container.querySelector('#discrete-mode')?.addEventListener('change', (e) => {
    setDiscreteMode(e.target.checked);
    showToast(e.target.checked ? 'Modo discreto ativado' : 'Modo discreto desativado', 'success');
  });

  container.querySelector('#btn-save-profile')?.addEventListener('click', async () => {
    if (!user) return;
    try {
      await upsertProfile(user.id, {
        display_name: container.querySelector('#display_name').value,
        average_cycle_length: Number(container.querySelector('#avg_cycle').value),
        average_period_length: Number(container.querySelector('#avg_period').value),
        cycle_regular: cycleRegular,
      });
      showToast('Perfil salvo!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  container.querySelector('#btn-save-prefs')?.addEventListener('click', async () => {
    if (!user) return;
    try {
      await savePreferences(user.id, localPrefs);
      showToast('Preferências salvas!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  container.querySelector('#btn-logout')?.addEventListener('click', async () => {
    try {
      await signOut();
      resetState();
      navigate(ROUTES.LANDING);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
