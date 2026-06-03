import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// In-memory cache for frequently accessed chapters
const cache = new Map<string, { data: BibleApiResponse; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

interface BibleApiResponse {
  reference: string
  verses: Array<{
    book_id: string
    book_name: string
    chapter: number
    verse: number
    text: string
  }>
  text: string
  translation_id: string
  translation_name: string
}

async function fetchBibleFromDB(
  book: string,
  chapter: number,
  verse?: number
): Promise<BibleApiResponse> {
  const cacheKey = `${book}:${chapter}:${verse || 'all'}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  // Find the book
  const bookRecord = await prisma.bibleBook.findUnique({
    where: { name: book },
  })

  if (!bookRecord) {
    throw new Error(`Libro no encontrado: "${book}"`)
  }

  if (chapter < 1 || chapter > bookRecord.chapters) {
    throw new Error(
      `Capítulo inválido. ${book} tiene ${bookRecord.chapters} capítulos.`
    )
  }

  // Build query
  const where: Record<string, unknown> = {
    bookName: book,
    chapter,
  }

  if (verse !== undefined) {
    where.verse = verse
  }

  const verses = await prisma.bibleVerse.findMany({
    where,
    orderBy: { verse: 'asc' },
  })

  if (verses.length === 0) {
    throw new Error('No se encontraron versículos para este pasaje.')
  }

  const result: BibleApiResponse = {
    reference: verse
      ? `${bookRecord.abbr} ${chapter}:${verse}`
      : `${bookRecord.abbr} ${chapter}`,
    verses: verses.map((v) => ({
      book_id: bookRecord.abbr,
      book_name: book,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
    })),
    text: verses.map((v) => v.text).join('\n'),
    translation_id: 'rv1909',
    translation_name: 'Reina-Valera (Antigua)',
  }

  cache.set(cacheKey, { data: result, timestamp: Date.now() })
  return result
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const book = searchParams.get('book')
    const chapter = parseInt(searchParams.get('chapter') || '1', 10)
    const verse = searchParams.get('verse')
      ? parseInt(searchParams.get('verse')!, 10)
      : undefined

    if (!book) {
      return NextResponse.json(
        { error: 'El parámetro "book" es requerido' },
        { status: 400 }
      )
    }

    if (chapter < 1 || chapter > 150) {
      return NextResponse.json(
        { error: 'El capítulo debe estar entre 1 y 150' },
        { status: 400 }
      )
    }

    const data = await fetchBibleFromDB(book, chapter, verse)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Bible API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al obtener el pasaje bíblico.',
      },
      { status: 500 }
    )
  }
}
