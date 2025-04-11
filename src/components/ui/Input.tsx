"use client"

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  label?: string
  error?: string
  action?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, label, error, action, className = "", id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(2, 9)

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
            className={`form-input ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""} ${
              className
            }`}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {icon && <div className="form-input-icon">{icon}</div>}
          {action && <div className="form-input-action">{action}</div>}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = "Input"

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type" | "action">>(
  ({ icon, label, error, className = "", id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || Math.random().toString(36).substring(2, 9)

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
