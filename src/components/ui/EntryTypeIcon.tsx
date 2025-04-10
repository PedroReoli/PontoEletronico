import { Clock, LogIn, LogOut, Coffee, RotateCcw } from 'lucide-react'

interface EntryTypeIconProps {
  type: "CLOCK_IN" | "BREAK_START" | "BREAK_END" | "CLOCK_OUT"
  size?: number
  className?: string
}

export function EntryTypeIcon({ type, size = 16, className = "" }: EntryTypeIconProps) {
  switch (type) {
    case "CLOCK_IN":
      return <LogIn size={size} className={className} />
    case "BREAK_START":
      return <Coffee size={size} className={className} />
    case "BREAK_END":
      return <RotateCcw size={size} className={className} />
    case "CLOCK_OUT":
      return <LogOut size={size} className={className} />
    default:
      return <Clock size={size} className={className} />
  }
}
