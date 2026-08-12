# Guia Supabase — Bloom

Este guia explica passo a passo como configurar o Supabase do zero para o Bloom.

## O que é o Supabase?

Supabase é um backend open-source que oferece:

- **PostgreSQL** — banco de dados relacional
- **Authentication** — login por e-mail/senha
- **Row Level Security (RLS)** — cada usuária só acessa seus próprios dados

## Convenção de nomes (banco compartilhado)

Todas as tabelas, funções e triggers deste projeto usam o prefixo **`bloom_`**, pois o banco PostgreSQL é compartilhado com outros projetos.

Exemplos: `bloom_profiles`, `bloom_daily_logs`, `bloom_handle_new_user()`.

No JavaScript, use sempre as constantes de `src/js/config/tables.js` — nunca hardcode o nome da tabela.

---

## Passo 1: Criar conta

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **Start your project**
3. Faça login com GitHub (recomendado) ou e-mail

## Passo 2: Criar projeto

1. No dashboard, clique em **New Project**
2. Preencha:
   - **Name:** `bloom` (ou outro nome)
   - **Database Password:** crie uma senha forte e **guarde em local seguro**
   - **Region:** escolha a mais próxima (ex: South America — São Paulo)
3. Clique em **Create new project**
4. Aguarde ~2 minutos até o projeto ficar pronto

## Passo 3: Executar migrations SQL

### 3.1 Abrir SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New query**

### 3.2 Executar schema inicial

1. Abra o arquivo `supabase/migrations/001_initial_schema.sql` do projeto
2. Copie **todo** o conteúdo
3. Cole no SQL Editor
4. Clique em **Run** (ou Ctrl+Enter)
5. Deve aparecer "Success. No rows returned"

**O que isso faz:** cria todas as tabelas (`bloom_profiles`, `bloom_daily_logs`, `bloom_period_entries`, etc.) e um trigger que cria perfil automaticamente quando alguém se cadastra.

### 3.3 Executar policies RLS

1. Nova query no SQL Editor
2. Copie o conteúdo de `supabase/migrations/002_rls_policies.sql`
3. Cole e clique em **Run**

**O que isso faz:** ativa Row Level Security e cria policies que permitem cada usuária acessar **somente** seus dados.

## Passo 4: Copiar credenciais

1. No menu lateral, clique em **Project Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie:
   - **Project URL** → ex: `https://xxxxx.supabase.co`
   - **anon public** key (em Project API keys) → começa com `eyJ...`

## Passo 5: Configurar `.env` local

1. Na raiz do projeto, copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Preencha:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...sua-chave-anon
```

> **Importante:** a chave `anon` é pública e vai no bundle do frontend. Isso é seguro **desde que o RLS esteja ativo**. Nunca use a chave `service_role` no navegador.

## Passo 6: Configurar Authentication

1. Menu lateral → **Authentication**
2. Clique em **Providers**
3. Confirme que **Email** está habilitado
4. Em **Authentication** → **URL Configuration**:
   - **Site URL:** `http://localhost:5173` (desenvolvimento)
   - **Redirect URLs:** adicione:
     - `http://localhost:5173/login`
     - `http://localhost:5173/reset-password`
     - (depois do deploy) `https://seu-app.vercel.app/login`

## Passo 7: Testar cadastro

1. Rode o projeto: `npm run dev`
2. Acesse `http://localhost:5173`
3. Crie uma conta
4. No Supabase → **Authentication** → **Users** — deve aparecer o novo usuário
5. No **Table Editor** → `bloom_profiles` — deve ter um registro com seu `user_id`

## Passo 8: Entender RLS

Cada policy segue o padrão:

```sql
auth.uid() = user_id
```

- `auth.uid()` = ID da usuária logada
- `user_id` = coluna na tabela

Se os IDs não batem, a query retorna vazio. A segurança está no banco, não no JavaScript.

## Troubleshooting

| Problema | Solução |
|----------|---------|
| "Invalid API key" | Verifique URL e anon key no `.env` |
| Cadastro funciona mas perfil vazio | Reexecute `001_initial_schema.sql` (trigger `handle_new_user`) |
| "new row violates row-level security" | Reexecute `002_rls_policies.sql` |
| E-mail de confirmação não chega | Verifique spam; ou desabilite confirmação em Auth → Settings |
