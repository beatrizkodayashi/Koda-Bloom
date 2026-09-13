/**
 * Configuração central da aplicação.
 * Altere APP_NAME aqui quando definir o nome final do produto.
 */

export const APP_NAME = 'Bloom';

export const APP_TAGLINE = 'Seu ciclo, com cuidado';

export const HEALTH_DISCLAIMER =
  'O aplicativo fornece estimativas baseadas nos dados registrados e não substitui orientação, diagnóstico ou acompanhamento médico.';

export const FERTILITY_DISCLAIMER =
  'Ovulação e janela fértil são estimativas baseadas nos seus registros. Não use como método contraceptivo nem para planejar gravidez com precisão.';

export const PERIOD_DELAY_DISCLAIMER =
  'Atrasos podem ser normais. Isso é uma estimativa, não um diagnóstico. Se estiver preocupada ou o atraso continuar, converse com um profissional de saúde.';

export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
  ONBOARDING: '/onboarding',
  APP: '/app',
  HOJE: '/app/hoje',
  CALENDARIO: '/app/calendario',
  REGISTRAR: '/app/registrar',
  INSIGHTS: '/app/insights',
  MEU_PADRAO: '/app/meu-padrao',
  NECESSAIRE: '/app/bolsinha',
  PLANEJADOR: '/app/planejador',
  RELATORIO: '/app/relatorio',
  ISSO_E_NORMAL: '/app/isso-e-normal',
  RELACOES: '/app/relacoes',
  ANTICONCEPCIONAL: '/app/anticoncepcional',
  SAUDE_INTIMA: '/app/saude-intima',
  PERFIL: '/app/perfil',
  CUIDADO: '/app/cuidado',
};

export const NAV_ITEMS = [
  { path: '/app/calendario', label: 'Calendário', icon: 'bi-calendar3' },
  { path: '/app/hoje', label: 'Hoje', icon: 'bi-sun' },
  { path: '/app/registrar', label: 'Registrar', icon: 'bi-plus-circle-fill', highlight: true },
  {
    path: '/app/relacoes',
    label: 'Relação',
    icon: 'bi-heart',
  },
  { path: '/app/insights', label: 'Insights', icon: 'bi-graph-up' },
  { path: '/app/perfil', label: 'Perfil', icon: 'bi-person' },
];

/** Valores padrão antes do onboarding */
export const DEFAULTS = {
  AVERAGE_CYCLE_LENGTH: 28,
  AVERAGE_PERIOD_LENGTH: 5,
  MIN_CYCLES_FOR_PREDICTION: 2,
};
