"use client"

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react"

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
