import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await db.event.findUnique({
      where: { id },
      include: {
        photos: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, date, time, location, isUpcoming, photos } = body

    const existing = await db.event.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // If photos are provided, delete old ones and create new ones
    if (photos !== undefined) {
      await db.eventPhoto.deleteMany({ where: { eventId: id } })
    }

    const event = await db.event.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        description: description !== undefined ? description : existing.description,
        date: date ? new Date(date) : existing.date,
        time: time !== undefined ? time : existing.time,
        location: location !== undefined ? location : existing.location,
        isUpcoming: isUpcoming !== undefined ? isUpcoming : existing.isUpcoming,
        ...(photos !== undefined && {
          photos: {
            create: photos.map((p: { url: string; caption?: string }) => ({
              url: p.url,
              caption: p.caption || null,
            })),
          },
        }),
      },
      include: {
        photos: true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
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

    const existing = await db.event.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Photos are deleted via cascade
    await db.event.delete({ where: { id } })

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
