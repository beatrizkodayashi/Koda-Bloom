'use client';

import { useState } from 'react';

type PasswordFieldProps = {
  id: string;
  name?: string;
  label: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
};

export function PasswordField({
  id,
  name = id,
  label,
  autoComplete = 'current-password',
  required = true,
  minLength,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-bloom">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input
          type={visible ? 'text' : 'password'}
          id={id}
          name={name}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          className="password-field-toggle"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((value) => !value)}
        >
          <svg
            className="password-field-icon password-field-icon--show"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            style={{ display: visible ? 'none' : 'block' }}
          >
            <path
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <svg
            className="password-field-icon password-field-icon--hide"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            style={{ display: visible ? 'block' : 'none' }}
          >
            <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42M6.2 6.73C4.49 8.05 3 10 3 10s3.5 7 10 7c1.78 0 3.36-.52 4.7-1.34M9.88 5.09A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a18.2 18.2 0 0 1-2.16 3.19"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
