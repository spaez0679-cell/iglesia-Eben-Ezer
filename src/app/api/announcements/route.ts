import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')

    const where = all === 'true' ? {} : { isActive: true }

    const announcements = await db.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, isActive } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content: content || null,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}
