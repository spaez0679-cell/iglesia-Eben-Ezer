import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const youthMeeting = await db.youthMeeting.findUnique({
      where: { id },
      include: {
        photos: true,
      },
    })

    if (!youthMeeting) {
      return NextResponse.json(
        { error: 'Youth meeting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(youthMeeting)
  } catch (error) {
    console.error('Error fetching youth meeting:', error)
    return NextResponse.json(
      { error: 'Failed to fetch youth meeting' },
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
    const { title, description, date, videoUrl, quote, quoteRef, photos } = body

    const existing = await db.youthMeeting.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Youth meeting not found' },
        { status: 404 }
      )
    }

    // If photos are provided, delete old ones and create new ones
    if (photos !== undefined) {
      await db.youthPhoto.deleteMany({ where: { youthMeetingId: id } })
    }

    const youthMeeting = await db.youthMeeting.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        description: description !== undefined ? description : existing.description,
        date: date ? new Date(date) : existing.date,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
        quote: quote !== undefined ? quote : existing.quote,
        quoteRef: quoteRef !== undefined ? quoteRef : existing.quoteRef,
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

    return NextResponse.json(youthMeeting)
  } catch (error) {
    console.error('Error updating youth meeting:', error)
    return NextResponse.json(
      { error: 'Failed to update youth meeting' },
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

    const existing = await db.youthMeeting.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Youth meeting not found' },
        { status: 404 }
      )
    }

    // Photos are deleted via cascade
    await db.youthMeeting.delete({ where: { id } })

    return NextResponse.json({ message: 'Youth meeting deleted successfully' })
  } catch (error) {
    console.error('Error deleting youth meeting:', error)
    return NextResponse.json(
      { error: 'Failed to delete youth meeting' },
      { status: 500 }
    )
  }
}
