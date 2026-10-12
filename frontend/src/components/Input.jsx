import React from 'react';

export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  helpText,
  disabled = false,
  min,
  max,
  step,
  ...props
}) {
  const inputId = id || name;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span style={{ color: 'var(--error-red)' }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`form-input ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        {...props}
      />
      {helpText && !error && (
        <span id={`${inputId}-help`} style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>
          {helpText}
        </span>
      )}
      {error && (
        <span id={`${inputId}-error`} className="form-error">
          {error}
        </span>
      )}
    </div>
  );
}
