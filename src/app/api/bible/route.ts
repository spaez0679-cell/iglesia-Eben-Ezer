import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 

const bibleBooksMap: Record<string, string> = {
  "Génesis": "genesis", "Éxodo": "exodus", "Levítico": "leviticus", "Números": "numbers",
  "Deuteronomio": "deuteronomy", "Josué": "joshua", "Jueces": "judges", "Rut": "ruth",
  "1 Samuel": "1 samuel", "2 Samuel": "2 samuel", "1 Reyes": "1 kings", "2 Reyes": "2 kings", // Corregido: kings en lugar de reyes
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
  "1 Tesalonicenses": "1 thessalonians", "2 Tesalonicenses": "2 thessalonians", // <-- CORREGIDO AQUÍ
  "1 Timoteo": "1 timothy", "2 Timoteo": "2 timothy",
  "Tito": "titus", "Filemón": "philemon", "Hebreos": "hebrews", "Santiago": "james",
  "1 Pedro": "1 peter", "2 Pedro": "2 peter", "1 Juan": "1 john", "2 Juan": "2 john",
  "3 Juan": "3 john", "Judas": "jude", "Apocalipsis": "revelation"
}

function secureGetRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(new Error("Error al procesar JSON de la API"))
          }
        } else {
          reject(new Error(`API respondió con estado: ${res.statusCode}`))
        }
      })
    }).on('error', (err) => {
      reject(err)
    })
  })
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

    const apiURL = new URL("https://bible-api.com")
    const passage = verse ? `${bookClean} ${chapter}:${verse}` : `${bookClean} ${chapter}`
    apiURL.pathname = "/" + encodeURIComponent(passage)
    
    // CAMBIO PRINCIPAL: Cambiamos "web" (inglés) por "valera" (español)
    apiURL.searchParams.set("translation", "valera")

    const externalData = await secureGetRequest(apiURL.toString())

    const formattedData = {
      reference: bookParam + " " + chapter + (verse ? ":" + verse : ""),
      verses: externalData.verses.map((v: any) => ({
        book_id: externalData.translation_id,
        book_name: bookParam,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.trim()
      })),
      text: externalData.text,
      translation_id: "valera", // Actualizado
      translation_name: "Reina-Valera 1909 (Español)" // Nombre real de la traducción
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