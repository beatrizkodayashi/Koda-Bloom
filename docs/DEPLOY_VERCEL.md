# Guia Deploy Vercel , Bloom

## O que é a Vercel?

Plataforma de hospedagem otimizada para sites estáticos e SPAs. Conecta ao GitHub e faz deploy automático a cada push.

## Passo 1: Criar conta

1. Acesse [https://vercel.com](https://vercel.com)
2. Faça login com GitHub

## Passo 2: Importar repositório

1. Clique em **Add New** → **Project**
2. Selecione o repositório `Koda-Bloom`
3. A Vercel detecta Vite automaticamente

## Passo 3: Configurar build

Confirme:

| Campo | Valor |
|-------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

## Passo 4: Variáveis de ambiente

Na seção **Environment Variables**, adicione:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anon public do Supabase |

> Use os mesmos valores do `.env` local.

## Passo 5: Deploy

1. Clique em **Deploy**
2. Aguarde o build (~1-2 min)
3. Você receberá uma URL: `https://koda-bloom.vercel.app` (ou similar)

## Passo 6: Atualizar Supabase

1. Supabase → **Authentication** → **URL Configuration**
2. Atualize:
   - **Site URL:** `https://sua-url.vercel.app`
3. Adicione nas **Redirect URLs**:
   - `https://sua-url.vercel.app/login`
   - `https://sua-url.vercel.app/reset-password`

## Passo 7: Testar em produção

1. Acesse a URL da Vercel
2. Crie conta ou faça login
3. Complete o onboarding
4. Registre um check-in
5. Verifique no Supabase Table Editor se os dados aparecem

## Passo 8: Domínio customizado (opcional)

1. Vercel → Project → **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções da Vercel
4. Atualize URLs no Supabase Auth

## Deploys automáticos

Cada push na branch `main` gera um novo deploy automaticamente.

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Página 404 ao recarregar | Confirme que `vercel.json` existe com rewrite para `index.html` |
| Auth não funciona em produção | Adicione URL de produção no Supabase Redirect URLs |
| Build falha | Rode `npm run build` localmente e corrija erros |
| Variáveis não aplicadas | Redeploy após adicionar env vars |
