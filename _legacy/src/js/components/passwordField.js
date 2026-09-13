const EYE_OPEN_SVG = `
  <svg class="password-field-icon password-field-icon--show" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
  </svg>
`;

const EYE_CLOSED_SVG = `
  <svg class="password-field-icon password-field-icon--hide" viewBox="0 0 24 24" aria-hidden="true" focusable="false" hidden>
    <path d="M3 3l18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42M6.2 6.73C4.49 8.05 3 10 3 10s3.5 7 10 7c1.78 0 3.36-.52 4.7-1.34M9.88 5.09A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a18.2 18.2 0 0 1-2.16 3.19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

export function renderPasswordField({
  id,
  name = id,
  label,
  autocomplete = 'current-password',
  required = true,
  minlength,
} = {}) {
  const attrs = [
    `type="password"`,
    `id="${id}"`,
    `name="${name}"`,
    `autocomplete="${autocomplete}"`,
    required ? 'required' : '',
    minlength ? `minlength="${minlength}"` : '',
  ].filter(Boolean).join(' ');

  return `
    <div class="form-bloom">
      <label for="${id}">${label}</label>
      <div class="password-field">
        <input ${attrs} />
        <button
          type="button"
          class="password-field-toggle"
          aria-label="Mostrar senha"
          aria-pressed="false"
          aria-controls="${id}"
          data-password-toggle
        >
          ${EYE_OPEN_SVG}
          ${EYE_CLOSED_SVG}
        </button>
      </div>
    </div>
  `;
}

export function mountPasswordToggles(container) {
  container.querySelectorAll('[data-password-toggle]').forEach((button) => {
    const input = button.parentElement?.querySelector('input');
    const iconShow = button.querySelector('.password-field-icon--show');
    const iconHide = button.querySelector('.password-field-icon--hide');
    if (!input) return;

    button.addEventListener('click', () => {
      const isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      button.setAttribute('aria-pressed', String(!isVisible));
      button.setAttribute('aria-label', isVisible ? 'Mostrar senha' : 'Ocultar senha');
      iconShow?.toggleAttribute('hidden', !isVisible);
      iconHide?.toggleAttribute('hidden', isVisible);
    });
  });
}
