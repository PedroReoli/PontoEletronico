import type { ReactNode } from "react"

interface SummaryItemProps {
  icon: ReactNode
  label: string
  value: string
  iconColor?: string
}

export function SummaryItem({ icon, label, value, iconColor = "text-blue-500" }: SummaryItemProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className={`flex-shrink-0 p-1.5 rounded-full bg-gray-100 ${iconColor}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  )
}
