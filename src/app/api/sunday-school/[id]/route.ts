import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sundaySchool = await db.sundaySchool.findUnique({
      where: { id },
      include: {
        photos: true,
        participants: true,
      },
    })

    if (!sundaySchool) {
      return NextResponse.json(
        { error: 'Sunday school entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(sundaySchool)
  } catch (error) {
    console.error('Error fetching Sunday school entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Sunday school entry' },
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
    const { title, description, date, teacher, videoUrl, photos, participants } = body

    const existing = await db.sundaySchool.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Sunday school entry not found' },
        { status: 404 }
      )
    }

    // If photos are provided, delete old ones and create new ones
    if (photos !== undefined) {
      await db.sundaySchoolPhoto.deleteMany({ where: { sundaySchoolId: id } })
    }

    // If participants are provided, delete old ones and create new ones
    if (participants !== undefined) {
      await db.sundaySchoolParticipant.deleteMany({ where: { sundaySchoolId: id } })
    }

    const sundaySchool = await db.sundaySchool.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        description: description !== undefined ? description : existing.description,
        date: date ? new Date(date) : existing.date,
        teacher: teacher !== undefined ? teacher : existing.teacher,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
        ...(photos !== undefined && {
          photos: {
            create: photos.map((p: { url: string; caption?: string }) => ({
              url: p.url,
              caption: p.caption || null,
            })),
          },
        }),
        ...(participants !== undefined && {
          participants: {
            create: participants.map((p: { name: string }) => ({
              name: p.name,
            })),
          },
        }),
      },
      include: {
        photos: true,
        participants: true,
      },
    })

    return NextResponse.json(sundaySchool)
  } catch (error) {
    console.error('Error updating Sunday school entry:', error)
    return NextResponse.json(
      { error: 'Failed to update Sunday school entry' },
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

    const existing = await db.sundaySchool.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Sunday school entry not found' },
        { status: 404 }
      )
    }

    // Photos and participants are deleted via cascade
    await db.sundaySchool.delete({ where: { id } })

    return NextResponse.json({ message: 'Sunday school entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting Sunday school entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete Sunday school entry' },
      { status: 500 }
    )
  }
}
