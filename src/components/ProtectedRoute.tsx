"use client"

import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import LoadingSpinner from "./LoadingSpinner"

interface ProtectedRouteProps {
  children: ReactNode
  roles?: Array<"EMPLOYEE" | "MANAGER" | "ADMIN">
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

export default ProtectedRoute

