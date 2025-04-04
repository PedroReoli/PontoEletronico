"use client"

import { useAuth } from "@/hooks/useAuth"
import UserProfile from "@/components/users/UserProfile"

const ProfilePage = () => {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-heading-1 mb-6">Meu Perfil</h1>

      <UserProfile canEdit={true} />
    </div>
  )
}

export default ProfilePage

