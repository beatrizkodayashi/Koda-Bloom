const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email).trim());
}

export function isValidPassword(password) {
  return String(password).length >= 8;
}

export function sanitizeText(text, maxLength = 2000) {
  return String(text).trim().slice(0, maxLength);
}

export function isValidDateString(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

export function isInRange(value, min, max) {
  const num = Number(value);
  return !Number.isNaN(num) && num >= min && num <= max;
}
