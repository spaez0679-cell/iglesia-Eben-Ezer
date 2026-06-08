import { NextRequest, NextResponse } from 'next/server'

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 

// Usamos los nombres en inglés porque bible-api.com los requiere así, incluso para la versión en español
const bibleBooksMap: Record<string, string> = {
  "Génesis": "genesis", "Éxodo": "exodus", "Levítico": "leviticus", "Números": "numbers",
  "Deuteronomio": "deuteronomy", "Josué": "joshua", "Jueces": "judges", "Rut": "ruth",
  "1 Samuel": "1 samuel", "2 Samuel": "2 samuel", "1 Reyes": "1 kings", "2 Reyes": "2 kings",
  "1 Crónicas": "1 chronicles", "2 Crónicas": "2 chronicles", "Esdras": "ezra", "Nehemías": "nehemiah",
  "Ester": "esther", "Job": "job", "Salmos": "psalms", "Proverbios": "proverbs",
  "Eclesiastés": "ecclesiastes", "Cantares": "song of solomon", "Isaías": "isaiah", "Jeremías": "jeremiah",
  "Lamentaciones": "lamentations", "Ezequiel": "ezekiel", "Daniel": "daniel", "Oseas": "hosea",
  "Joel": "joel", "Amós": "amos", "Abdías": "obadiah", "Jonás": "jonah", "Miqueas": "micah",
  "Nahúm": "nahum", "Habacuc": "habakkuk", "Sofonías": "zephaniah", "Hageo": "haggai",
  "Zacarías": "zechariah", "Malaquías": "malachi",
  "Mateo": "matthew", "Marcos": "mark", "Lucas": "luke", "Juan": "john",
  "Hechos": "acts", "Romanos": "romans", "1 Corintios": "1 corinthians", "2 Corintios": "2 corinthians",
  "Gálatas": "galatians", "Efesios": "ephesians", "Filipenses": "philippians", "Colosenses": "colossians",
  "1 Tesalonicenses": "1 thessalonians", "2 Tesalonicenses": "2 thessalonians",
  "1 Timoteo": "1 timothy", "2 Timoteo": "2 timothy",
  "Tito": "titus", "Filemón": "philemon", "Hebreos": "hebrews", "Santiago": "james",
  "1 Pedro": "1 peter", "2 Pedro": "2 peter", "1 Juan": "1 john", "2 Juan": "2 john",
  "3 Juan": "3 john", "Judas": "jude", "Apocalipsis": "revelation"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawBook = searchParams.get('book')
    const chapter = searchParams.get('chapter') || '1'
    const verse = searchParams.get('verse')

    if (!rawBook) {
      return NextResponse.json({ error: 'El parámetro "book" es requerido' }, { status: 400 })
    }

    const bookParam = decodeURIComponent(rawBook)
    const bookClean = bibleBooksMap[bookParam] || bookParam.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    
    const cacheKey = `${bookClean}:${chapter}:${verse || 'all'}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Volvemos a bible-api.com porque NO bloquea a Vercel. 
    // Usamos "valera" para español (Reina-Valera 1909)
    const passage = verse ? `${bookClean} ${chapter}:${verse}` : `${bookClean} ${chapter}`
    const apiURL = `https://bible-api.com/${encodeURIComponent(passage)}?translation=valera`

    const response = await fetch(apiURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API externa respondió con estado: ${response.status}`)
    }
    
    const externalData = await response.json()

    if (!externalData.verses || externalData.verses.length === 0) {
       throw new Error("La API no devolvió versículos para este pasaje")
    }

    const fullText = externalData.verses.map((v: any) => v.text).join(" ")

    // Mantenemos exactamente el mismo formato que tu frontend espera
    const formattedData = {
      reference: bookParam + " " + chapter + (verse ? ":" + verse : ""),
      verses: externalData.verses.map((v: any) => ({
        book_id: "valera",
        book_name: bookParam,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.trim()
      })),
      text: fullText,
      translation_id: "valera",
      translation_name: "Reina-Valera Antigua (Español)"
    }

    cache.set(cacheKey, { data: formattedData, timestamp: Date.now() })
    return NextResponse.json(formattedData)

  } catch (error) {
    console.error('Bible API error:', error)
    return NextResponse.json(
      { 
        error: 'Error interno al procesar el pasaje bíblico.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}  