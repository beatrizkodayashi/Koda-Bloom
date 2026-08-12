# Design System , Bloom

Identidade visual do aplicativo. Tema claro, rosa pastel, acolhedor e moderno , sem parecer infantil.

## Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | `#fdf8f9` | Fundo geral |
| `--color-surface` | `#ffffff` | Cards, modais |
| `--color-surface-secondary` | `#fef5f7` | Fundos suaves |
| `--color-primary` | `#e8879b` | Ações principais, destaques |
| `--color-primary-light` | `#ffc2d4` | Hover, chips selecionados |
| `--color-primary-dark` | `#d46a82` | Texto de links, brand |
| `--color-accent` | `#c0394b` | Accent vermelho (menstruação) |
| `--color-text` | `#3d2c33` | Texto principal |
| `--color-text-muted` | `#8a7379` | Texto secundário |

### Fases do ciclo

- Menstruação: `--color-phase-menstruation` (#e8879b)
- Folicular: `--color-phase-follicular` (#a8d5ba)
- Ovulação: `--color-phase-ovulation` (#ffd93d)
- Lútea: `--color-phase-luteal` (#c4b5d4)

## Tipografia

- Família: `'Segoe UI', system-ui, sans-serif`
- Escala: xs (12px) → 4xl (40px)
- Line heights: tight (1.25), normal (1.5), relaxed (1.75)

## Espaçamento

Escala de `--space-1` (4px) a `--space-16` (64px).

## Border radius

- sm: 8px , inputs pequenos
- md: 12px , inputs, calendar days
- lg: 16px , cards internos
- xl: 20px , cards principais
- full: pill buttons

## Sombras

- `--shadow-sm` , cards em repouso
- `--shadow-md` , cards em hover
- `--shadow-soft` , botões primários (tom rosa)

## Componentes

### Botões (`.btn-bloom`)

Variantes: `primary`, `secondary`, `ghost`, `accent`
Tamanhos: `sm`, default, `lg`
Min-height touch: 44px

### Cards (`.card-bloom`)

Fundo branco, border sutil, radius xl, sombra leve.

### Chips (`.chip`)

Seleção múltipla/única. Estado `.selected` com fundo rosa claro.

### Badges de fase (`.badge-phase-*`)

Cores semânticas por fase do ciclo.

## Mascote

Estados disponíveis via `setDuckState()`:

- `welcome`, `happy`, `sleeping`, `period`, `flower`
- `celebrating`, `empty`, `thinking`

## Acessibilidade

- Contraste adequado em textos principais
- Focus visible em todos os interativos
- `prefers-reduced-motion` respeitado
- Touch targets ≥ 44px

## Bootstrap

Usado apenas para: grid, containers, utilities estruturais.
Identidade visual vem do CSS customizado (`src/css/`).
