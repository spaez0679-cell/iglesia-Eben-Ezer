import { NextRequest, NextResponse } from 'next/server'

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 

const bibleBooksMap: Record<string, string> = {
  "Génesis": "Genesis", "Éxodo": "Exodus", "Levítico": "Leviticus", "Números": "Numbers",
  "Deuteronomio": "Deuteronomy", "Josué": "Joshua", "Jueces": "Judges", "Rut": "Ruth",
  "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel", "1 Reyes": "1 Reyes", "2 Reyes": "2 Reyes",
  "1 Crónicas": "1 Chronicles", "2 Crónicas": "2 Chronicles", "Esdras": "Ezra", "Nehemías": "Nehemiah",
  "Esther": "Esther", "Job": "Job", "Salmos": "Psalms", "Proverbios": "Proverbs",
  "Eclesiastés": "Ecclesiastes", "Cantares": "Song of Solomon", "Isaías": "Isaiah", "Jeremías": "Jeremiah",
  "Lamentaciones": "Lamentations", "Ezequiel": "Ezekiel", "Daniel": "Daniel", "Oseas": "Hosea",
  "Joel": "Joel", "Amós": "Amos", "Abdías": "Obadiah", "Jonás": "Jonah", "Miqueas": "Micah",
  "Nahúm": "Nahum", "Habacuc": "Habakkuk", "Sofonías": "Zephaniah", "Hageo": "Haggai",
  "Zacarías": "Zechariah", "Malaquías": "Malachi",
  "Mateo": "Matthew", "Marcos": "Mark", "Lucas": "Luke", "Juan": "John",
  "Hechos": "Acts", "Romanos": "Romans", "1 Corintios": "1 Corinthians", "2 Corintios": "2 Corinthians",
  "Gálatas": "Galatians", "Efesios": "Ephesians", "Filipenses": "Philippians", "Colosenses": "Colossians",
  "1 Tesalonicenses": "1 Thessalonians", "2 Tesalonicenses": "2 Thessalonians", "1 Timoteo": "1 Timothy", "2 Timoteo": "2 Timothy",
  "Tito": "Tito", "Filemón": "Philemon", "Hebreos": "Hebrews", "Santiago": "James",
  "1 Pedro": "1 Peter", "2 Pedro": "2 Peter", "1 Juan": "1 John", "2 Juan": "2 John",
  "3 Juan": "3 John", "Judas": "Jude", "Apocalipsis": "Revelation"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookParam = searchParams.get('book')
    const chapter = searchParams.get('chapter') || '1'
    const verse = searchParams.get('verse')

    if (!bookParam) {
      return NextResponse.json({ error: 'El parámetro "book" es requerido' }, { status: 400 })
    }

    const bookClean = bibleBooksMap[bookParam] || bookParam.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    
    const cacheKey = `${bookClean}:${chapter}:${verse || 'all'}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Construcción limpia y segura de la URL usando la API nativa de JavaScript
    // Esto evita usar el "+" manual que rompía el fetch en Vercel
    const apiTargetUrl = new URL('https://bible-api.com')
    
    // El pasaje se construye usando un espacio normal (la API lo procesa bien si va en el path)
    const passage = verse ? `${bookClean} ${chapter}:${verse}` : `${bookClean} ${chapter}`
    apiTargetUrl.pathname = `/${passage}`
    apiTargetUrl.searchParams.set('translation', 'rv1909')

    // Hacemos el fetch pasándole la URL en string limpio
    const res = await fetch(apiTargetUrl.toString())
    if (!res.ok) {
      throw new Error(`Error en API externa: ${res.status}`)
    }

    const externalData = await res.json()

    const formattedData = {
      reference: `${bookParam} ${chapter}${verse ? ':' + verse : ''}`,
      verses: externalData.verses.map((v: any) => ({
        book_id: externalData.translation_id,
        book_name: bookParam,
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
      { error: 'Error interno al procesar el pasaje bíblico.' },
      { status: 500 }
    )
  }
}
