import type React from "react"
import "../../styles/components/avatar.css"

export interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  shape?: "circle" | "square"
  status?: "online" | "offline" | "busy" | "away" | "none"
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  name,
  size = "md",
  shape = "circle",
  status = "none",
  className = "",
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const statusClass = status !== "none" ? `avatar-status-${status}` : ""

  return (
    <div className={`avatar avatar-${size} avatar-${shape} ${className}`}>
      {src ? (
        <img src={src || "/placeholder.svg"} alt={alt} className="avatar-image" />
      ) : name ? (
        <div className="avatar-initials">{getInitials(name)}</div>
      ) : (
        <div className="avatar-placeholder">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      )}
      {status !== "none" && <span className={`avatar-status ${statusClass}`}></span>}
    </div>
  )
}

export default Avatar
