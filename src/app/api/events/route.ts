import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get('upcoming')

    const where = upcoming === 'true' ? { isUpcoming: true } : {}

    const events = await db.event.findMany({
      where,
      include: {
        photos: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, date, time, location, isUpcoming, photos } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      )
    }

    const event = await db.event.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        time: time || null,
        location: location || null,
        isUpcoming: isUpcoming ?? true,
        photos: photos
          ? {
              create: photos.map((p: { url: string; caption?: string }) => ({
                url: p.url,
                caption: p.caption || null,
              })),
            }
          : undefined,
      },
      include: {
        photos: true,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
