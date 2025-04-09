"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"

function NotFound() {
  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.2 }
    }
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 114, 245, 0.3), 0 4px 6px -2px rgba(0, 114, 245, 0.15)" },
    tap: { scale: 0.97 }
  }

  // Floating elements for background
  const floatingElements = [
    { size: 60, top: "10%", left: "5%", delay: 0 },
    { size: 80, top: "20%", right: "10%", delay: 1 },
    { size: 40, bottom: "15%", left: "10%", delay: 2 },
    { size: 100, bottom: "10%", right: "5%", delay: 3 },
  ]

  return (
    <div className="not-found-container">
      {/* Floating background elements */}
      {floatingElements.map((el, index) => (
        <motion.div
          key={index}
          className="floating-element"
          style={{
            width: el.size,
            height: el.size,
            top: el.top,
            left: el.left,
            right: el.right,
            bottom: el.bottom
          }}
          animate={{
            y: [0, 15, 0],
            x: [0, 10, 0],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            delay: el.delay
          }}
        />
      ))}

      <motion.div
        className="not-found-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="not-found-icon"
          variants={iconVariants}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </motion.div>
        <motion.h1 variants={itemVariants}>404</motion.h1>
        <motion.h2 variants={itemVariants}>Página não encontrada</motion.h2>
        <motion.p variants={itemVariants}>
          A página que você está procurando não existe ou foi removida.
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link to="/dashboard">
            <motion.button
              className="btn btn-primary"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <div className="flex items-center">
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
                  style={{ marginRight: "8px" }}
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Voltar para o Dashboard
              </div>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound
