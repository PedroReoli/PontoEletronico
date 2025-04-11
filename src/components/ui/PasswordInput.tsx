"use client"

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react"

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  label?: string
  error?: string
  showStrength?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ icon, label, error, showStrength = false, className = "", id, value = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || Math.random().toString(36).substring(2, 9)
    const passwordLength = typeof value === "string" ? value.length : 0

    return (
      <div className="mb-4">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <div className="form-input-wrapper">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : "password"}
            className={`form-input ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""} ${
              className
            }`}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : undefined}
            value={value}
            {...props}
          />
          {icon && <div className="form-input-icon">{icon}</div>}
          <button
            type="button"
            className="form-input-action"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>

        {showStrength && passwordLength > 0 && (
          <div className="password-strength">
            <div className={`strength-bar ${passwordLength > 0 ? "weak" : ""}`}></div>
            <div className={`strength-bar ${passwordLength >= 4 ? "medium" : ""}`}></div>
            <div className={`strength-bar ${passwordLength >= 6 ? "strong" : ""}`}></div>
            <span className="strength-text">
              {passwordLength === 0 && "Crie uma senha forte"}
              {passwordLength > 0 && passwordLength < 4 && "Senha fraca"}
              {passwordLength >= 4 && passwordLength < 6 && "Senha média"}
              {passwordLength >= 6 && "Senha forte"}
            </span>
          </div>
        )}

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  },
)

PasswordInput.displayName = "PasswordInput"

export const PasswordConfirmInput = forwardRef<HTMLInputElement, PasswordInputProps & { passwordValue: string }>(
  ({ icon, label, error, className = "", id, value = "", passwordValue = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || Math.random().toString(36).substring(2, 9)
    const passwordsMatch = typeof value === "string" && typeof passwordValue === "string" && value === passwordValue
    const showMatchIndicator =
      typeof value === "string" && value.length > 0 && typeof passwordValue === "string" && passwordValue.length > 0

    return (
      <div className="mb-4">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <div className="form-input-wrapper">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : "password"}
            className={`form-input ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""} ${
              className
            }`}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : undefined}
            value={value}
            {...props}
          />
          {icon && <div className="form-input-icon">{icon}</div>}
          <button
            type="button"
            className="form-input-action"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>

        {showMatchIndicator && (
          <div className="password-match">
            {passwordsMatch ? (
              <span className="match-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Senhas coincidem
              </span>
            ) : (
              <span className="match-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Senhas não coincidem
              </span>
            )}
          </div>
        )}

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  },
)

PasswordConfirmInput.displayName = "PasswordConfirmInput"
