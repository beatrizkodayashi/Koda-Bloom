# Arquitetura — Bloom

## Visão geral

Bloom é uma SPA mobile-first construída com HTML, CSS e JavaScript vanilla, empacotada pelo Vite e conectada ao Supabase (PostgreSQL + Auth + RLS) para persistência e segurança.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Pages     │  │  Components  │  │    State      │  │
│  │ (views)     │  │ (UI reuse)   │  │  (store.js)   │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                   │          │
│         └────────────────┼───────────────────┘          │
│                          ▼                              │
│                   ┌─────────────┐                       │
│                   │  Services   │                       │
│                   │ auth, cycle │                       │
│                   │ daily, etc. │                       │
│                   └──────┬──────┘                       │
│                          ▼                              │
│                   ┌─────────────┐                       │
│                   │  Supabase   │                       │
│                   │   Client    │                       │
│                   └──────┬──────┘                       │
└──────────────────────────┼──────────────────────────────┘
                           │ HTTPS (anon key + RLS)
                           ▼
              ┌────────────────────────┐
              │       Supabase         │
              │  Auth │ PostgreSQL │ RLS │
              └────────────────────────┘
```

## Estrutura de pastas

```
Koda-Bloom/
├── index.html                 # Entry HTML
├── vite.config.js
├── package.json
├── .env.example
├── public/
│   ├── favicon.svg
│   └── manifest.json          # (fase PWA)
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_rls_policies.sql
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── SUPABASE.md
│   └── DEPLOY_VERCEL.md
└── src/
    ├── css/
    │   ├── variables.css      # Design tokens
    │   ├── base.css
    │   ├── components.css
    │   ├── layout.css
    │   └── pages/
    ├── js/
    │   ├── app.js             # Bootstrap da aplicação
    │   ├── router.js          # Roteamento client-side
    │   ├── config/
    │   │   ├── app.js         # APP_NAME e constantes
    │   │   └── supabase.js    # Cliente Supabase
    │   ├── state/
    │   │   └── store.js       # Estado global simples
    │   ├── services/
    │   │   ├── authService.js
    │   │   ├── cycleService.js
    │   │   ├── dailyLogService.js
    │   │   ├── insightsService.js
    │   │   ├── gardenService.js
    │   │   └── cycleCalculator.js
    │   ├── utils/
    │   │   ├── dates.js
    │   │   ├── validators.js
    │   │   └── formatters.js
    │   ├── components/
    │   │   ├── bottomNavigation.js
    │   │   ├── sidebar.js
    │   │   ├── duckCompanion.js
    │   │   ├── toast.js
    │   │   └── modal.js
    │   └── pages/
    │       ├── landing.js
    │       ├── auth.js
    │       ├── onboarding.js
    │       ├── dashboard.js
    │       ├── calendar.js
    │       ├── tracking.js
    │       ├── insights.js
    │       └── profile.js
    └── assets/
        └── duck/              # SVGs do mascote
```

## Roteamento

Roteador hash-based (`#/dashboard`) ou history API (`/dashboard`).

**Escolha: History API** com fallback no Vercel (`vercel.json` rewrites → `index.html`).

Rotas:

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Landing page |
| `/login` | Público | Login |
| `/signup` | Público | Cadastro |
| `/reset-password` | Público | Recuperar senha |
| `/onboarding` | Autenticado | Primeiro acesso |
| `/app` | Autenticado | Redirect → `/app/hoje` |
| `/app/hoje` | Autenticado | Dashboard |
| `/app/calendario` | Autenticado | Calendário |
| `/app/registrar` | Autenticado | Check-in |
| `/app/insights` | Autenticado | Insights |
| `/app/perfil` | Autenticado | Perfil |

Guard de rotas: verificar sessão Supabase antes de renderizar rotas `/app/*`.

## Gerenciamento de estado

Store simples com padrão pub/sub (sem biblioteca externa):

```javascript
// state/store.js
const state = { user, profile, cycles, todayLog, preferences };
const listeners = new Set();
export function getState() { ... }
export function setState(partial) { ... }
export function subscribe(fn) { ... }
```

## Camada de serviços

Cada serviço encapsula chamadas ao Supabase e lógica de domínio:

- **authService** — signUp, signIn, signOut, resetPassword, getSession
- **cycleService** — CRUD ciclos e períodos
- **dailyLogService** — check-ins diários
- **cycleCalculator** — funções puras (sem Supabase)
- **insightsService** — agregações locais
- **gardenService** — progresso do jardim

## Banco de dados (resumo)

Todas as tabelas com dados de usuário possuem `user_id UUID REFERENCES auth.users(id)` e RLS ativo.

Entidades principais:

- `profiles` — dados do perfil e onboarding
- `user_preferences` — categorias visíveis, lembretes
- `cycles` — ciclos menstruais
- `period_entries` — registros de menstruação (início/fim/fluxo)
- `daily_logs` — check-in diário (humor, dor, sono, etc.)
- `daily_symptoms` — sintomas do dia (relação N:N)
- `garden_progress` — flores desbloqueadas
- `onboarding_progress` — etapa atual do onboarding

Detalhes completos em `supabase/migrations/`.

## Segurança

1. **RLS** — toda leitura/escrita filtrada por `auth.uid() = user_id`
2. **Frontend** — apenas `VITE_SUPABASE_ANON_KEY` (chave pública)
3. **Nunca** — `service_role` no browser ou no Git
4. **XSS** — `textContent` preferido; sanitizar HTML quando necessário
5. **Validação** — frontend + constraints no PostgreSQL

## Datas e timezone

- Campos de **dia calendário** → tipo `DATE` no PostgreSQL, strings `YYYY-MM-DD` no JS
- Funções centralizadas em `utils/dates.js`
- Evitar `new Date(string)` ambíguo; usar parsing explícito

## Deploy

- **Build:** `npm run build` → pasta `dist/`
- **Vercel:** importa repo, detecta Vite, serve `dist/`
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Supabase Auth:** adicionar URL de produção nas redirect URLs

## Testes

Vitest para funções puras em `cycleCalculator.js` e `utils/dates.js`.
