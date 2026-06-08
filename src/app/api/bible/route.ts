import { NextRequest, NextResponse } from 'next/server'

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 

// BibleGateway prefiere los nombres de los libros directamente para su consulta GraphQL
const bibleBooksMap: Record<string, string> = {
  "Génesis": "Genesis", "Éxodo": "Exodus", "Levítico": "Leviticus", "Números": "Numbers",
  "Deuteronomio": "Deuteronomy", "Josué": "Joshua", "Jueces": "Judges", "Rut": "Ruth",
  "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel", "1 Reyes": "1 Reyes", "2 Reyes": "2 Reyes",
  "1 Crónicas": "1 Chronicles", "2 Crónicas": "2 Chronicles", "Esdras": "Ezra", "Nehemías": "Nehemiah",
  "Ester": "Esther", "Job": "Job", "Salmos": "Psalms", "Proverbios": "Proverbs",
  "Eclesiastés": "Ecclesiastes", "Cantares": "Song of Solomon", "Isaías": "Isaiah", "Jeremías": "Jeremiah",
  "Lamentaciones": "Lamentations", "Ezequiel": "Ezekiel", "Daniel": "Daniel", "Oseas": "Hosea",
  "Joel": "Joel", "Amós": "Amos", "Abdías": "Obadiah", "Jonás": "Jonah", "Miqueas": "Micah",
  "Nahúm": "Nahum", "Habacuc": "Habakkuk", "Sofonías": "Zephaniah", "Hageo": "Haggai",
  "Zacarías": "Zechariah", "Malaquías": "Malachi",
  "Mateo": "Matthew", "Marcos": "Mark", "Lucas": "Luke", "Juan": "John",
  "Hechos": "Acts", "Romanos": "Romans", "1 Corintios": "1 Corinthians", "2 Corintios": "2 Corinthians",
  "Gálatas": "Galatians", "Efesios": "Ephesians", "Filipenses": "Philippians", "Colosenses": "Colossians",
  "1 Tesalonicenses": "1 Thessalonians", "2 Tesalonicenses": "2 Thessalonians",
  "1 Timoteo": "1 Timothy", "2 Timoteo": "2 Timothy",
  "Tito": "Titus", "Filemón": "Philemon", "Hebreos": "Hebrews", "Santiago": "James",
  "1 Pedro": "1 Peter", "2 Pedro": "2 Peter", "1 Juan": "1 John", "2 Juan": "2 John",
  "3 Juan": "3 John", "Judas": "Jude", "Apocalipsis": "Revelation"
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
    // Buscamos el nombre del libro para la API (usamos fallback por si mandan el nombre directo)
    const bookQueryName = bibleBooksMap[bookParam] || bookParam
    
    const cacheKey = `${bookQueryName}:${chapter}:${verse || 'all'}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // 1. URL de la API GraphQL corregida
    const apiURL = 'https://www.biblegateway.com/graphql'

    // 2. Construimos la query exacta que requiere BibleGateway
    const graphqlQuery = {
      query: `
        query PassageQuery($query: String!, $version: String!) {
          passage(query: $query, version: $version) {
            content
            title
          }
        }
      `,
      variables: {
        query: `${bookQueryName} ${chapter}`,
        version: 'RVR1960'
      }
    }

    // 3. Hacemos la solicitud POST simulando ser un navegador para evitar bloqueos
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify(graphqlQuery)
    })

    if (!response.ok) {
      throw new Error(`BibleGateway respondió con estado: ${response.status}`)
    }
    
    const externalData = await response.json()
    const htmlContent = externalData?.data?.passage?.content

    if (!htmlContent) {
       throw new Error("La API no devolvió contenido para este pasaje")
    }

    // 4. Procesamos el HTML para extraer y separar los versículos limpiamente
    let versesArray: Array<{ verse: number; text: string }> = []
    
    // Expresión regular para buscar los bloques de versículos basados en las clases HTML de BibleGateway
    const textWithoutNotes = htmlContent.replace(/<span class="chapternum">.*?<\/span>/g, '') // Quita número de capítulo grande
                                        .replace(/<sup class="crossreference".*?<\/sup>/g, '') // Quita referencias cruzadas
                                        .replace(/<sup class="footnote".*?<\/sup>/g, '') // Quita notas al pie
    
    // Captura patrones comunes de números de versículos estructurados: <span class="versenumber">X </span>Texto
    const verseRegex = /<span class="versenumber">(\d+).*?<\/span>(.*?)(?=<span class="versenumber">|$)/g
    let match;
    
    while ((match = verseRegex.exec(textWithoutNotes)) !== null) {
      const vNum = parseInt(match[1], 10)
      
      // Línea 101 corregida internamente para evitar bucles o textos vacíos:
    const vText = match[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

      if (vText) {
        versesArray.push({ verse: vNum, text: vText })
      }
    }

    // Si la expresión regular falla por cambios de diseño, extraemos todo el texto plano como versículo único
    if (versesArray.length === 0) {
      const cleanText = textWithoutNotes.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      versesArray.push({ verse: 1, text: cleanText })
    }

    // 5. Si el usuario pide un versículo específico, lo filtramos
    if (verse) {
      versesArray = versesArray.filter((v) => String(v.verse) === verse)
    }

    const fullText = versesArray.map((v) => v.text).join(" ")

    // 6. Mantenemos exactamente tu misma interfaz de respuesta original
    const formattedData = {
      reference: bookParam + " " + chapter + (verse ? ":" + verse : ""),
      verses: versesArray.map((v) => ({
        book_id: "RVR60",
        book_name: bookParam,
        chapter: Number(chapter),
        verse: v.verse,
        text: v.text
      })),
      text: fullText,
      translation_id: "rvr1960",
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
