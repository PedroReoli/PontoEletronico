import type React from "react"
import "../../styles/components/badge.css"

export interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ variant = "primary", size = "md", children, className = "" }) => {
  return <span className={`badge badge-${variant} badge-${size} ${className}`}>{children}</span>
}

export default Badge
