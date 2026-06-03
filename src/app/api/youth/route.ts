import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const youthMeetings = await db.youthMeeting.findMany({
      include: {
        photos: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(youthMeetings)
  } catch (error) {
    console.error('Error fetching youth meetings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch youth meetings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, date, videoUrl, quote, quoteRef, photos } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      )
    }

    const youthMeeting = await db.youthMeeting.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        videoUrl: videoUrl || null,
        quote: quote || null,
        quoteRef: quoteRef || null,
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

    return NextResponse.json(youthMeeting, { status: 201 })
  } catch (error) {
    console.error('Error creating youth meeting:', error)
    return NextResponse.json(
      { error: 'Failed to create youth meeting' },
      { status: 500 }
    )
  }
}
