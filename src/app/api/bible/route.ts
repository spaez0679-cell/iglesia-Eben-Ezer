import { NextRequest, NextResponse } from 'next/server'

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 

const bibleBooksMap: Record<string, string> = {
  "Génesis": "genesis", "Éxodo": "exodus", "Levítico": "leviticus", "Números": "numbers",
  "Deuteronomio": "deuteronomy", "Josué": "joshua", "Jueces": "judges", "Rut": "ruth",
  "1 Samuel": "1 samuel", "2 Samuel": "2 samuel", "1 Reyes": "1 reyes", "2 Reyes": "2 reyes",
  "1 Crónicas": "1 chronicles", "2 Crónicas": "2 chronicles", "Esdras": "ezra", "Nehemías": "nehemiah",
  "Esther": "esther", "Job": "job", "Salmos": "psalms", "Proverbios": "proverbs",
  "Eclesiastés": "ecclesiastes", "Cantares": "song of solomon", "Isaías": "isaiah", "Jeremías": "jeremiah",
  "Lamentaciones": "lamentations", "Ezequiel": "ezekiel", "Daniel": "daniel", "Oseas": "hosea",
  "Joel": "joel", "Amós": "amos", "Abdías": "obadiah", "Jonás": "jonah", "Miqueas": "micah",
  "Nahúm": "nahum", "Habacuc": "habakkuk", "Sofonías": "zephaniah", "Hageo": "haggai",
  "Zacarías": "zechariah", "Malaquías": "malachi",
  "Mateo": "matthew", "Marcos": "mark", "Lucas": "luke", "Juan": "john",
  "Hechos": "acts", "Romanos": "romans", "1 Corintios": "1 corinthians", "2 Corintios": "2 corinthians",
  "Gálatas": "galatians", "Efesios": "ephesians", "Filipenses": "philippians", "Colosenses": "colossians",
  "1 Tesalonicenses": "1 Any", "2 Tesalonicenses": "2 Any", "1 Timoteo": "1 timothy", "2 Timoteo": "2 timothy",
  "Tito": "titus", "Filemón": "philemon", "Hebreos": "hebrews", "Santiago": "james",
  "1 Pedro": "1 peter", "2 Pedro": "2 peter", "1 Juan": "1 john", "2 Juan": "2 john",
  "3 Juan": "3 john", "Judas": "jude", "Apocalipsis": "revelation"
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

    const bookClean = bibleBooksMap[bookParam] || bookParam.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    
    const cacheKey = `${bookClean}:${chapter}:${verse || 'all'}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Unimos los textos usando el símbolo + común de programación para evitar fallos de lectura literales
    let passage = bookClean + "+" + chapter
    if (verse) {
      passage = bookClean + "+" + chapter + ":" + verse
    }
    
    const urlCompleta = "https://bible-api.com" + passage + "?translation=rv1909"

    const res = await fetch(urlCompleta)
    if (!res.ok) {
      throw new Error("Error en API externa: " + res.status)
    }

    const externalData = await res.json()

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
      translation_id: "rv1909",
      translation_name: "Reina-Valera (Antigua)"
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
