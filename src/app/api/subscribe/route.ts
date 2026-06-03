import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/subscribe — Subscribe to notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Se requiere un correo electrónico válido' },
        { status: 400 }
      )
    }

    const subscriber = await db.subscriber.upsert({
      where: { email: email.toLowerCase() },
      update: { name: name || undefined, isActive: true },
      create: { email: email.toLowerCase(), name: name || null },
    })

    return NextResponse.json({
      success: true,
      message: '¡Te has suscrito exitosamente!',
      subscriber: { id: subscriber.id, email: subscriber.email },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    if (msg.includes('Unique')) {
      return NextResponse.json({
        success: true,
        message: '¡Ya estás suscrito!',
      })
    }
    console.error('Error subscribing:', error)
    return NextResponse.json(
      { error: 'Error al suscribirse' },
      { status: 500 }
    )
  }
}

// GET /api/subscribe — Check if email is subscribed
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    if (!email) {
      return NextResponse.json({ subscribed: false })
    }

    const subscriber = await db.subscriber.findUnique({
      where: { email: email.toLowerCase() },
    })

    return NextResponse.json({
      subscribed: !!subscriber,
      active: subscriber?.isActive ?? false,
    })
  } catch (error) {
    return NextResponse.json({ subscribed: false })
  }
}

// DELETE /api/subscribe — Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    await db.subscriber.update({
      where: { email: email.toLowerCase() },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, message: 'Suscripción cancelada' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al cancelar' }, { status: 500 })
  }
}
