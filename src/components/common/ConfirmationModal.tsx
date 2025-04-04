"use client"

import type { ReactNode } from "react"

interface ConfirmationModalProps {
  title: string
  message: string | ReactNode
  confirmButtonText: string
  cancelButtonText: string
  confirmButtonClass?: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmationModal = ({
  title,
  message,
  confirmButtonText,
  cancelButtonText,
  confirmButtonClass = "bg-primary hover:bg-primary-dark",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-heading-3 mb-4">{title}</h3>

          <div className="mb-6">{typeof message === "string" ? <p>{message}</p> : message}</div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {cancelButtonText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-md transition-colors ${confirmButtonClass}`}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal

