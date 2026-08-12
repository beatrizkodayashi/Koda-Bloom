/**
 * Card com header estilo janela — referência visual Bloom.
 */

export function renderCard(title, bodyHtml, options = {}) {
  const {
    className = '',
    bodyClass = '',
    showDots = true,
    plain = false,
  } = options;

  if (plain) {
    return `<div class="card-bloom card-bloom--plain ${className}">${bodyHtml}</div>`;
  }

  const dots = showDots
    ? '<span class="card-bloom-dots" aria-hidden="true"><span></span><span></span><span></span></span>'
    : '';

  return `
    <div class="card-bloom ${className}">
      <div class="card-bloom-header">
        <h3 class="card-bloom-title">${title}</h3>
        ${dots}
      </div>
      <div class="card-bloom-body ${bodyClass}">${bodyHtml}</div>
    </div>
  `;
}
