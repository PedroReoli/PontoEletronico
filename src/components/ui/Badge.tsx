import type { ReactNode } from "react"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info"
  className?: string
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-success-light text-success-dark",
    warning: "bg-warning-light text-warning-dark",
    error: "bg-error-light text-error-dark",
    info: "bg-info-light text-info-dark",
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
