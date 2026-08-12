# Bloom , Roadmap de Desenvolvimento

Aplicativo web de acompanhamento de ciclo menstrual. Nome provisório: **Bloom**.

## Estado atual do repositório

- Branch: `main`
- Conteúdo inicial: apenas `README.md`
- Remote: conectado ao GitHub (`origin/main`)

## Arquitetura escolhida

**SPA (Single Page Application) em Vanilla JS + ES Modules**, servida pelo Vite.

### Por que SPA?

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| Múltiplas páginas HTML | Simples para iniciantes | Navegação recarrega tudo; estado difícil de compartilhar | ❌ |
| SPA Vanilla JS | Experiência fluida tipo app; estado centralizado; uma shell com bottom nav | Requer roteador simples | ✅ Escolhida |
| Framework (React/Vue) | Ecossistema rico | Fora do escopo pedagógico | ❌ |

A SPA permite navegação mobile nativa (bottom nav), sessão persistente e transições suaves sem framework.

### Fluxo de telas

```
Landing (pública)
    ↓
Auth (login / cadastro / recuperar senha)
    ↓
Onboarding (primeiro acesso)
    ↓
App autenticada:
  - Hoje (dashboard)
  - Calendário
  - Registrar (check-in)
  - Insights
  - Perfil
```

## Fases de implementação

### Fase 1 , Setup e arquitetura ✅ em andamento
- [x] Análise do repositório
- [x] ROADMAP.md e documentação de arquitetura
- [ ] Vite + Bootstrap 5 + Bootstrap Icons
- [ ] Estrutura de pastas modular
- [ ] `.env.example`, `.gitignore`
- [ ] Config central (`APP_NAME`)

### Fase 2 , Design system e estrutura responsiva
- [ ] CSS variables (identidade rosa pastel)
- [ ] Tipografia, spacing, radius, shadows
- [ ] Componentes base (botões, cards, inputs, chips)
- [ ] Bottom navigation (mobile) + sidebar (desktop)
- [ ] Documento `docs/DESIGN_SYSTEM.md`

### Fase 3 , Landing page
- [ ] Hero com mascote e flores
- [ ] Seções: como funciona, privacidade, CTA
- [ ] SEO básico (title, description, OG)
- [ ] Favicon

### Fase 4 , Supabase e banco
- [ ] Schema SQL (`supabase/migrations/`)
- [ ] RLS policies
- [ ] Guia `docs/SUPABASE.md`
- **Ação manual:** criar projeto Supabase e executar SQL

### Fase 5 , Autenticação
- [ ] Telas login, cadastro, recuperar senha
- [ ] Sessão persistente via Supabase Auth
- **Ação manual:** configurar URLs de redirect no Supabase

### Fase 6 , Onboarding
- [ ] Fluxo em etapas com mascote
- [ ] Salvar progresso no banco

### Fase 7 , Dashboard (Hoje)
- [ ] Saudação, dia do ciclo, fase, previsões
- [ ] Resumo diário, dicas, jardim

### Fase 8 , Registro menstrual
- [ ] Início, fim, fluxo
- [ ] Edição de registros anteriores

### Fase 9 , Check-in diário
- [ ] Humor, sintomas, dor, sono, energia, etc.
- [ ] Personalização de categorias

### Fase 10 , Calendário
- [ ] Calendário mensal próprio
- [ ] Legenda, navegação, seleção de dia

### Fase 11 , Algoritmo de ciclo
- [ ] `cycleCalculator.js` com funções puras
- [ ] Testes Vitest

### Fase 12 , Insights
- [ ] Estatísticas e gráficos leves (Chart.js)
- [ ] "Seus Padrões" e "Meu ciclo" (timeline)

### Fase 13 , Mascote (Duck Companion)
- [ ] Componente centralizado com estados SVG
- [ ] Resumo do dia via templates

### Fase 14 , Meu Jardim
- [ ] Progresso visual positivo, sem punição

### Fase 15 , Configurações / perfil
- [ ] Preferências, logout, aviso de saúde

### Fase 16 , PWA
- [ ] manifest.json, service worker básico

### Fase 17 , Acessibilidade e responsividade
- [ ] Testes em breakpoints 320,2560px
- [ ] `prefers-reduced-motion`

### Fase 18 , Segurança
- [ ] Revisão XSS, sanitização, RLS

### Fase 19 , Documentação
- [ ] README completo
- [ ] `docs/DEPLOY_VERCEL.md`

### Fase 20 , Deploy
- **Ação manual:** Vercel + variáveis de ambiente + redirect Supabase

## Quando você precisa agir

| Etapa | O que fazer |
|-------|-------------|
| Fase 4 | Criar projeto no Supabase, executar migrations SQL |
| Fase 4 | Copiar URL e anon key para `.env` |
| Fase 5 | Configurar Authentication e redirect URLs no Supabase |
| Fase 20 | Conectar repo no Vercel, adicionar env vars, deploy |

Cada etapa manual terá instruções passo a passo quando chegarmos nela.
