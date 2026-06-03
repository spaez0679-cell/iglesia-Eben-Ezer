import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { compare } from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const admin = await db.admin.findUnique({
      where: { username },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isPasswordValid = await compare(password, admin.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session token: base64-encoded admin_id:timestamp
    const tokenPayload = `${admin.id}:${Date.now()}`
    const token = Buffer.from(tokenPayload).toString('base64')

    const response = NextResponse.json({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    })

    // Set httpOnly cookie for server-side auth verification
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
