import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null })
  }

  // Double check if user is still active in database
  const user = await prisma.user.findUnique({
    where: { id: session.id }
  })

  if (!user || !user.isActive) {
    // Session is invalid or suspended
    const response = NextResponse.json({ user: null })
    response.cookies.delete('session')
    return response
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    }
  })
}
