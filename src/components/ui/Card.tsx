"use client"

import type React from "react"
import type { HTMLAttributes } from "react"
import { motion } from "framer-motion"
import "../../styles/components/card.css"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated"
  interactive?: boolean
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  interactive = false,
  children,
  className = "",
  ...props
}) => {
  const baseClass = `card card-${variant}`
  const interactiveClass = interactive ? "card-interactive" : ""

  const CardComponent = interactive ? motion.div : "div"
  const motionProps = interactive
    ? {
        whileHover: { y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" },
        transition: { duration: 0.2 },
      }
    : {}

  return (
    <CardComponent className={`${baseClass} ${interactiveClass} ${className}`} {...motionProps} {...props}>
      {children}
    </CardComponent>
  )
}

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ children, className = "", ...props }) => {
  return (
    <h3 className={`card-title ${className}`} {...props}>
      {children}
    </h3>
  )
}

export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <p className={`card-description ${className}`} {...props}>
      {children}
    </p>
  )
}

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => {
  return (
    <div className={`card-content ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => {
  return (
    <div className={`card-footer ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card
