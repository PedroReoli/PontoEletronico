"use client"

import React, { type InputHTMLAttributes, forwardRef } from "react"
import "../../styles/components/checkbox.css"

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
  error?: string
  helperText?: string
  indeterminate?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, indeterminate, className = "", id, disabled, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`

    React.useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        ref.current.indeterminate = !!indeterminate
      }
    }, [ref, indeterminate])

    return (
      <div className={`checkbox-container ${className}`}>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            className={`checkbox-input ${error ? "checkbox-error" : ""}`}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
            {...props}
          />
          <label htmlFor={checkboxId} className="checkbox-label">
            <span className="checkbox-box"></span>
            {label && <span className="checkbox-text">{label}</span>}
          </label>
        </div>
        {error && (
          <div className="checkbox-message checkbox-error-message" id={`${checkboxId}-error`}>
            {error}
          </div>
        )}
        {helperText && !error && (
          <div className="checkbox-message checkbox-helper-text" id={`${checkboxId}-helper`}>
            {helperText}
          </div>
        )}
      </div>
    )
  },
)

Checkbox.displayName = "Checkbox"

export default Checkbox
