import type React from "react"
import { type SelectHTMLAttributes, forwardRef } from "react"
import "../../styles/components/select.css"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string
  options: SelectOption[]
  error?: string
  fullWidth?: boolean
  size?: "sm" | "md" | "lg"
  helperText?: string
  icon?: React.ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      fullWidth = false,
      size = "md",
      helperText,
      icon,
      className = "",
      id,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`

    return (
      <div className={`select-container ${fullWidth ? "select-full-width" : ""} ${className}`}>
        {label && (
          <label htmlFor={selectId} className="select-label">
            {label}
            {required && <span className="select-required">*</span>}
          </label>
        )}
        <div
          className={`select-wrapper select-${size} ${error ? "select-error" : ""} ${
            disabled ? "select-disabled" : ""
          }`}
        >
          {icon && <div className="select-icon">{icon}</div>}
          <select
            ref={ref}
            id={selectId}
            className={`select-field ${icon ? "select-with-icon" : ""}`}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="select-arrow">
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
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        {error && (
          <div className="select-message select-error-message" id={`${selectId}-error`}>
            {error}
          </div>
        )}
        {helperText && !error && (
          <div className="select-message select-helper-text" id={`${selectId}-helper`}>
            {helperText}
          </div>
        )}
      </div>
    )
  },
)

Select.displayName = "Select"

export default Select
