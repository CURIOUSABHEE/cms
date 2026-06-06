import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { hashPassword, signToken } from '@/app/lib/auth'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: hashed,
        role: 'CUSTOMER',
      }
    })

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role })

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    }, { status: 201 })

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
