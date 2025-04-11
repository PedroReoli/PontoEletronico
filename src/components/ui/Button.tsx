"use client"

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"
import { motion } from "framer-motion"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  as?: any // Para permitir usar como Link ou outros componentes
  to?: string // Para quando usado como Link
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      as,
      to,
      ...props
    },
    ref,
  ) => {
    const baseClasses = "btn"

    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    }

    const sizeClasses = {
      sm: "text-xs px-3 py-2",
      md: "text-sm px-4 py-2.5",
      lg: "text-base px-5 py-3",
    }

    const widthClass = fullWidth ? "w-full" : ""

    const buttonContent = (
      <>
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    )

    // Usando motion.div para envolver o botão e aplicar as animações
    const MotionWrapper = ({ children }: { children: ReactNode }) => (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        {children}
      </motion.div>
    )

    // Se for passado um componente personalizado (como Link)
    if (as) {
      const Component = as
      return (
        <MotionWrapper>
          <Component
            to={to}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
            disabled={isLoading || disabled}
            {...props}
          >
            {buttonContent}
          </Component>
        </MotionWrapper>
      )
    }

    // Botão padrão
    return (
      <MotionWrapper>
        <button
          ref={ref}
          className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
          disabled={isLoading || disabled}
          {...props}
        >
          {buttonContent}
        </button>
      </MotionWrapper>
    )
  },
)

Button.displayName = "Button"
