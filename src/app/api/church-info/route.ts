import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const churchInfo = await db.churchInfo.findMany({
      orderBy: { key: 'asc' },
    })

    // Convert to key-value object for easier frontend consumption
    const infoMap: Record<string, string> = {}
    for (const item of churchInfo) {
      infoMap[item.key] = item.value
    }

    return NextResponse.json(infoMap)
  } catch (error) {
    console.error('Error fetching church info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch church info' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: Record<string, string> = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a key-value object' },
        { status: 400 }
      )
    }

    const results = []

    for (const [key, value] of Object.entries(body)) {
      // Upsert each church info entry
      const result = await db.churchInfo.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
      results.push(result)
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error updating church info:', error)
    return NextResponse.json(
      { error: 'Failed to update church info' },
      { status: 500 }
    )
  }
}
