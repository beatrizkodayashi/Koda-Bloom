# Bloom

Aplicativo web de acompanhamento de ciclo menstrual — mobile first, privado e acolhedor.

## Tecnologias

- HTML5, CSS3, JavaScript (ES Modules)
- Bootstrap 5 (grid e utilities)
- Vite (build)
- Supabase (PostgreSQL, Auth, RLS)
- Vitest (testes)
- Vercel (deploy)

## Estrutura

```
src/js/
  config/       # APP_NAME, Supabase client
  state/        # Store pub/sub
  services/     # Auth, ciclo, logs, insights, jardim
  components/   # Navegação, mascote, toast
  pages/        # Landing, auth, dashboard, calendário...
  utils/        # Datas, validadores, formatadores
src/css/        # Design system customizado
supabase/migrations/  # SQL para executar no Supabase
docs/           # Guias detalhados
tests/          # Testes automatizados
```

## Instalação

```bash
npm install
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

Acesse `http://localhost:5173`

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção → `dist/` |
| `npm run preview` | Preview do build |
| `npm test` | Roda testes Vitest |

## Configuração Supabase

Veja o guia completo: [docs/SUPABASE.md](docs/SUPABASE.md)

1. Crie projeto no Supabase
2. Execute `supabase/migrations/001_initial_schema.sql`
3. Execute `supabase/migrations/002_rls_policies.sql`
4. Copie credenciais para `.env`

## Deploy

Veja: [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md)

## Arquitetura

Veja: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Roadmap

Veja: [ROADMAP.md](ROADMAP.md)

## Aviso de saúde

O aplicativo fornece estimativas baseadas nos dados registrados e não substitui orientação, diagnóstico ou acompanhamento médico.

## Licença

Projeto privado.
