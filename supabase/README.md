# Migrations Supabase — Bloom

## Prefixo `bloom_`

Este projeto usa um **banco PostgreSQL compartilhado** com outros apps. Por isso:

- **Tabelas:** `bloom_profiles`, `bloom_daily_logs`, etc.
- **Funções:** `bloom_update_updated_at()`, `bloom_handle_new_user()`
- **Triggers:** `bloom_profiles_updated_at`, `bloom_on_auth_user_created`, etc.

Novas migrations **devem** manter esse prefixo.

## Ordem de execução

1. `001_initial_schema.sql` — tabelas e trigger de signup
2. `002_rls_policies.sql` — Row Level Security

Execute no **SQL Editor** do Supabase (ver `docs/SUPABASE.md`).

## JavaScript

Use `src/js/config/tables.js` para referenciar tabelas nos serviços.
