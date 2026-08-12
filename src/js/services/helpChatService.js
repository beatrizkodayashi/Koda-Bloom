import { ROUTES } from '../config/app.js';

/**
 * Base de conhecimento do chat de ajuda — respostas locais, sem IA externa.
 */

export const FAQ_ITEMS = [
  {
    id: 'login',
    label: 'Como faço login?',
    keywords: ['login', 'entrar', 'logar', 'acessar', 'senha errada', 'nao consigo entrar'],
    answer: `Para entrar no Bloom:
1. Clique em **Entrar** na landing ou acesse a tela de login.
2. Informe o e-mail e a senha cadastrados.
3. Se esqueceu a senha, use **Esqueci minha senha** para receber um link por e-mail.

Confirme também se o Supabase está configurado no \`.env\` (URL e chave anon) e se você reiniciou o servidor após alterar o arquivo.`,
    action: { label: 'Ir para login', route: ROUTES.LOGIN },
  },
  {
    id: 'signup',
    label: 'Como criar conta?',
    keywords: ['cadastro', 'cadastrar', 'criar conta', 'registrar', 'sign up', 'nova conta'],
    answer: `Para criar sua conta:
1. Na landing, clique em **Começar** ou **Criar conta**.
2. Preencha e-mail e senha (mínimo 8 caracteres).
3. Se o projeto exigir confirmação de e-mail, verifique sua caixa de entrada (e spam).
4. Depois do primeiro acesso, complete o **onboarding** para configurar seu ciclo.

Se aparecer "Database error saving new user", execute o arquivo \`003_fix_signup_trigger.sql\` no Supabase.`,
    action: { label: 'Criar conta', route: ROUTES.SIGNUP },
  },
  {
    id: 'subscription',
    label: 'O app tem assinatura?',
    keywords: ['assinatura', 'pagar', 'plano', 'premium', 'gratis', 'grátis', 'preco', 'preço', 'cobrança'],
    answer: `No momento o Bloom é **gratuito** — não há planos pagos nem assinatura.

Você pode usar todas as funcionalidades do MVP sem custo: cadastro, calendário, check-in, insights e streak de registros.

Quando assinaturas existirem no futuro, avisaremos com transparência dentro do app.`,
  },
  {
    id: 'platform-error',
    label: 'Erro na plataforma',
    keywords: ['erro', 'bug', 'nao funciona', 'não funciona', 'falha', '500', 'database error', 'rls', 'supabase'],
    answer: `Alguns erros comuns e o que fazer:

**"Supabase não configurado"** — copie \`.env.example\` para \`.env\`, preencha URL e anon key, reinicie \`npm run dev\`.

**"Database error saving new user"** — execute \`003_fix_signup_trigger.sql\` no SQL Editor do Supabase.

**Erro ao salvar registro (RLS)** — confirme que rodou \`002_rls_policies.sql\`.

**Página em branco após login** — complete o onboarding ou verifique o console do navegador (F12).

Se persistir, anote a mensagem exata e a tela onde ocorreu.`,
  },
  {
    id: 'streak',
    label: 'Como funciona o streak?',
    keywords: ['streak', 'sequencia', 'sequência', 'coracao', 'coração', 'dias seguidos'],
    answer: `O **streak** conta quantos dias seguidos você fez check-in no calendário.

- Cada dia com registro ganha um **coração** no calendário.
- O contador aparece no topo da tela Calendário.
- Se hoje ainda não registrou, a sequência de ontem continua válida até o fim do dia.

Registre em **Registrar** — leva poucos segundos!`,
    action: { label: 'Fazer check-in', route: ROUTES.REGISTRAR },
  },
  {
    id: 'calendar',
    label: 'Como usar o calendário?',
    keywords: ['calendario', 'calendário', 'previsao', 'previsão', 'periodo', 'menstruação'],
    answer: `No **Calendário** você vê:
- Dias com registro (coração)
- Menstruação registrada e previsão estimada
- Janela fértil e ovulação estimada (são estimativas, não diagnóstico)

Toque em um dia para ver detalhes ou registrar naquela data. Quanto mais você registra, melhor ficam as estimativas.`,
    action: { label: 'Abrir calendário', route: ROUTES.CALENDARIO },
  },
  {
    id: 'privacy',
    label: 'Meus dados são privados?',
    keywords: ['privacidade', 'seguranca', 'segurança', 'dados', 'rls', 'quem ve'],
    answer: `Sim. Seus dados de ciclo são pessoais e sensíveis.

- Cada conta só acessa **os próprios registros** (Row Level Security no Supabase).
- No navegador usamos apenas a chave pública (anon), nunca a chave administrativa.
- Não vendemos dados. O Bloom não substitui acompanhamento médico — use estimativas como referência pessoal.`,
  },
  {
    id: 'reset-password',
    label: 'Esqueci minha senha',
    keywords: ['esqueci', 'recuperar', 'redefinir', 'reset', 'nova senha'],
    answer: `Na tela de login, clique em **Esqueci minha senha**, informe seu e-mail e enviaremos um link de redefinição.

Verifique spam. Em produção, a URL do app precisa estar nas **Redirect URLs** do Supabase (Authentication → URL Configuration).`,
    action: { label: 'Recuperar senha', route: ROUTES.RESET_PASSWORD },
  },
];

const WELCOME_MESSAGE =
  'Oi! Sou seu patinho de ajuda. Escolha uma sugestão abaixo ou descreva sua dúvida — login, assinatura, erros e mais.';

const FALLBACK_MESSAGE =
  'Não encontrei uma resposta exata, mas posso ajudar com login, cadastro, assinatura, erros ou uso do calendário. Tente uma das sugestões abaixo.';

export function getWelcomeMessage() {
  return WELCOME_MESSAGE;
}

export function getSuggestedQuestions() {
  return FAQ_ITEMS.map(({ id, label }) => ({ id, label }));
}

export function getAnswerById(id) {
  return FAQ_ITEMS.find((item) => item.id === id) ?? null;
}

export function findAnswerByText(text) {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (!normalized) return null;

  let best = null;
  let bestScore = 0;

  FAQ_ITEMS.forEach((item) => {
    let score = 0;
    if (normalized.includes(item.id.replace('-', ' '))) score += 3;
    item.keywords.forEach((kw) => {
      const key = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalized.includes(key)) score += 2;
    });
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  });

  return bestScore > 0 ? best : null;
}

export function getFallbackMessage() {
  return FALLBACK_MESSAGE;
}
