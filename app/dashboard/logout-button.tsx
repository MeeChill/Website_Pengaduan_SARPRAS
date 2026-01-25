'use client'

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full text-left p-2 rounded hover:bg-red-50 text-red-600 font-medium"
    >
      Logout
    </button>
  )
}
