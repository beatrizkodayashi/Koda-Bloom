// @ts-nocheck
import { renderIcon } from '@/legacy-runtime/components/icons';
import {
  parseDateString,
  formatDateString,
  formatDisplayDate,
  todayString,
  daysInMonth,
  diffDays,
} from '@/lib/utils/dates';

const MONTH_NAMES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

let activePicker = null;
const pickersByInput = new WeakMap();
let pickerObserver = null;
let pickerLayer = null;

function dispatchValueEvents(input) {
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function formatTriggerLabel(value) {
  if (!value) return 'Escolher data';
  try {
    return formatDisplayDate(value, { year: true });
  } catch {
    return 'Escolher data';
  }
}

function isDateDisabled(dateStr, min, max) {
  if (min && diffDays(min, dateStr) < 0) return true;
  if (max && diffDays(dateStr, max) < 0) return true;
  return false;
}

function viewFromValue(value) {
  if (value) {
    try {
      const parsed = parseDateString(value);
      return { viewYear: parsed.getFullYear(), viewMonth: parsed.getMonth() };
    } catch {
      // fall through to today
    }
  }
  const now = new Date();
  return { viewYear: now.getFullYear(), viewMonth: now.getMonth() };
}

function syncDateTrigger(input, trigger) {
  const label = trigger.querySelector('.bloom-picker-value');
  if (label) label.textContent = formatTriggerLabel(input.value);
  trigger.classList.toggle('is-empty', !input.value);
}

function syncTimeInput(hourSelect, minuteSelect, input) {
  const hour = hourSelect.value.padStart(2, '0');
  const minute = minuteSelect.value.padStart(2, '0');
  input.value = `${hour}:${minute}`;
  dispatchValueEvents(input);
}

function yearBounds(picker) {
  const now = new Date().getFullYear();
  let minYear = now - 20;
  let maxYear = now + 10;

  if (picker.min) {
    try {
      minYear = parseDateString(picker.min).getFullYear();
    } catch {
      // keep default
    }
  }
  if (picker.max) {
    try {
      maxYear = parseDateString(picker.max).getFullYear();
    } catch {
      // keep default
    }
  }

  if (picker.viewYear < minYear) minYear = picker.viewYear;
  if (picker.viewYear > maxYear) maxYear = picker.viewYear;
  return { minYear, maxYear };
}

function pausePickerObserver() {
  pickerObserver?.disconnect();
}

function resumePickerObserver() {
  pickerObserver?.observe(document.documentElement, { childList: true, subtree: true });
}

function getPickerLayer() {
  if (pickerLayer?.isConnected) return pickerLayer;
  pickerLayer = document.createElement('div');
  pickerLayer.id = 'bloom-picker-layer';
  pickerLayer.className = 'bloom-picker-layer';
  pickerLayer.hidden = true;
  pickerLayer.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeOpenPicker();
  });
  document.body.append(pickerLayer);
  return pickerLayer;
}

function shiftMonth(picker, delta) {
  picker.viewMonth += delta;
  if (picker.viewMonth < 0) {
    picker.viewMonth = 11;
    picker.viewYear -= 1;
  } else if (picker.viewMonth > 11) {
    picker.viewMonth = 0;
    picker.viewYear += 1;
  }
}

function renderCalendarDays(picker) {
  const { viewYear, viewMonth, input, min, max } = picker;
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = daysInMonth(viewYear, viewMonth);
  const today = todayString();
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push('<span class="bloom-picker-day bloom-picker-day--spacer" aria-hidden="true"></span>');
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const dateStr = formatDateString(new Date(viewYear, viewMonth, day));
    const classes = ['bloom-picker-day'];
    if (dateStr === input.value) classes.push('is-selected');
    if (dateStr === today) classes.push('is-today');
    if (isDateDisabled(dateStr, min, max)) classes.push('is-disabled');

    cells.push(
      `<button type="button" class="${classes.join(' ')}" data-date="${dateStr}"${isDateDisabled(dateStr, min, max) ? ' disabled' : ''}>${day}</button>`
    );
  }

  return cells.join('');
}

function renderYearButtons(picker) {
  const { minYear, maxYear } = yearBounds(picker);
  const buttons = [];
  for (let year = maxYear; year >= minYear; year -= 1) {
    const selected = year === picker.viewYear ? ' is-selected' : '';
    buttons.push(
      `<button type="button" class="bloom-picker-year-btn${selected}" data-set-year="${year}">${year}</button>`
    );
  }
  return buttons.join('');
}

function paintCalendar(picker) {
  const { popover, input, viewYear, viewMonth } = picker;
  const mode = picker.viewMode || 'days';

  if (mode === 'months') {
    popover.innerHTML = `
      <div class="bloom-picker-header">
        <button type="button" class="bloom-picker-nav" data-shift-year="-1" aria-label="Ano anterior">‹</button>
        <button type="button" class="bloom-picker-caption-btn" data-view="years">${viewYear}</button>
        <button type="button" class="bloom-picker-nav" data-shift-year="1" aria-label="Próximo ano">›</button>
      </div>
      <div class="bloom-picker-month-grid">
        ${MONTH_NAMES.map((label, index) => {
          const selected = index === viewMonth ? ' is-selected' : '';
          return `<button type="button" class="bloom-picker-month-btn${selected}" data-set-month="${index}">${label}</button>`;
        }).join('')}
      </div>
    `;
  } else if (mode === 'years') {
    popover.innerHTML = `
      <div class="bloom-picker-header">
        <button type="button" class="bloom-picker-caption-btn" data-view="months">${viewYear}</button>
      </div>
      <div class="bloom-picker-year-grid">${renderYearButtons(picker)}</div>
    `;
  } else {
    popover.innerHTML = `
      <div class="bloom-picker-header">
        <button type="button" class="bloom-picker-nav" data-nav="-1" aria-label="Mês anterior">‹</button>
        <button type="button" class="bloom-picker-caption-btn" data-view="months">${MONTH_NAMES[viewMonth]} ${viewYear}</button>
        <button type="button" class="bloom-picker-nav" data-nav="1" aria-label="Próximo mês">›</button>
      </div>
      <div class="bloom-picker-weekdays" aria-hidden="true">
        ${WEEKDAY_LABELS.map((label) => `<span>${label}</span>`).join('')}
      </div>
      <div class="bloom-picker-calendar">
        ${renderCalendarDays(picker)}
      </div>
      <div class="bloom-picker-footer">
        ${!input.required ? '<button type="button" class="bloom-picker-action" data-action="clear">Limpar</button>' : '<span></span>'}
        <button type="button" class="bloom-picker-action bloom-picker-action--primary" data-action="today">Hoje</button>
      </div>
    `;
  }

  bindPaintedControls(picker);
}

function resetPopoverPosition(popover) {
  popover.style.position = '';
  popover.style.top = '';
  popover.style.left = '';
  popover.style.right = '';
  popover.style.bottom = '';
  popover.style.width = '';
  popover.style.maxWidth = '';
  popover.style.zIndex = '';
}

function updatePopoverPlacement(picker) {
  const { trigger, popover, wrapper } = picker;
  if (popover.hidden || !trigger.isConnected) return;

  const triggerRect = trigger.getBoundingClientRect();
  const isMobile = window.matchMedia('(max-width: 1023px)').matches;
  const navClearance = isMobile ? 104 : 12;
  const width = isMobile
    ? Math.min(triggerRect.width, window.innerWidth - 16)
    : Math.min(244, Math.max(triggerRect.width, 196));
  const left = Math.min(
    Math.max(8, triggerRect.left),
    Math.max(8, window.innerWidth - width - 8)
  );

  popover.style.position = 'fixed';
  popover.style.left = `${left}px`;
  popover.style.right = 'auto';
  popover.style.width = `${width}px`;
  popover.style.maxWidth = `${width}px`;
  popover.style.zIndex = '10051';

  const estimatedHeight = popover.offsetHeight || 280;
  const spaceBelow = window.innerHeight - triggerRect.bottom - navClearance;
  const openAbove = spaceBelow < estimatedHeight;
  wrapper.classList.toggle('bloom-picker--above', openAbove);

  if (openAbove) {
    popover.style.top = 'auto';
    popover.style.bottom = `${window.innerHeight - triggerRect.top + 6}px`;
  } else {
    popover.style.bottom = 'auto';
    popover.style.top = `${triggerRect.bottom + 6}px`;
  }
}

function applyPickedDate(picker, value) {
  if (activePicker !== picker) return;
  picker.input.value = value;
  syncDateTrigger(picker.input, picker.trigger);
  dispatchValueEvents(picker.input);
  closePicker(picker);
}

function refreshPickerView(picker) {
  paintCalendar(picker);
  updatePopoverPlacement(picker);
}

function closePicker(picker) {
  if (!picker) return;
  picker.viewMode = 'days';
  picker.popover.hidden = true;
  picker.popover.classList.remove('is-ported');
  picker.wrapper.classList.remove('is-open', 'bloom-picker--above');
  picker.trigger.setAttribute('aria-expanded', 'false');
  resetPopoverPosition(picker.popover);
  if (picker.popover.parentElement !== picker.wrapper) {
    picker.wrapper.append(picker.popover);
  }
  if (pickerLayer) pickerLayer.hidden = true;
  if (activePicker === picker) activePicker = null;
  resumePickerObserver();
}

function closeOpenPicker() {
  if (activePicker) closePicker(activePicker);
}

export function closeAllBloomPickers() {
  closeOpenPicker();
}

function openPicker(picker) {
  if (!picker?.trigger?.isConnected) return;

  const view = viewFromValue(picker.input.value);
  picker.viewYear = view.viewYear;
  picker.viewMonth = view.viewMonth;
  picker.viewMode = 'days';

  if (activePicker && activePicker !== picker) closePicker(activePicker);

  pausePickerObserver();
  activePicker = picker;
  const layer = getPickerLayer();
  layer.hidden = false;
  document.body.append(layer);
  document.body.append(picker.popover);
  picker.popover.classList.add('is-ported');
  picker.popover.hidden = false;
  picker.wrapper.classList.add('is-open');
  picker.trigger.setAttribute('aria-expanded', 'true');
  refreshPickerView(picker);
  requestAnimationFrame(() => updatePopoverPlacement(picker));
}

function activatePickerControl(picker, btn) {
  if (activePicker !== picker) return;
  if (btn.hasAttribute('disabled')) return;

  const date = btn.getAttribute('data-date');
  if (date) {
    applyPickedDate(picker, date);
    return;
  }

  const view = btn.getAttribute('data-view');
  if (view) {
    picker.viewMode = view;
    refreshPickerView(picker);
    return;
  }

  if (btn.hasAttribute('data-set-month')) {
    picker.viewMonth = Number(btn.getAttribute('data-set-month'));
    picker.viewMode = 'days';
    refreshPickerView(picker);
    return;
  }

  if (btn.hasAttribute('data-set-year')) {
    picker.viewYear = Number(btn.getAttribute('data-set-year'));
    picker.viewMode = 'months';
    refreshPickerView(picker);
    return;
  }

  if (btn.hasAttribute('data-shift-year')) {
    picker.viewYear += Number(btn.getAttribute('data-shift-year'));
    refreshPickerView(picker);
    return;
  }

  if (btn.hasAttribute('data-nav')) {
    shiftMonth(picker, Number(btn.getAttribute('data-nav')));
    refreshPickerView(picker);
    return;
  }

  const action = btn.getAttribute('data-action');
  if (action === 'today') {
    const today = todayString();
    if (!isDateDisabled(today, picker.min, picker.max)) {
      applyPickedDate(picker, today);
    } else {
      closePicker(picker);
    }
    return;
  }

  if (action === 'clear') {
    applyPickedDate(picker, '');
  }
}

function bindPaintedControls(picker) {
  picker.popover.querySelectorAll('button').forEach((btn) => {
    const activate = (event) => {
      event.preventDefault();
      event.stopPropagation();
      activatePickerControl(picker, btn);
    };
    btn.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      activatePickerControl(picker, btn);
    });
    btn.addEventListener('click', activate);
  });
}

function bindPopoverEvents(picker) {
  picker.popover.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
}

function neutralizeNativeDatePicker(input) {
  const value = input.value;
  input.classList.add('bloom-picker-input');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('inputmode', 'none');
  input.tabIndex = -1;
  input.readOnly = true;

  try {
    input.type = 'text';
  } catch {
    // some browsers block type swaps; CSS still hides the native control
  }

  if (value && input.value !== value) input.value = value;

  if (typeof input.showPicker === 'function') {
    input.showPicker = () => {};
  }
}

function enhanceDateInput(input) {
  if (!input || input.dataset.bloomPicker || !input.parentNode) return pickersByInput.get(input);

  const min = input.getAttribute('min') || '';
  const max = input.getAttribute('max') || '';
  const initial = input.value;
  const { viewYear, viewMonth } = viewFromValue(initial);

  input.dataset.bloomPicker = 'date';
  neutralizeNativeDatePicker(input);

  const wrapper = document.createElement('div');
  wrapper.className = 'bloom-picker bloom-picker--date';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'bloom-picker-trigger';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = `
    <span class="bloom-picker-value">${formatTriggerLabel(initial)}</span>
    <span class="bloom-picker-icon">${renderIcon('calendar', 'bloom-icon bloom-icon--sm')}</span>
  `;

  const popover = document.createElement('div');
  popover.className = 'bloom-picker-popover';
  popover.hidden = true;
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'Escolher data');

  const picker = {
    input,
    trigger,
    popover,
    wrapper,
    min,
    max,
    viewYear,
    viewMonth,
    viewMode: 'days',
  };

  pickersByInput.set(input, picker);
  bindPopoverEvents(picker);

  input.parentNode.insertBefore(wrapper, input);
  wrapper.append(input, trigger, popover);
  syncDateTrigger(input, trigger);

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (activePicker === picker) {
      closePicker(picker);
      return;
    }
    openPicker(picker);
  });

  input.addEventListener('focus', () => {
    openPicker(picker);
  });

  return picker;
}

function enhanceTimeInput(input) {
  if (input.dataset.bloomPicker || !input.parentNode) return;

  const [rawHour = '21', rawMinute = '00'] = (input.value || '21:00').split(':');
  const hour = String(Math.min(23, Math.max(0, Number(rawHour) || 0))).padStart(2, '0');
  const minute = String(Math.min(59, Math.max(0, Number(rawMinute) || 0))).padStart(2, '0');

  input.dataset.bloomPicker = 'time';
  input.classList.add('bloom-picker-input');
  input.tabIndex = -1;
  try {
    input.type = 'hidden';
  } catch {
    input.hidden = true;
  }
  input.value = `${hour}:${minute}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'bloom-picker bloom-picker--time';

  const fields = document.createElement('div');
  fields.className = 'bloom-time-fields';

  const hourSelect = document.createElement('select');
  hourSelect.className = 'bloom-time-select';
  hourSelect.setAttribute('aria-label', 'Hora');
  for (let h = 0; h < 24; h += 1) {
    const option = document.createElement('option');
    const label = String(h).padStart(2, '0');
    option.value = label;
    option.textContent = label;
    if (label === hour) option.selected = true;
    hourSelect.append(option);
  }

  const separator = document.createElement('span');
  separator.className = 'bloom-time-separator';
  separator.textContent = ':';

  const minuteSelect = document.createElement('select');
  minuteSelect.className = 'bloom-time-select';
  minuteSelect.setAttribute('aria-label', 'Minuto');
  for (let m = 0; m < 60; m += 1) {
    const option = document.createElement('option');
    const label = String(m).padStart(2, '0');
    option.value = label;
    option.textContent = label;
    if (label === minute) option.selected = true;
    minuteSelect.append(option);
  }

  fields.append(hourSelect, separator, minuteSelect);
  input.parentNode.insertBefore(wrapper, input);
  wrapper.append(input, fields);

  hourSelect.addEventListener('change', () => syncTimeInput(hourSelect, minuteSelect, input));
  minuteSelect.addEventListener('change', () => syncTimeInput(hourSelect, minuteSelect, input));
}

export function syncBloomPicker(input) {
  if (!input?.dataset?.bloomPicker) return;
  const wrapper = input.closest('.bloom-picker');
  if (!wrapper) return;

  if (input.dataset.bloomPicker === 'date') {
    const trigger = wrapper.querySelector('.bloom-picker-trigger');
    if (trigger) syncDateTrigger(input, trigger);
    return;
  }

  if (input.dataset.bloomPicker === 'time') {
    const [hour = '21', minute = '00'] = (input.value || '21:00').split(':');
    const hourSelect = wrapper.querySelector('.bloom-time-select');
    const minuteSelect = wrapper.querySelectorAll('.bloom-time-select')[1];
    if (hourSelect) hourSelect.value = String(Number(hour)).padStart(2, '0');
    if (minuteSelect) minuteSelect.value = String(Number(minute)).padStart(2, '0');
  }
}

export function initBloomPickers(root: ParentNode = document) {
  bindGlobalPickerChrome();
  if (!root?.querySelectorAll) return;
  root.querySelectorAll('input[type="date"]:not([data-bloom-picker])').forEach(enhanceDateInput);
  root.querySelectorAll('input[type="time"]:not([data-bloom-picker])').forEach(enhanceTimeInput);
}

function isRawDateInput(node) {
  return node instanceof HTMLInputElement && node.type === 'date' && !node.dataset.bloomPicker;
}

function interceptNativeDateInteraction(event) {
  const target = event.target;
  if (!isRawDateInput(target)) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  const picker = enhanceDateInput(target);
  if (picker) openPicker(picker);
}

let pickerChromeBound = false;

function bindGlobalPickerChrome() {
  if (typeof document === 'undefined' || pickerChromeBound) return;
  pickerChromeBound = true;

  document.addEventListener('pointerdown', interceptNativeDateInteraction, true);
  document.addEventListener('mousedown', interceptNativeDateInteraction, true);
  document.addEventListener('click', interceptNativeDateInteraction, true);
  document.addEventListener('focusin', interceptNativeDateInteraction, true);

  document.addEventListener('pointerdown', (event) => {
    if (!activePicker) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (pickerLayer?.contains(target)) return;
    if (activePicker.wrapper.contains(target) || activePicker.popover.contains(target)) return;
    closeOpenPicker();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeOpenPicker();
  });

  window.addEventListener('resize', () => {
    if (activePicker) updatePopoverPlacement(activePicker);
  });
  window.addEventListener('orientationchange', () => {
    if (activePicker) updatePopoverPlacement(activePicker);
  });

  let scheduled = false;
  pickerObserver = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      initBloomPickers(document);
      if (activePicker && !activePicker.trigger.isConnected) closePicker(activePicker);
    });
  });
  pickerObserver.observe(document.documentElement, { childList: true, subtree: true });
}
