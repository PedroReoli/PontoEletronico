"use client"

import { motion } from "framer-motion"

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <motion.div
        className="loading-spinner"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: {
            duration: 1,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
          },
          scale: {
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
          },
        }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-gray-600"
      >
        Carregando...
      </motion.p>
    </div>
  )
}

export default LoadingSpinner

