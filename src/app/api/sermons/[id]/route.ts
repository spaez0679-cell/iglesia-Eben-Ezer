import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sermon = await db.sermon.findUnique({
      where: { id },
      include: {
        photos: true,
      },
    })

    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(sermon)
  } catch (error) {
    console.error('Error fetching sermon:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sermon' },
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
    const { title, description, preacher, date, videoUrl, type, photos } = body

    const existing = await db.sermon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      )
    }

    // If photos are provided, delete old ones and create new ones
    if (photos !== undefined) {
      await db.sermonPhoto.deleteMany({ where: { sermonId: id } })
    }

    const sermon = await db.sermon.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        description: description !== undefined ? description : existing.description,
        preacher: preacher !== undefined ? preacher : existing.preacher,
        date: date ? new Date(date) : existing.date,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
        type: type ?? existing.type,
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

    return NextResponse.json(sermon)
  } catch (error) {
    console.error('Error updating sermon:', error)
    return NextResponse.json(
      { error: 'Failed to update sermon' },
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

    const existing = await db.sermon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      )
    }

    // Photos are deleted via cascade
    await db.sermon.delete({ where: { id } })

    return NextResponse.json({ message: 'Sermon deleted successfully' })
  } catch (error) {
    console.error('Error deleting sermon:', error)
    return NextResponse.json(
      { error: 'Failed to delete sermon' },
      { status: 500 }
    )
  }
}
