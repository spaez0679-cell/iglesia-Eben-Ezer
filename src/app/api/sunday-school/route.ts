import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const sundaySchools = await db.sundaySchool.findMany({
      include: {
        photos: true,
        participants: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(sundaySchools)
  } catch (error) {
    console.error('Error fetching Sunday school entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Sunday school entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, date, teacher, videoUrl, photos, participants } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      )
    }

    const sundaySchool = await db.sundaySchool.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        teacher: teacher || null,
        videoUrl: videoUrl || null,
        photos: photos
          ? {
              create: photos.map((p: { url: string; caption?: string }) => ({
                url: p.url,
                caption: p.caption || null,
              })),
            }
          : undefined,
        participants: participants
          ? {
              create: participants.map((p: { name: string }) => ({
                name: p.name,
              })),
            }
          : undefined,
      },
      include: {
        photos: true,
        participants: true,
      },
    })

    return NextResponse.json(sundaySchool, { status: 201 })
  } catch (error) {
    console.error('Error creating Sunday school entry:', error)
    return NextResponse.json(
      { error: 'Failed to create Sunday school entry' },
      { status: 500 }
    )
  }
}
