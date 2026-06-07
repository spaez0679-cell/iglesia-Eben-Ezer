import { NextRequest, NextResponse } from 'next/server'

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 

// Códigos de libros para la API de Bolls.life
const bibleBooksMap: Record<string, string> = {
  "Génesis": "Gen", "Éxodo": "Exod", "Levítico": "Lev", "Números": "Num",
  "Deuteronomio": "Deut", "Josué": "Josh", "Jueces": "Judg", "Rut": "Ruth",
  "1 Samuel": "1Sam", "2 Samuel": "2Sam", "1 Reyes": "1Kgs", "2 Reyes": "2Kgs",
  "1 Crónicas": "1Chr", "2 Crónicas": "2Chr", "Esdras": "Ezra", "Nehemías": "Neh",
  "Ester": "Esth", "Job": "Job", "Salmos": "Ps", "Proverbios": "Prov",
  "Eclesiastés": "Eccl", "Cantares": "Song", "Isaías": "Isa", "Jeremías": "Jer",
  "Lamentaciones": "Lam", "Ezequiel": "Ezek", "Daniel": "Dan", "Oseas": "Hos",
  "Joel": "Joel", "Amós": "Amos", "Abdías": "Obad", "Jonás": "Jonah", "Miqueas": "Mic",
  "Nahúm": "Nah", "Habacuc": "Hab", "Sofonías": "Zeph", "Hageo": "Hag",
  "Zacarías": "Zech", "Malaquías": "Mal",
  "Mateo": "Matt", "Marcos": "Mark", "Lucas": "Luke", "Juan": "John",
  "Hechos": "Acts", "Romanos": "Rom", "1 Corintios": "1Cor", "2 Corintios": "2Cor",
  "Gálatas": "Gal", "Efesios": "Eph", "Filipenses": "Phil", "Colosenses": "Col",
  "1 Tesalonicenses": "1Thess", "2 Tesalonicenses": "2Thess",
  "1 Timoteo": "1Tim", "2 Timoteo": "2Tim",
  "Tito": "Titus", "Filemón": "Phlm", "Hebreos": "Heb", "Santiago": "James",
  "1 Pedro": "1Pet", "2 Pedro": "2Pet", "1 Juan": "1John", "2 Juan": "2John",
  "3 Juan": "3John", "Judas": "Jude", "Apocalipsis": "Rev"
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

    // Usamos Bolls.life - RVA es Reina Valera Antigua. Si prefieres la 1960, cambia RVA por RVR60
    const apiURL = `https://bolls.life/get-text/RVA/${bookClean}/${chapter}/`

    const response = await fetch(apiURL)
    if (!response.ok) {
      throw new Error(`API externa respondió con estado: ${response.status}`)
    }
    
    const externalData = await response.json()

    if (!Array.isArray(externalData) || externalData.length === 0) {
       throw new Error("La API no devolvió versículos para este pasaje")
    }

    // Si el usuario pide un versículo específico, lo filtramos
    let versesArray = externalData
    if (verse) {
      versesArray = externalData.filter((v: any) => String(v.verse) === verse)
    }

    const fullText = versesArray.map((v: any) => v.text).join(" ")

    // Mantenemos exactamente el mismo formato de salida para que tu frontend no se rompa
    const formattedData = {
      reference: bookParam + " " + chapter + (verse ? ":" + verse : ""),
      verses: versesArray.map((v: any) => ({
        book_id: "rva",
        book_name: bookParam,
        chapter: Number(chapter),
        verse: v.verse,
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