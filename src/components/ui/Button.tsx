import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      isLoading = false,
      fullWidth = false,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = "flex items-center justify-center gap-2 font-medium rounded-md transition-all";
    
    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400",
      outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    };
    
    const sizeClasses = {
      sm: "text-xs py-1 px-2",
      md: "text-sm py-2 px-4",
      lg: "text-base py-3 px-6",
    };
    
    const disabledClasses = "opacity-50 cursor-not-allowed";
    const widthClass = fullWidth ? "w-full" : "";
    
    const buttonClasses = `
      ${baseClasses} 
      ${variantClasses[variant]} 
      ${sizeClasses[size]} 
      ${disabled || isLoading ? disabledClasses : ""} 
      ${widthClass}
      ${className}
    `;

    return (
      <motion.button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Carregando...
          </>
        ) : (
          <>
            {icon && <span className="icon-wrapper">{icon}</span>}
            {children}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
