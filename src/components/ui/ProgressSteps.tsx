"use client"

import React from "react"

import { motion } from "framer-motion"

interface ProgressStepsProps {
  steps: string[]
  currentStep: number
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="progress-steps">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div
            className={`progress-step ${
              index + 1 === currentStep ? "active" : index + 1 < currentStep ? "completed" : ""
            }`}
          >
            <div className="step-number">
              {index + 1 < currentStep ? (
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
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span className="step-label">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div className="progress-line">
              <motion.div
                className="progress-line-fill"
                initial={{ width: "0%" }}
                animate={{ width: currentStep > index + 1 ? "100%" : "0%" }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
