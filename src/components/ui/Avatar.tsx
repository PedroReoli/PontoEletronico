"use client"

import { useState } from "react"

interface AvatarProps {
  src?: string
  alt: string
  fallback?: string
  className?: string
}

export function Avatar({ src, alt, fallback, className = "" }: AvatarProps) {
  const [error, setError] = useState(false)
  const firstLetter = fallback || alt.charAt(0)

  return (
    <>
      {src && !error ? (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className={`rounded-full object-cover ${className}`}
          onError={() => setError(true)}
        />
      ) : (
        <div className={`flex items-center justify-center bg-blue-500 text-white rounded-full ${className}`}>
          {firstLetter}
        </div>
      )}
    </>
  )
}
