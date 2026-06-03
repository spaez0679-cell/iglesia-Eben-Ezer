import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// Helper: verify admin session via cookie
async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    // Token format: base64-encoded admin_id:timestamp
    if (!token) return false
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [adminId, timestamp] = decoded.split(':')
    if (!adminId) return false
    // Verify admin exists in database
    const admin = await db.admin.findUnique({ where: { id: adminId } })
    if (!admin) return false
    // Token expires after 24 hours
    const tokenTime = parseInt(timestamp)
    if (isNaN(tokenTime)) return false
    const age = Date.now() - tokenTime
    return age < 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

// GET /api/notifications — Get all notifications
export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    const unreadCount = notifications.filter((n) => !n.isRead).length

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    )
  }
}

// POST /api/notifications — Create a notification (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authorized = await isAdmin()
    if (!authorized) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere sesión de administrador.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, message, type } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Título y mensaje son requeridos' },
        { status: 400 }
      )
    }

    const notification = await db.notification.create({
      data: {
        title,
        message,
        type: type || 'general',
      },
    })

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Error al crear notificación' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications — Mark all as read
export async function PUT() {
  try {
    await db.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true, message: 'Todas marcadas como leídas' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar' },
      { status: 500 }
    )
  }
}
