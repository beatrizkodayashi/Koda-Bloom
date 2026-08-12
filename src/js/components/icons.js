/**
 * Ícones SVG inline — substituem emojis na UI.
 */

const SVG_BASE = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"';

export const MOOD_ICONS = {
  feliz: `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="10" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <circle cx="9" cy="10" r="1.25" fill="#3D2C33"/>
    <circle cx="15" cy="10" r="1.25" fill="#3D2C33"/>
    <path d="M8 14.5c1.6 2 6.4 2 8 0" stroke="#FFADBB" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  tranquila: `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="10" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <path d="M7.5 10.5c1.2-.8 2.3-.8 3.5 0" stroke="#3D2C33" stroke-width="1.25" stroke-linecap="round"/>
    <path d="M13 10.5c1.2-.8 2.3-.8 3.5 0" stroke="#3D2C33" stroke-width="1.25" stroke-linecap="round"/>
    <path d="M8.5 15c1.4 1.2 5.6 1.2 7 0" stroke="#FFADBB" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  sensivel: `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="10" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <circle cx="9" cy="10.5" r="1.6" fill="#3D2C33"/>
    <circle cx="15" cy="10.5" r="1.6" fill="#3D2C33"/>
    <circle cx="9" cy="10.5" r="0.45" fill="#FFFBDE"/>
    <circle cx="15" cy="10.5" r="0.45" fill="#FFFBDE"/>
    <circle cx="7.5" cy="13" r="1.1" fill="#FFADBB" opacity="0.45"/>
    <circle cx="16.5" cy="13" r="1.1" fill="#FFADBB" opacity="0.45"/>
    <path d="M9.5 16.5c.8-.6 3.7-.6 4.5 0" stroke="#FFADBB" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  triste: `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="10" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <circle cx="9" cy="10" r="1.25" fill="#3D2C33"/>
    <circle cx="15" cy="10" r="1.25" fill="#3D2C33"/>
    <path d="M8.5 16c1.5-1.5 5.5-1.5 7 0" stroke="#FFADBB" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M17 12.5c0 1.2.8 2.2 1.5 2.8" stroke="#8BB4D4" stroke-width="1.25" stroke-linecap="round"/>
    <circle cx="18.2" cy="16.2" r="1" fill="#8BB4D4" opacity="0.75"/>
  </svg>`,
  irritada: `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="10" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <path d="M7 8.5l2.5 1.5M17 8.5l-2.5 1.5" stroke="#3D2C33" stroke-width="1.25" stroke-linecap="round"/>
    <circle cx="9" cy="11" r="1.25" fill="#3D2C33"/>
    <circle cx="15" cy="11" r="1.25" fill="#3D2C33"/>
    <path d="M8.5 16.5h7" stroke="#FFADBB" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M10 18.5h4" stroke="#FFB28F" stroke-width="1.25" stroke-linecap="round" opacity="0.8"/>
  </svg>`,
  ansiosa: `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="10" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <path d="M7.5 8.5l1.5 2M16.5 8.5l-1.5 2" stroke="#3D2C33" stroke-width="1.25" stroke-linecap="round"/>
    <circle cx="9" cy="11.5" r="1.35" fill="#3D2C33"/>
    <circle cx="15" cy="11.5" r="1.35" fill="#3D2C33"/>
    <path d="M9 16c1.2-.8 4.8-.8 6 0" stroke="#FFADBB" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M18.5 9.5c0 .8.4 1.4.8 2" stroke="#8BB4D4" stroke-width="1.1" stroke-linecap="round"/>
  </svg>`,
  cansada: `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="10" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <path d="M7.5 10.5c1-.5 2-.5 3 0M13.5 10.5c1-.5 2-.5 3 0" stroke="#3D2C33" stroke-width="1.25" stroke-linecap="round"/>
    <path d="M9 15.5c1.2.4 4.8.4 6 0" stroke="#FFADBB" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M17.5 7.5l1 1.5M19 7l.8 1.2M20.2 6.8l.6 1" stroke="#8BB4D4" stroke-width="1" stroke-linecap="round" opacity="0.85"/>
  </svg>`,
  energetica: `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="10" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <path d="M13.5 5.5L9 13h3.5L10.5 18.5 15 11h-3.5L13.5 5.5z" fill="#FFB28F" stroke="#FFADBB" stroke-width="1" stroke-linejoin="round"/>
  </svg>`,
};

export function renderIcon(iconId, className = 'bloom-icon') {
  const svg = MOOD_ICONS[iconId];
  if (!svg) return '';
  return `<span class="${className}">${svg}</span>`;
}
