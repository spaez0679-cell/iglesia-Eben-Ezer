// Bible data helper for EBEN EZER church website
// All book names in Spanish

export const OLD_TESTAMENT_BOOKS = [
  'Génesis',
  'Éxodo',
  'Levítico',
  'Números',
  'Deuteronomio',
  'Josué',
  'Jueces',
  'Rut',
  '1 Samuel',
  '2 Samuel',
  '1 Reyes',
  '2 Reyes',
  '1 Crónicas',
  '2 Crónicas',
  'Esdras',
  'Nehemías',
  'Ester',
  'Job',
  'Salmos',
  'Proverbios',
  'Eclesiastés',
  'Cantares',
  'Isaías',
  'Jeremías',
  'Lamentaciones',
  'Ezequiel',
  'Daniel',
  'Oseas',
  'Joel',
  'Amós',
  'Abdías',
  'Jonás',
  'Miqueas',
  'Nahúm',
  'Habacuc',
  'Sofonías',
  'Hageo',
  'Zacarías',
  'Malaquías',
]

export const NEW_TESTAMENT_BOOKS = [
  'Mateo',
  'Marcos',
  'Lucas',
  'Juan',
  'Hechos',
  'Romanos',
  '1 Corintios',
  '2 Corintios',
  'Gálatas',
  'Efesios',
  'Filipenses',
  'Colosenses',
  '1 Tesalonicenses',
  '2 Tesalonicenses',
  '1 Timoteo',
  '2 Timoteo',
  'Tito',
  'Filemón',
  'Hebreos',
  'Santiago',
  '1 Pedro',
  '2 Pedro',
  '1 Juan',
  '2 Juan',
  '3 Juan',
  'Judas',
  'Apocalipsis',
]

export const ALL_BOOKS = [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS]

export const BOOK_ABBREVIATIONS: Record<string, string> = {
  'Génesis': 'Gén',
  'Exodo': 'Éx',
  'Éxodo': 'Éx',
  'Levitico': 'Lev',
  'Levítico': 'Lev',
  'Numeros': 'Núm',
  'Números': 'Núm',
  'Deuteronomio': 'Deut',
  'Josue': 'Jos',
  'Josué': 'Jos',
  'Jueces': 'Jue',
  'Rut': 'Rut',
  '1 Samuel': '1 Sam',
  '2 Samuel': '2 Sam',
  '1 Reyes': '1 Rey',
  '2 Reyes': '2 Rey',
  '1 Cronicas': '1 Crón',
  '1 Crónicas': '1 Crón',
  '2 Cronicas': '2 Crón',
  '2 Crónicas': '2 Crón',
  'Esdras': 'Esd',
  'Nehemias': 'Neh',
  'Nehemías': 'Neh',
  'Ester': 'Est',
  'Job': 'Job',
  'Salmos': 'Sal',
  'Proverbios': 'Prov',
  'Eclesiastes': 'Ecl',
  'Cantares': 'Cant',
  'Isaias': 'Isa',
  'Isaías': 'Isa',
  'Jeremias': 'Jer',
  'Jeremías': 'Jer',
  'Lamentaciones': 'Lam',
  'Ezequiel': 'Eze',
  'Daniel': 'Dan',
  'Oseas': 'Os',
  'Joel': 'Joel',
  'Amos': 'Amós',
  'Abdias': 'Abd',
  'Jonas': 'Jon',
  'Miqueas': 'Miq',
  'Naum': 'Nah',
  'Nahum': 'Nah',
  'Habacuc': 'Hab',
  'Sofonias': 'Sof',
  'Sofonías': 'Sof',
  'Hageo': 'Hag',
  'Zacarias': 'Zac',
  'Malaquias': 'Mal',
  'Malaquías': 'Mal',
  'Mateo': 'Mt',
  'Marcos': 'Mr',
  'Lucas': 'Lc',
  'Juan': 'Jn',
  'Hechos': 'Hch',
  'Romanos': 'Ro',
  '1 Corintios': '1 Co',
  '2 Corintios': '2 Co',
  'Galatas': 'Gál',
  'Gálatas': 'Gál',
  'Efesios': 'Ef',
  'Filipenses': 'Fil',
  'Colosenses': 'Col',
  '1 Tesalonicenses': '1 Ts',
  '2 Tesalonicenses': '2 Ts',
  '1 Timoteo': '1 Ti',
  '2 Timoteo': '2 Ti',
  'Tito': 'Tit',
  'Filemon': 'Flm',
  'Filemón': 'Flm',
  'Hebreos': 'Heb',
  'Santiago': 'Stg',
  '1 Pedro': '1 Pe',
  '2 Pedro': '2 Pe',
  '1 Juan': '1 Jn',
  '2 Juan': '2 Jn',
  '3 Juan': '3 Jn',
  'Judas': 'Jud',
  'Apocalipsis': 'Ap',
}

// Reverse lookup: abbreviation to full name
export const ABBREVIATION_TO_BOOK: Record<string, string> = Object.entries(
  BOOK_ABBREVIATIONS
).reduce<Record<string, string>>((acc, [book, abbr]) => {
  acc[abbr.toLowerCase()] = book
  return acc
}, {})

export interface BibleReference {
  book: string
  bookAbbr: string
  chapter: number
  verse?: number
  testament: 'Antiguo Testamento' | 'Nuevo Testamento'
  reference: string
}

/**
 * Resolves a book name or abbreviation to the full book name
 */
export function resolveBookName(input: string): string | null {
  const normalized = input.trim()

  // Try exact match first
  if (ALL_BOOKS.includes(normalized)) {
    return normalized
  }

  // Try abbreviation lookup
  const abbrMatch = ABBREVIATION_TO_BOOK[normalized.toLowerCase()]
  if (abbrMatch) {
    return abbrMatch
  }

  // Try case-insensitive full name match
  const caseInsensitive = ALL_BOOKS.find(
    (b) => b.toLowerCase() === normalized.toLowerCase()
  )
  if (caseInsensitive) {
    return caseInsensitive
  }

  return null
}

/**
 * Gets Bible reference info for a given book, chapter, and optional verse.
 * Returns metadata about the reference (not actual text, as we connect to external APIs).
 */
export function getBookChapterVerse(
  bookInput: string,
  chapter: number,
  verse?: number
): BibleReference | { error: string } {
  const book = resolveBookName(bookInput)

  if (!book) {
    return { error: `Libro no encontrado: "${bookInput}"` }
  }

  if (chapter < 1) {
    return { error: 'El capítulo debe ser mayor a 0' }
  }

  if (verse !== undefined && verse < 1) {
    return { error: 'El versículo debe ser mayor a 0' }
  }

  const isOldTestament = OLD_TESTAMENT_BOOKS.includes(book)
  const bookAbbr = BOOK_ABBREVIATIONS[book] || book

  const reference = verse
    ? `${bookAbbr} ${chapter}:${verse}`
    : `${bookAbbr} ${chapter}`

  return {
    book,
    bookAbbr,
    chapter,
    verse,
    testament: isOldTestament ? 'Antiguo Testamento' : 'Nuevo Testamento',
    reference,
  }
}

/**
 * Generates the full reference string for display
 */
export function formatReference(
  book: string,
  chapter: number,
  verseStart?: number,
  verseEnd?: number
): string {
  const abbr = BOOK_ABBREVIATIONS[book] || book

  if (verseStart !== undefined && verseEnd !== undefined) {
    return `${abbr} ${chapter}:${verseStart}-${verseEnd}`
  }
  if (verseStart !== undefined) {
    return `${abbr} ${chapter}:${verseStart}`
  }
  return `${abbr} ${chapter}`
}

/**
 * Gets the total number of books
 */
export function getTotalBooks(): number {
  return ALL_BOOKS.length
}

/**
 * Gets testament info for a given book
 */
export function getTestamentForBook(
  book: string
): 'Antiguo Testamento' | 'Nuevo Testamento' | null {
  if (OLD_TESTAMENT_BOOKS.includes(book)) {
    return 'Antiguo Testamento'
  }
  if (NEW_TESTAMENT_BOOKS.includes(book)) {
    return 'Nuevo Testamento'
  }
  return null
}

/**
 * Internal Bible API URL builder
 * Uses the church's own /api/bible endpoint (RVR1960 in Spanish)
 */
export function buildBibleApiUrl(
  book: string,
  chapter: number,
  verse?: number
): string {
  const params = new URLSearchParams({ book, chapter: String(chapter) })
  if (verse) params.set('verse', String(verse))
  return `/api/bible?${params.toString()}`
}
