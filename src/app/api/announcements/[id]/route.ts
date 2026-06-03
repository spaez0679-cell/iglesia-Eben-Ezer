import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, content, isActive } = body

    const existing = await db.announcement.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    const announcement = await db.announcement.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        content: content !== undefined ? content : existing.content,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.announcement.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    await db.announcement.delete({ where: { id } })

    return NextResponse.json({ message: 'Announcement deleted successfully' })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}
