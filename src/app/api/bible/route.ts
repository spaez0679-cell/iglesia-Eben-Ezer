import { NextRequest, NextResponse } from 'next/server'

// Cache en memoria por 10 minutos para no saturar la API externa
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let book = searchParams.get('book')
    const chapter = searchParams.get('chapter') || '1'
    const verse = searchParams.get('verse')

    if (!book) {
      return NextResponse.json({ error: 'El parámetro "book" es requerido' }, { status: 400 })
    }

    // Limpiamos acentos porque las APIs externas suelen fallar con ellos (ej: Génesis -> Genesis)
    const bookClean = book.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    
    // Armamos la URL para la API externa gratuita (bible-api.com) usando la versión Reina Valera
    const cacheKey = `${bookClean}:${chapter}:${verse || 'all'}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Consultamos la API externa
    let url = `https://bible-api.com{bookClean}+${chapter}?translation=rv1909`
    if (verse) {
      url = `https://bible-api.com{bookClean}+${chapter}:${verse}?translation=rv1909`
    }

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error('No se pudo obtener el pasaje de la API externa')
    }

    const externalData = await res.json()

    // Adaptamos el formato de respuesta para que tu diseño web actual no se rompa
    const formattedData = {
      reference: externalData.reference,
      verses: externalData.verses.map((v: any) => ({
        book_id: externalData.translation_id,
        book_name: book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.trim()
      })),
      text: externalData.text,
      translation_id: 'rv1909',
      translation_name: 'Reina-Valera (Antigua)'
    }

    cache.set(cacheKey, { data: formattedData, timestamp: Date.now() })
    return NextResponse.json(formattedData)

  } catch (error) {
    console.error('Bible API error:', error)
    return NextResponse.json(
      { error: 'Error al obtener el pasaje bíblico desde la API externa.' },
      { status: 500 }
    )
  }
}
