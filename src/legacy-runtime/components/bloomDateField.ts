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

function paintCalendar(picker) {
  const { popover, viewYear, viewMonth, input } = picker;

  popover.innerHTML = `
    <div class="bloom-picker-header">
      <button type="button" class="bloom-picker-nav" data-nav="-1" aria-label="Mês anterior">‹</button>
      <span class="bloom-picker-month">${MONTH_NAMES[viewMonth]} ${viewYear}</span>
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

function updatePopoverPlacement(picker) {
  const { trigger, popover, wrapper } = picker;
  if (popover.hidden) return;

  const triggerRect = trigger.getBoundingClientRect();
  const popoverHeight = popover.offsetHeight;
  const spaceBelow = window.innerHeight - triggerRect.bottom;
  wrapper.classList.toggle('bloom-picker--above', spaceBelow < popoverHeight + 12);
}

function closePicker(picker) {
  if (!picker) return;
  picker.popover.hidden = true;
  picker.wrapper.classList.remove('is-open');
  picker.trigger.setAttribute('aria-expanded', 'false');
  if (activePicker === picker) activePicker = null;
}

function closeOpenPicker() {
  if (activePicker) closePicker(activePicker);
}

export function closeAllBloomPickers() {
  closeOpenPicker();
}

function openPicker(picker) {
  if (picker.input.value) {
    const parsed = parseDateString(picker.input.value);
    picker.viewYear = parsed.getFullYear();
    picker.viewMonth = parsed.getMonth();
  }

  closeOpenPicker();
  activePicker = picker;
  paintCalendar(picker);
  picker.popover.hidden = false;
  picker.wrapper.classList.add('is-open');
  picker.trigger.setAttribute('aria-expanded', 'true');
  updatePopoverPlacement(picker);
}

function bindPopoverEvents(picker) {
  picker.popover.addEventListener('click', (event) => {
    event.stopPropagation();

    const navBtn = event.target.closest('[data-nav]');
    if (navBtn) {
      picker.viewMonth += Number(navBtn.dataset.nav);
      if (picker.viewMonth < 0) {
        picker.viewMonth = 11;
        picker.viewYear -= 1;
      } else if (picker.viewMonth > 11) {
        picker.viewMonth = 0;
        picker.viewYear += 1;
      }
      paintCalendar(picker);
      updatePopoverPlacement(picker);
      return;
    }

    const dayBtn = event.target.closest('[data-date]');
    if (dayBtn && !dayBtn.disabled) {
      picker.input.value = dayBtn.dataset.date;
      syncDateTrigger(picker.input, picker.trigger);
      dispatchValueEvents(picker.input);
      closePicker(picker);
      return;
    }

    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'today') {
      const today = todayString();
      if (!isDateDisabled(today, picker.min, picker.max)) {
        picker.input.value = today;
        syncDateTrigger(picker.input, picker.trigger);
        dispatchValueEvents(picker.input);
      }
      closePicker(picker);
      return;
    }

    if (action === 'clear') {
      picker.input.value = '';
      syncDateTrigger(picker.input, picker.trigger);
      dispatchValueEvents(picker.input);
      closePicker(picker);
    }
  });
}

function enhanceDateInput(input) {
  if (input.dataset.bloomPicker) return;

  const min = input.getAttribute('min') || '';
  const max = input.getAttribute('max') || '';
  const initial = input.value;
  let viewYear;
  let viewMonth;

  if (initial) {
    const parsed = parseDateString(initial);
    viewYear = parsed.getFullYear();
    viewMonth = parsed.getMonth();
  } else {
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
  }

  input.dataset.bloomPicker = 'date';
  input.type = 'hidden';
  input.classList.add('bloom-picker-input');

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
  };

  bindPopoverEvents(picker);

  input.parentNode.insertBefore(wrapper, input);
  wrapper.append(input, trigger, popover);
  syncDateTrigger(input, trigger);

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    if (activePicker === picker) {
      closePicker(picker);
      return;
    }
    openPicker(picker);
  });
}

function enhanceTimeInput(input) {
  if (input.dataset.bloomPicker) return;

  const [rawHour = '21', rawMinute = '00'] = (input.value || '21:00').split(':');
  const hour = String(Math.min(23, Math.max(0, Number(rawHour) || 0))).padStart(2, '0');
  const minute = String(Math.min(59, Math.max(0, Number(rawMinute) || 0))).padStart(2, '0');

  input.dataset.bloomPicker = 'time';
  input.type = 'hidden';
  input.classList.add('bloom-picker-input');
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

export function initBloomPickers(root = document) {
  root.querySelectorAll('input[type="date"]:not([data-bloom-picker])').forEach(enhanceDateInput);
  root.querySelectorAll('input[type="time"]:not([data-bloom-picker])').forEach(enhanceTimeInput);
}

if (typeof document !== 'undefined' && !document.documentElement.dataset.bloomPickerBound) {
  document.documentElement.dataset.bloomPickerBound = '1';

  document.addEventListener('click', () => closeOpenPicker());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeOpenPicker();
  });
}
