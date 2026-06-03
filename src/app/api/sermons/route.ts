import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where = type ? { type } : {}

    const sermons = await db.sermon.findMany({
      where,
      include: {
        photos: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(sermons)
  } catch (error) {
    console.error('Error fetching sermons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sermons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, preacher, date, videoUrl, type, photos } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      )
    }

    const sermon = await db.sermon.create({
      data: {
        title,
        description: description || null,
        preacher: preacher || null,
        date: new Date(date),
        videoUrl: videoUrl || null,
        type: type || 'domingo',
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

    return NextResponse.json(sermon, { status: 201 })
  } catch (error) {
    console.error('Error creating sermon:', error)
    return NextResponse.json(
      { error: 'Failed to create sermon' },
      { status: 500 }
    )
  }
}
