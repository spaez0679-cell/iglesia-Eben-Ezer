import { NextRequest, NextResponse } from 'next/server'

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 

// Usamos los NÚMEROS de los libros porque api.getbible.net los requiere así
const bibleBooksMap: Record<string, string> = {
  "Génesis": "1", "Éxodo": "2", "Levítico": "3", "Números": "4",
  "Deuteronomio": "5", "Josué": "6", "Jueces": "7", "Rut": "8",
  "1 Samuel": "9", "2 Samuel": "10", "1 Reyes": "11", "2 Reyes": "12",
  "1 Crónicas": "13", "2 Crónicas": "14", "Esdras": "15", "Nehemías": "16",
  "Ester": "17", "Job": "18", "Salmos": "19", "Proverbios": "20",
  "Eclesiastés": "21", "Cantares": "22", "Isaías": "23", "Jeremías": "24",
  "Lamentaciones": "25", "Ezequiel": "26", "Daniel": "27", "Oseas": "28",
  "Joel": "29", "Amós": "30", "Abdías": "31", "Jonás": "32", "Miqueas": "33",
  "Nahúm": "34", "Habacuc": "35", "Sofonías": "36", "Hageo": "37",
  "Zacarías": "38", "Malaquías": "39",
  "Mateo": "40", "Marcos": "41", "Lucas": "42", "Juan": "43",
  "Hechos": "44", "Romanos": "45", "1 Corintios": "46", "2 Corintios": "47",
  "Gálatas": "48", "Efesios": "49", "Filipenses": "50", "Colosenses": "51",
  "1 Tesalonicenses": "52", "2 Tesalonicenses": "53",
  "1 Timoteo": "54", "2 Timoteo": "55",
  "Tito": "56", "Filemón": "57", "Hebreos": "58", "Santiago": "59",
  "1 Pedro": "60", "2 Pedro": "61", "1 Juan": "62", "2 Juan": "63",
  "3 Juan": "64", "Judas": "65", "Apocalipsis": "66"
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
    const bookNumber = bibleBooksMap[bookParam]
    
    if (!bookNumber) {
       return NextResponse.json({ error: 'Libro no encontrado' }, { status: 400 })
    }
    
    const cacheKey = `${bookNumber}:${chapter}:${verse || 'all'}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // API getbible.net - RVA es Reina Valera Antigua. Le pasamos el NÚMERO del libro
    const apiURL = `https://api.getbible.net/v2/RVA60/${bookNumber}/${chapter}.json`

    const response = await fetch(apiURL, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API externa respondió con estado: ${response.status}`)
    }
    
    const externalData = await response.json()

    // La API de getbible guarda los versículos dentro de esta ruta
    let versesArray = []
    if (externalData.book && externalData.book[0] && externalData.book[0].chapters && externalData.book[0].chapters[0]) {
        versesArray = externalData.book[0].chapters[0].verses
    }

    if (versesArray.length === 0) {
       throw new Error("La API no devolvió versículos para este pasaje")
    }

    // Si el usuario pide un versículo específico, lo filtramos
    if (verse) {
      versesArray = versesArray.filter((v: any) => String(v.verse) === verse)
    }

    const fullText = versesArray.map((v: any) => v.text).join(" ")

    // Mantenemos exactamente el mismo formato que tu frontend espera
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
      translation_name: "Reina-Valera 1960 (Español)"
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