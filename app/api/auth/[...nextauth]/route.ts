import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Error boundary for debugging
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
