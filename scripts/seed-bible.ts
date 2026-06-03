/**
 * Script to download Reina-Valera 1909 Bible from getbible.net API
 * and import into local SQLite database via Prisma.
 *
 * Usage: npx tsx scripts/seed-bible.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Map getbible book names to our standard Spanish names
const BOOK_NAME_MAP: Record<string, string> = {
  'Génesis': 'Génesis',
  'Éxodo': 'Éxodo',
  'Levítico': 'Levítico',
  'Números': 'Números',
  'Deuteronomio': 'Deuteronomio',
  'Josué': 'Josué',
  'Jueces': 'Jueces',
  'Rut': 'Rut',
  '1 Samuel': '1 Samuel',
  '2 Samuel': '2 Samuel',
  '1 Reyes': '1 Reyes',
  '2 Reyes': '2 Reyes',
  '1 Crónicas': '1 Crónicas',
  '2 Crónicas': '2 Crónicas',
  'Esdras': 'Esdras',
  'Nehemías': 'Nehemías',
  'Ester': 'Ester',
  'Job': 'Job',
  'Salmos': 'Salmos',
  'Proverbios': 'Proverbios',
  'Eclesiastés': 'Eclesiastés',
  'Cantares': 'Cantares',
  'Isaías': 'Isaías',
  'Jeremías': 'Jeremías',
  'Lamentaciones': 'Lamentaciones',
  'Ezequiel': 'Ezequiel',
  'Daniel': 'Daniel',
  'Oseas': 'Oseas',
  'Joel': 'Joel',
  'Amós': 'Amós',
  'Abdías': 'Abdías',
  'Jonás': 'Jonás',
  'Miqueas': 'Miqueas',
  'Nahúm': 'Nahúm',
  'Habacuc': 'Habacuc',
  'Sofonías': 'Sofonías',
  'Hageo': 'Hageo',
  'Zacarías': 'Zacarías',
  'Malaquías': 'Malaquías',
  'Mateo': 'Mateo',
  'Marcos': 'Marcos',
  'Lucas': 'Lucas',
  'Juan': 'Juan',
  'Hechos': 'Hechos',
  'Romanos': 'Romanos',
  '1 Corintios': '1 Corintios',
  '2 Corintios': '2 Corintios',
  'Gálatas': 'Gálatas',
  'Efesios': 'Efesios',
  'Filipenses': 'Filipenses',
  'Colosenses': 'Colosenses',
  '1 Tesalonicenses': '1 Tesalonicenses',
  '2 Tesalonicenses': '2 Tesalonicenses',
  '1 Timoteo': '1 Timoteo',
  '2 Timoteo': '2 Timoteo',
  'Tito': 'Tito',
  'Filemón': 'Filemón',
  'Hebreos': 'Hebreos',
  'Santiago': 'Santiago',
  '1 Pedro': '1 Pedro',
  '2 Pedro': '2 Pedro',
  '1 Juan': '1 Juan',
  '2 Juan': '2 Juan',
  '3 Juan': '3 Juan',
  'Judas': 'Judas',
  'Apocalipsis': 'Apocalipsis',
}

const BOOK_ABBREVIATIONS: Record<string, string> = {
  'Génesis': 'Gén', 'Éxodo': 'Éx', 'Levítico': 'Lev', 'Números': 'Núm',
  'Deuteronomio': 'Deut', 'Josué': 'Jos', 'Jueces': 'Jue', 'Rut': 'Rut',
  '1 Samuel': '1 Sam', '2 Samuel': '2 Sam', '1 Reyes': '1 Rey', '2 Reyes': '2 Rey',
  '1 Crónicas': '1 Crón', '2 Crónicas': '2 Crón', 'Esdras': 'Esd', 'Nehemías': 'Neh',
  'Ester': 'Est', 'Job': 'Job', 'Salmos': 'Sal', 'Proverbios': 'Prov',
  'Eclesiastés': 'Ecl', 'Cantares': 'Cant', 'Isaías': 'Isa', 'Jeremías': 'Jer',
  'Lamentaciones': 'Lam', 'Ezequiel': 'Eze', 'Daniel': 'Dan', 'Oseas': 'Os',
  'Joel': 'Joel', 'Amós': 'Amós', 'Abdías': 'Abd', 'Jonás': 'Jon',
  'Miqueas': 'Miq', 'Nahúm': 'Nah', 'Habacuc': 'Hab', 'Sofonías': 'Sof',
  'Hageo': 'Hag', 'Zacarías': 'Zac', 'Malaquías': 'Mal',
  'Mateo': 'Mt', 'Marcos': 'Mr', 'Lucas': 'Lc', 'Juan': 'Jn',
  'Hechos': 'Hch', 'Romanos': 'Ro', '1 Corintios': '1 Co', '2 Corintios': '2 Co',
  'Gálatas': 'Gál', 'Efesios': 'Ef', 'Filipenses': 'Fil', 'Colosenses': 'Col',
  '1 Tesalonicenses': '1 Ts', '2 Tesalonicenses': '2 Ts',
  '1 Timoteo': '1 Ti', '2 Timoteo': '2 Ti', 'Tito': 'Tit', 'Filemón': 'Flm',
  'Hebreos': 'Heb', 'Santiago': 'Stg', '1 Pedro': '1 Pe', '2 Pedro': '2 Pe',
  '1 Juan': '1 Jn', '2 Juan': '2 Jn', '3 Juan': '3 Jn', 'Judas': 'Jud',
  'Apocalipsis': 'Ap',
}

const BOOK_NUMBERS: Record<string, number> = {
  'Génesis': 1, 'Éxodo': 2, 'Levítico': 3, 'Números': 4,
  'Deuteronomio': 5, 'Josué': 6, 'Jueces': 7, 'Rut': 8,
  '1 Samuel': 9, '2 Samuel': 10, '1 Reyes': 11, '2 Reyes': 12,
  '1 Crónicas': 13, '2 Crónicas': 14, 'Esdras': 15, 'Nehemías': 16,
  'Ester': 17, 'Job': 18, 'Salmos': 19, 'Proverbios': 20,
  'Eclesiastés': 21, 'Cantares': 22, 'Isaías': 23, 'Jeremías': 24,
  'Lamentaciones': 25, 'Ezequiel': 26, 'Daniel': 27, 'Oseas': 28,
  'Joel': 29, 'Amós': 30, 'Abdías': 31, 'Jonás': 32,
  'Miqueas': 33, 'Nahúm': 34, 'Habacuc': 35, 'Sofonías': 36,
  'Hageo': 37, 'Zacarías': 38, 'Malaquías': 39,
  'Mateo': 40, 'Marcos': 41, 'Lucas': 42, 'Juan': 43,
  'Hechos': 44, 'Romanos': 45, '1 Corintios': 46, '2 Corintios': 47,
  'Gálatas': 48, 'Efesios': 49, 'Filipenses': 50, 'Colosenses': 51,
  '1 Tesalonicenses': 52, '2 Tesalonicenses': 53,
  '1 Timoteo': 54, '2 Timoteo': 55, 'Tito': 56, 'Filemón': 57,
  'Hebreos': 58, 'Santiago': 59, '1 Pedro': 60, '2 Pedro': 61,
  '1 Juan': 62, '2 Juan': 63, '3 Juan': 64, 'Judas': 65,
  'Apocalipsis': 66,
}

async function seedBible() {
  console.log('📖 Downloading Reina-Valera Bible from getbible.net...')
  console.log('   This may take a moment...')

  const res = await fetch('https://api.getbible.net/v2/valera.json')
  if (!res.ok) {
    throw new Error(`Failed to download Bible: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const books = data.books as Array<{
    nr: number
    name: string
    chapters: Array<{
      chapter: number
      verses: Array<{
        chapter: number
        verse: number
        text: string
      }>
    }>
  }>

  console.log(`✅ Downloaded ${books.length} books`)

  // Clear existing Bible data
  console.log('🗑️  Clearing existing Bible data...')
  await prisma.bibleVerse.deleteMany()
  await prisma.bibleBook.deleteMany()

  // Process each book
  let totalVerses = 0
  const BATCH_SIZE = 500

  for (const book of books) {
    const mappedName = BOOK_NAME_MAP[book.name] || book.name
    if (!BOOK_NAME_MAP[book.name]) {
      console.log(`   ⚠️  Unmapped book: "${book.name}" → using as-is`)
    }

    const bookNum = BOOK_NUMBERS[mappedName] || book.nr
    const testament = bookNum <= 39 ? 'AT' : 'NT'
    const totalChapters = book.chapters.length

    // Count total verses in book
    let bookVerseCount = 0
    for (const ch of book.chapters) {
      bookVerseCount += ch.verses.length
    }
    totalVerses += bookVerseCount

    // Create book record
    await prisma.bibleBook.create({
      data: {
        name: mappedName,
        abbr: BOOK_ABBREVIATIONS[mappedName] || mappedName.substring(0, 3),
        bookNum,
        testament,
        chapters: totalChapters,
      },
    })

    // Batch insert verses
    const verseRecords: Array<{ bookName: string; chapter: number; verse: number; text: string }> = []

    for (const ch of book.chapters) {
      for (const v of ch.verses) {
        verseRecords.push({
          bookName: mappedName,
          chapter: ch.chapter,
          verse: v.verse,
          text: v.text.trim(),
        })
      }
    }

    // Insert in batches
    for (let i = 0; i < verseRecords.length; i += BATCH_SIZE) {
      const batch = verseRecords.slice(i, i + BATCH_SIZE)
      await prisma.bibleVerse.createMany({ data: batch })
    }

    console.log(`   ✅ ${mappedName}: ${totalChapters} capítulos, ${bookVerseCount} versículos`)
  }

  console.log(`\n🎉 Bible import complete!`)
  console.log(`   Total: ${books.length} libros, ${totalVerses} versículos`)
  console.log(`   Translation: Reina-Valera (Antigua) — Español`)
}

seedBible()
  .catch((e) => {
    console.error('❌ Error seeding Bible:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
