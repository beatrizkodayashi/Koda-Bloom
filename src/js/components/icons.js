/**
 * Ícones SVG inline — substituem emojis na UI Bloom.
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

export const BLOOM_ICONS = {
  duck: `<svg ${SVG_BASE}>
    <ellipse cx="12" cy="14" rx="7" ry="5.5" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <circle cx="12" cy="8.5" r="5" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <circle cx="10" cy="8" r="0.9" fill="#3D2C33"/>
    <circle cx="14" cy="8" r="0.9" fill="#3D2C33"/>
    <path d="M15.5 9.5l2.5 1.5-1.5.5-1 1.5z" fill="#FFB28F" stroke="#FFADBB" stroke-width="1" stroke-linejoin="round"/>
  </svg>`,
  'duck-thought': `<svg ${SVG_BASE}>
    <ellipse cx="9" cy="15" rx="5.5" ry="4" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.25"/>
    <circle cx="9" cy="10.5" r="4" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.25"/>
    <circle cx="7.8" cy="10" r="0.7" fill="#3D2C33"/>
    <circle cx="10.2" cy="10" r="0.7" fill="#3D2C33"/>
    <path d="M12 11.5l1.8 1-1 .3-.7 1z" fill="#FFB28F"/>
    <circle cx="16.5" cy="7" r="2.8" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.25"/>
    <circle cx="19" cy="4.5" r="1.2" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1"/>
    <circle cx="20.5" cy="2.8" r="0.6" fill="#FFADBB" opacity="0.6"/>
    <path d="M15.5 8.5c.5.8 1.2 1.2 2 1.2" stroke="#FFADBB" stroke-width="1" stroke-linecap="round"/>
  </svg>`,
  heart: `<svg ${SVG_BASE}>
    <path d="M12 20s-6.5-4.2-8.5-8.2C2.2 8.8 4.2 5.5 7.5 5.5c1.8 0 3.2 1 4.5 2.5C13.3 6.5 14.7 5.5 16.5 5.5 19.8 5.5 21.8 8.8 20.5 11.8 18.5 15.8 12 20 12 20z" fill="#FFADBB" stroke="#FFB28F" stroke-width="1.25" stroke-linejoin="round"/>
  </svg>`,
  'heart-soft': `<svg ${SVG_BASE}>
    <path d="M12 19s-5.5-3.5-7.2-7C3.5 9.2 5.2 6.5 8 6.5c1.5 0 2.7.8 4 2 1.3-1.2 2.5-2 4-2 2.8 0 4.5 2.7 3.2 5.5C17.5 15.5 12 19 12 19z" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,
  warning: `<svg ${SVG_BASE}>
    <path d="M12 3.5 21 19.5H3L12 3.5z" fill="#FFFBDE" stroke="#FFB28F" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M12 9v5.5" stroke="#FFB28F" stroke-width="1.75" stroke-linecap="round"/>
    <circle cx="12" cy="17" r="1" fill="#FFB28F"/>
  </svg>`,
  seedling: `<svg ${SVG_BASE}>
    <path d="M12 20v-8" stroke="#8BC48A" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M8.5 14c-2.5-4-1-8 3.5-8 0 4-1.5 6.5-3.5 8z" fill="#C8E6C9" stroke="#8BC48A" stroke-width="1.25"/>
    <path d="M15.5 14c2.5-4 1-8-3.5-8 0 4 1.5 6.5 3.5 8z" fill="#C8E6C9" stroke="#8BC48A" stroke-width="1.25"/>
  </svg>`,
  fire: `<svg ${SVG_BASE}>
    <path d="M12 3c1.5 3 4 4.5 4 8a4 4 0 1 1-8 0c0-3.5 2.5-5 4-8z" fill="#FFB28F" stroke="#FFADBB" stroke-width="1.25" stroke-linejoin="round"/>
    <path d="M12 11c.8 1.5 2 2.2 2 3.8a2 2 0 1 1-4 0c0-1.6 1.2-2.3 2-3.8z" fill="#FFFBDE" opacity="0.85"/>
  </svg>`,
  calendar: `<svg ${SVG_BASE}>
    <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <path d="M4 9.5h16" stroke="#FFADBB" stroke-width="1.5"/>
    <path d="M8 3.5v4M16 3.5v4" stroke="#FFB28F" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="8" y="12" width="3" height="3" rx="0.75" fill="#FFADBB"/>
    <rect x="13" y="12" width="3" height="3" rx="0.75" fill="#FFB28F" opacity="0.65"/>
  </svg>`,
  thought: `<svg ${SVG_BASE}>
    <circle cx="10" cy="11" r="6.5" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <circle cx="16.5" cy="6.5" r="3" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.25"/>
    <circle cx="19.5" cy="3.8" r="1.2" fill="#FFADBB" opacity="0.55"/>
    <path d="M7.5 10.5h5M7.5 13h3.5" stroke="#FFB28F" stroke-width="1.25" stroke-linecap="round"/>
  </svg>`,
  sparkles: `<svg ${SVG_BASE}>
    <path d="m12 4 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.25" stroke-linejoin="round"/>
    <path d="m18 14 0.7 2 2 0.7-2 0.7-0.7 2-0.7-2-2-0.7 2-0.7 0.7-2z" fill="#FFB28F" opacity="0.8"/>
    <path d="m6 15 0.5 1.5 1.5 0.5-1.5 0.5-0.5 1.5-0.5-1.5-1.5-0.5 1.5-0.5 0.5-1.5z" fill="#FFADBB" opacity="0.7"/>
  </svg>`,
  target: `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="8.5" stroke="#FFADBB" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" stroke="#FFB28F" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="1.8" fill="#FFADBB"/>
  </svg>`,
  pain: `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="9" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <path d="M8.5 9.5 12 13l3.5-3.5" stroke="#FFB28F" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M12 13v4" stroke="#FFADBB" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="12" cy="19" r="1" fill="#FFADBB"/>
  </svg>`,
  tea: `<svg ${SVG_BASE}>
    <path d="M6 9h10v7a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V9z" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <path d="M16 11h1.8a2.2 2.2 0 0 1 0 4.4H16" stroke="#FFB28F" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M8 5c0-1.2 1-2 2-2M12 5c0-1.2 1-2 2-2" stroke="#8BC48A" stroke-width="1.25" stroke-linecap="round"/>
  </svg>`,
  moon: `<svg ${SVG_BASE}>
    <path d="M14.5 4.5a7 7 0 1 0 5 11.2A5.5 5.5 0 0 1 14.5 4.5z" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="17" cy="8" r="0.8" fill="#FFADBB" opacity="0.45"/>
    <circle cx="15.5" cy="11" r="0.6" fill="#FFADBB" opacity="0.35"/>
  </svg>`,
  period: `<svg ${SVG_BASE}>
    <path d="M12 4c0 4-6 6.5-6 11a6 6 0 0 0 12 0c0-4.5-6-7-6-11z" fill="#FFADBB" stroke="#FFB28F" stroke-width="1.25" stroke-linejoin="round"/>
  </svg>`,
  energy: `<svg ${SVG_BASE}>
    <path d="M13.5 4.5 8.5 13h4l-1.5 6.5L16 11h-4l1.5-6.5z" fill="#FFB28F" stroke="#FFADBB" stroke-width="1.25" stroke-linejoin="round"/>
  </svg>`,
  brain: `<svg ${SVG_BASE}>
    <path d="M9 5.5c-2.2 0-4 1.8-4 4.2 0 1.4.7 2.6 1.8 3.3-.3.7-.5 1.5-.5 2.3a4 4 0 0 0 4 4h.2a4.5 4.5 0 0 0 8.5-2.2c0-.8-.2-1.6-.5-2.3 1.1-.7 1.8-1.9 1.8-3.3 0-2.4-1.8-4.2-4-4.2-.8 0-1.5.2-2.1.6A3.2 3.2 0 0 0 12 5.2a3.2 3.2 0 0 0-2.1-.7z" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,
  chest: `<svg ${SVG_BASE}>
    <path d="M12 20s-4-2.5-5.5-5.5C5.5 12.5 7 9.5 10 9.5c1 0 1.8.5 2 1.2.2-.7 1-1.2 2-1.2 3 0 4.5 3 3.5 5 0 0-1.5 2.5-5.5 5.5z" fill="#FFADBB" opacity="0.55" stroke="#FFADBB" stroke-width="1.25"/>
    <circle cx="12" cy="8.5" r="4.5" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.25"/>
  </svg>`,
  belly: `<svg ${SVG_BASE}>
    <ellipse cx="12" cy="13" rx="6.5" ry="7" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <path d="M9 12.5h6M9.5 15h5" stroke="#FFB28F" stroke-width="1.25" stroke-linecap="round" opacity="0.7"/>
    <circle cx="12" cy="6.5" r="3.5" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.25"/>
  </svg>`,
  spine: `<svg ${SVG_BASE}>
    <path d="M12 4v16" stroke="#FFB28F" stroke-width="1.75" stroke-linecap="round"/>
    <path d="M8.5 7h7M8 11h8M8.5 15h7M8 19h8" stroke="#FFADBB" stroke-width="1.25" stroke-linecap="round"/>
  </svg>`,
  flower: `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="2.2" fill="#FFB28F"/>
    <circle cx="12" cy="7" r="2" fill="#FFADBB" opacity="0.85"/>
    <circle cx="16" cy="10" r="2" fill="#FFADBB" opacity="0.85"/>
    <circle cx="16" cy="14" r="2" fill="#FFADBB" opacity="0.85"/>
    <circle cx="12" cy="17" r="2" fill="#FFADBB" opacity="0.85"/>
    <circle cx="8" cy="14" r="2" fill="#FFADBB" opacity="0.85"/>
    <circle cx="8" cy="10" r="2" fill="#FFADBB" opacity="0.85"/>
  </svg>`,
  discrete: `<svg ${SVG_BASE}>
    <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="2.5" fill="#3D2C33"/>
    <path d="M4 4l16 16" stroke="#FFB28F" stroke-width="1.75" stroke-linecap="round"/>
  </svg>`,
  'care-sad': `<svg ${SVG_BASE}>
    <circle cx="12" cy="12" r="9" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <circle cx="9" cy="10.5" r="1.4" fill="#3D2C33"/>
    <circle cx="15" cy="10.5" r="1.4" fill="#3D2C33"/>
    <path d="M9 16c1.2-.8 4.8-.8 6 0" stroke="#FFADBB" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M7.5 7.5c.5-.8 1.2-1.2 2-1.2" stroke="#3D2C33" stroke-width="1" stroke-linecap="round"/>
  </svg>`,
  note: `<svg ${SVG_BASE}>
    <rect x="6" y="4" width="12" height="16" rx="2" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5"/>
    <path d="M9 9h6M9 12.5h6M9 16h4" stroke="#FFB28F" stroke-width="1.25" stroke-linecap="round"/>
  </svg>`,
  wind: `<svg ${SVG_BASE}>
    <path d="M4 8.5h11a2.5 2.5 0 1 0 0-5" stroke="#8BB4D4" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M4 14h14a3 3 0 1 1 0 6" stroke="#FFADBB" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M4 11h8.5a2 2 0 1 0 0-4" stroke="#FFB28F" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  water: `<svg ${SVG_BASE}>
    <path d="M12 4c0 0-5 6.5-5 10a5 5 0 0 0 10 0c0-3.5-5-10-5-10z" fill="#FFFBDE" stroke="#8BB4D4" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,
  bed: `<svg ${SVG_BASE}>
    <path d="M4 16V9a2 2 0 0 1 2-2h5v9H4z" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M11 7h7a2 2 0 0 1 2 2v7h-9V7z" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M4 18h16" stroke="#FFB28F" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="7.5" cy="9.5" r="1.5" fill="#FFADBB" opacity="0.65"/>
  </svg>`,
  book: `<svg ${SVG_BASE}>
    <path d="M6 5.5h5a3 3 0 0 1 3 3V19a3 3 0 0 0-3-3H6V5.5z" fill="#FFFBDE" stroke="#FFADBB" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M18 5.5h-5a3 3 0 0 0-3 3V19a3 3 0 0 1 3-3h5V5.5z" fill="#FFFBDE" stroke="#FFB28F" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,
  cycle: `<svg ${SVG_BASE}>
    <path d="M12 4a8 8 0 1 1-2.3 15.6" stroke="#FFADBB" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M12 4V1.5M12 4l2 2" stroke="#FFB28F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="12" r="2" fill="#FFADBB"/>
  </svg>`,
};

const ALL_ICONS = { ...MOOD_ICONS, ...BLOOM_ICONS };

export function renderIcon(iconId, className = 'bloom-icon') {
  const svg = ALL_ICONS[iconId];
  if (!svg) return '';
  return `<span class="${className}">${svg}</span>`;
}

export function getIconHtml(iconId) {
  return ALL_ICONS[iconId] || '';
}

export { ALL_ICONS as ICONS };
