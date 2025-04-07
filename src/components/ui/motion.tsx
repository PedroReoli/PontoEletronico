"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { ReactNode } from "react"

// Variantes de animação reutilizáveis
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

export const slideInFromLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

export const slideInFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

export const slideInFromTop = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

export const slideInFromBottom = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

// Componentes de motion reutilizáveis
interface MotionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export const FadeIn = ({ children, className, delay = 0 }: MotionProps) => (
  <motion.div
    variants={fadeIn}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
    transition={{ delay }}
  >
    {children}
  </motion.div>
)

export const SlideInFromLeft = ({ children, className, delay = 0 }: MotionProps) => (
  <motion.div
    variants={slideInFromLeft}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
    transition={{ delay }}
  >
    {children}
  </motion.div>
)

export const SlideInFromRight = ({ children, className, delay = 0 }: MotionProps) => (
  <motion.div
    variants={slideInFromRight}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
    transition={{ delay }}
  >
    {children}
  </motion.div>
)

export const SlideInFromTop = ({ children, className, delay = 0 }: MotionProps) => (
  <motion.div
    variants={slideInFromTop}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
    transition={{ delay }}
  >
    {children}
  </motion.div>
)

export const SlideInFromBottom = ({ children, className, delay = 0 }: MotionProps) => (
  <motion.div
    variants={slideInFromBottom}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
    transition={{ delay }}
  >
    {children}
  </motion.div>
)

export const ScaleIn = ({ children, className, delay = 0 }: MotionProps) => (
  <motion.div
    variants={scaleIn}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
    transition={{ delay }}
  >
    {children}
  </motion.div>
)

export const StaggerChildren = ({ children, className }: MotionProps) => (
  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className={className}>
    {children}
  </motion.div>
)

// Componente para transições de página
interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export const PageTransition = ({ children, className }: PageTransitionProps) => (
  <AnimatePresence mode="wait">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  </AnimatePresence>
)

// Componente para botões com animação
interface AnimatedButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export const AnimatedButton = ({
  children,
  className,
  onClick,
  disabled = false,
  type = "button",
}: AnimatedButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.2 }}
    className={className}
    onClick={onClick}
    disabled={disabled}
    type={type}
  >
    {children}
  </motion.button>
)

// Componente para cards com animação
export const AnimatedCard = ({ children, className, delay = 0 }: MotionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Componente para listas com animação de stagger
interface AnimatedListProps {
  children: ReactNode
  className?: string
  itemClassName?: string
}

export const AnimatedList = ({ children, className }: AnimatedListProps) => {
  return (
    <motion.ul variants={staggerContainer} initial="hidden" animate="visible" className={className}>
      {children}
    </motion.ul>
  )
}

export const AnimatedListItem = ({ children, className }: MotionProps) => {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={className}
    >
      {children}
    </motion.li>
  )
}

