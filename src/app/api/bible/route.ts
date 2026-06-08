import { NextRequest, NextResponse } from 'next/server'

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 

// Códigos de libros para la API de helloao.org (usan guion bajo)
const bibleBooksMap: Record<string, string> = {
  "Génesis": "genesis", "Éxodo": "exodus", "Levítico": "leviticus", "Números": "numbers",
  "Deuteronomio": "deuteronomy", "Josué": "joshua", "Jueces": "judges", "Rut": "ruth",
  "1 Samuel": "1_samuel", "2 Samuel": "2_samuel", "1 Reyes": "1_kings", "2 Reyes": "2_kings",
  "1 Crónicas": "1_chronicles", "2 Crónicas": "2_chronicles", "Esdras": "ezra", "Nehemías": "nehemiah",
  "Ester": "esther", "Job": "job", "Salmos": "psalms", "Proverbios": "proverbs",
  "Eclesiastés": "ecclesiastes", "Cantares": "song_of_solomon", "Isaías": "isaiah", "Jeremías": "jeremiah",
  "Lamentaciones": "lamentations", "Ezequiel": "ezekiel", "Daniel": "daniel", "Oseas": "hosea",
  "Joel": "joel", "Amós": "amos", "Abdías": "obadiah", "Jonás": "jonah", "Miqueas": "micah",
  "Nahúm": "nahum", "Habacuc": "habakkuk", "Sofonías": "zephaniah", "Hageo": "haggai",
  "Zacarías": "zechariah", "Malaquías": "malachi",
  "Mateo": "matthew", "Marcos": "mark", "Lucas": "luke", "Juan": "john",
  "Hechos": "acts", "Romanos": "romans", "1 Corintios": "1_corinthians", "2 Corintios": "2_corinthians",
  "Gálatas": "galatians", "Efesios": "ephesians", "Filipenses": "philippians", "Colosenses": "colossians",
  "1 Tesalonicenses": "1_thessalonians", "2 Tesalonicenses": "2_thessalonians",
  "1 Timoteo": "1_timothy", "2 Timoteo": "2_timothy",
  "Tito": "titus", "Filemón": "philemon", "Hebreos": "hebrews", "Santiago": "james",
  "1 Pedro": "1_peter", "2 Pedro": "2_peter", "1 Juan": "1_john", "2 Juan": "2_john",
  "3 Juan": "3_john", "Judas": "jude", "Apocalipsis": "revelation"
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

    // NUEVA API: bible.helloao.org - Tiene la RVA y no bloquea a Vercel
    const apiURL = `https://bible.helloao.org/RVA/${bookClean}/${chapter}.json`

    const response = await fetch(apiURL, {
      headers: {
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

    // Si el usuario pide un versículo específico, lo filtramos
    let versesArray = externalData.verses
    if (verse) {
      versesArray = externalData.verses.filter((v: any) => String(v.number) === verse)
    }

    const fullText = versesArray.map((v: any) => v.text).join(" ")

    // Mantenemos exactamente el mismo formato que tu frontend espera
    const formattedData = {
      reference: bookParam + " " + chapter + (verse ? ":" + verse : ""),
      verses: versesArray.map((v: any) => ({
        book_id: "rva",
        book_name: bookParam,
        chapter: Number(chapter),
        verse: v.number,
        text: v.text.trim()
      })),
      text: fullText,
      translation_id: "rva",
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