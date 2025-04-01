"use client"

import AuthErrorCard from "~/components/auth/auth-error-card"
 
export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
      <AuthErrorCard />
    </div>
  )
}