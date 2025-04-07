"use client"

import type { ReactNode } from "react"
import { downloadCSV } from "../utils/csvExport"

interface ExportButtonProps {
  data: any[]
  filename: string
  headers?: Record<string, string>
  children: ReactNode
  className?: string
}

function ExportButton({ data, filename, headers, children, className }: ExportButtonProps) {
  const handleExport = () => {
    // Adicionar extensão .csv se não estiver presente
    const finalFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`
    downloadCSV(data, finalFilename, headers)
  }

  return (
    <button onClick={handleExport} className={className || "btn-secondary"} disabled={!data || data.length === 0}>
      {children}
    </button>
  )
}

export default ExportButton

