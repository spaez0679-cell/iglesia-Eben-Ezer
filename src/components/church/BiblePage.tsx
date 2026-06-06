'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Book,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store'
import { ShareMenu } from '@/components/church/ShareMenu'
import {
  ALL_BOOKS,
  OLD_TESTAMENT_BOOKS,
  NEW_TESTAMENT_BOOKS,
  getBookChapterVerse,
} from '@/lib/bible'

interface BibleApiResponse {
  reference: string
  verses: Array<{
    book_id: string
    book_name: string
    chapter: number
    verse: number
    text: string
  }>
  text: string
  translation_id: string
  translation_name: string
}

const MAX_CHAPTERS = 150

const localBooksMap: Record<string, string> = {
  "Génesis": "genesis", "Éxodo": "exodus", "Levítico": "leviticus", "Números": "numbers",
  "Deuteronomio": "deuteronomy", "Josué": "joshua", "Jueces": "judges", "Rut": "ruth",
  "1 Samuel": "1+samuel", "2 Samuel": "2+samuel", "1 Reyes": "1+reyes", "2 Reyes": "2+reyes",
  "1 Crónicas": "1+chronicles", "2 Crónicas": "2+chronicles", "Esdras": "ezra", "Nehemías": "nehemiah",
  "Ester": "esther", "Job": "job", "Salmos": "psalms", "Proverbios": "proverbs",
  "Eclesiastés": "ecclesiastes", "Cantares": "song+of+solomon", "Isaías": "isaiah", "Jeremías": "jeremiah",
  "Lamentaciones": "lamentations", "Ezequiel": "ezekiel", "Daniel": "daniel", "Oseas": "hosea",
  "Joel": "joel", "Amós": "amos", "Abdías": "obadiah", "Jonás": "jonah", "Miqueas": "micah",
  "Nahúm": "nahum", "Habacuc": "habakkuk", "Sofonías": "zephaniah", "Hageo": "haggai",
  "Zacarías": "zechariah", "Malaquías": "malachi",
  "Mateo": "matthew", "Marcos": "mark", "Lucas": "luke", "Juan": "john",
  "Hechos": "acts", "Romanos": "romans", "1 Corintios": "1+corinthians", "2 Corintios": "2+corinthians",
  "Gálatas": "galatians", "Efesios": "ephesians", "Filipenses": "philippians", "Colosenses": "colossians",
  "1 Tesalonicenses": "1+thessalonians", "2 Tesalonicenses": "2+thessalonians", "1 Timoteo": "1+timothy", "2 Timoteo": "2+timothy",
  "Tito": "titus", "Filemón": "philemon", "Hebreos": "hebrews", "Santiago": "james",
  "1 Pedro": "1+peter", "2 Pedro": "2+peter", "1 Juan": "1+john", "2 Juan": "2+john",
  "3 Juan": "3+john", "Judas": "jude", "Apocalipsis": "revelation"
}

export function BiblePage() {
  const { setCurrentPage } = useAppStore()
  const [selectedBook, setSelectedBook] = useState('Génesis')
  const [chapter, setChapter] = useState('1')
  const [verse, setVerse] = useState('')
  const [bibleData, setBibleData] = useState<BibleApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [testament, setTestament] = useState<'all' | 'old' | 'new'>('all')

  const filteredBooks =
    testament === 'old'
      ? OLD_TESTAMENT_BOOKS
      : testament === 'new'
        ? NEW_TESTAMENT_BOOKS
        : ALL_BOOKS

  const chapterNum = parseInt(chapter) || 1

  const fetchBible = useCallback(
    async (book: string, ch: number, vs?: number) => {
      setLoading(true)
      setError('')
      setBibleData(null)

      const ref = getBookChapterVerse(book, ch, vs)
      if ('error' in ref) {
        setError(ref.error)
        setLoading(false)
        return
      }

      try {
        const bookClean = localBooksMap[book] || book.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "+")
        let passage = `${bookClean}+${ch}`
        if (vs) {
          passage = `${bookClean}+${ch}:${vs}`
        }

        const res = await fetch(`https://bible-api.com/${passage}?translation=rv1909`)

        if (!res.ok) {
          setError('No se pudo obtener el pasaje. Intenta de nuevo.')
          setLoading(false)
          return
        }

        const externalData = await res.json()
        
        const formattedData: BibleApiResponse = {
          reference: `${book} ${ch}${vs ? ':' + vs : ''}`,
          verses: externalData.verses.map((v: any) => ({
            book_id: externalData.translation_id,
            book_name: book,
            chapter: v.chapter,
            verse: v.verse,
            text: v.text.trim()
          })),
          text: externalData.text,
          translation_id: 'rv1909',
          translation_name: 'Reina-Valera (Antigua)'
        }

        setBibleData(formattedData)
      } catch {
        setError('Error de conexión. Por favor intenta más tarde.')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const handleRead = () => {
    const ch = parseInt(chapter)
    if (!ch || ch < 1) {
      setError('Ingresa un capítulo válido')
      return
    }
    const vs = verse ? parseInt(verse) : undefined
    fetchBible(selectedBook, ch, vs)
  }

  const goToPrevChapter = () => {
    if (chapterNum > 1) {
      const newChapter = String(chapterNum - 1)
      setChapter(newChapter)
      fetchBible(selectedBook, chapterNum - 1, verse ? parseInt(verse) : undefined)
    }
  }

  const goToNextChapter = () => {
    if (chapterNum < MAX_CHAPTERS) {
      const newChapter = String(chapterNum + 1)
      setChapter(newChapter)
      fetchBible(selectedBook, chapterNum + 1, verse ? parseInt(verse) : undefined)
    }
  }
  return (
    <div className="page-transition pb-20 md:pb-0">
      <section className="gradient-church py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="mb-4 flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Inicio
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm overflow-hidden">
              <img src="/logo-header.png" alt="EBEN EZER" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Biblia
              </h1>
              <p className="mt-1 text-white/70">
                Lee la Palabra de Dios — Reina-Valera (Español)
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="mb-8 border-[#D4E6F0] shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Testamento</Label>
                <Select
                  value={testament}
                  onValueChange={(v) => setTestament(v as 'all' | 'old' | 'new')}
                >
                  <SelectTrigger className="border-[#C8E0ED]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos (66 libros)</SelectItem>
                    <SelectItem value="old">Antiguo Testamento ({OLD_TESTAMENT_BOOKS.length})</SelectItem>
                    <SelectItem value="new">Nuevo Testamento ({NEW_TESTAMENT_BOOKS.length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Libro</Label>
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger className="border-[#C8E0ED]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {filteredBooks.map((book) => (
                      <SelectItem key={book} value={book}>
                        {book}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Capítulo</Label>
                <Input
                  type="number"
                  min="1"
                  max="150"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="border-[#C8E0ED] focus-visible:ring-primary"
                  placeholder="1-150"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Versículo <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  className="border-[#C8E0ED] focus-visible:ring-primary"
                  placeholder="Ej: 10"
                />
              </div>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleRead}
                disabled={loading}
                className="w-full gradient-church text-white hover:opacity-90 sm:w-auto"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Leer
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-center text-sm text-red-600">{error}</CardContent>
            </Card>
          </motion.div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Cargando pasaje bíblico...</p>
          </div>
        )}

        {bibleData && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-6 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevChapter}
                disabled={chapterNum <= 1}
                className="border-[#C8E0ED] text-primary hover:bg-[#EAF6FB]"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Cap. anterior
              </Button>

              <div className="flex items-center gap-2">
                <div className="text-center">
                  <Badge variant="secondary" className="bg-[#E6F5EA] text-primary px-3 py-1">
                    {bibleData.reference}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{bibleData.translation_name}</p>
                </div>
                <ShareMenu
                  title={`${bibleData.reference} — Biblia Reina-Valera`}
                  text={`Lee ${bibleData.reference} en la Biblia — Iglesia EBEN EZER`}
                  iconOnly
                  label="Compartir versículo"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextChapter}
                disabled={chapterNum >= MAX_CHAPTERS}
                className="border-[#C8E0ED] text-primary hover:bg-[#EAF6FB]"
              >
                Cap. siguiente
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <Card className="border-[#D4E6F0]">
              <CardContent className="p-6 sm:p-8">
                {bibleData.verses ? (
                  <div className="space-y-4">
                    {bibleData.verses.map((v) => (
                      <p key={v.verse} className="text-base leading-relaxed sm:text-lg">
                        <sup className="mr-1 text-xs font-bold text-primary">{v.verse}</sup>
                        {v.text}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-base leading-relaxed sm:text-lg">{bibleData.text}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!bibleData && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F5EA]">
              <Book className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Selecciona un pasaje</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Elige un libro, capítulo y versículo opcional para leer la Palabra de Dios en la versión Reina-Valera en español.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
