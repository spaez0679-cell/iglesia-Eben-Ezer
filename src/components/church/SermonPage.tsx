'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  Play,
  Image as ImageIcon,
  X,
  User,
  Search,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store'
import { ShareMenu } from '@/components/church/ShareMenu'

interface SermonPhoto {
  id: string
  url: string
  caption?: string
}

interface Sermon {
  id: string
  title: string
  description?: string
  preacher?: string
  date: string
  videoUrl?: string
  type: string
  photos: SermonPhoto[]
}

interface SermonPageProps {
  type: 'domingo' | 'miercoles'
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getYouTubeEmbedUrl(url?: string) {
  if (!url) return null
  // Support youtube.com/watch?v= and youtu.be/
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  )
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  // If it's already an embed URL
  if (url.includes('youtube.com/embed/')) return url
  return null
}

export function SermonPage({ type }: SermonPageProps) {
  const { setCurrentPage } = useAppStore()
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null)

  const title =
    type === 'domingo'
      ? 'Predicaciones de los Domingos'
      : 'Predicaciones de los Miércoles'

  const subtitle =
    type === 'domingo'
      ? 'Mensajes de cada domingo para edificar tu fe'
      : 'Estudios bíblicos de mitad de semana'

  useEffect(() => {
    fetch(`/api/sermons?type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        setSermons(Array.isArray(data) ? data : [])
      })
      .catch(() => setSermons([]))
      .finally(() => setLoading(false))
  }, [type])

  // Get unique months for filter
  const months = useMemo(() => {
    const monthSet = new Set<string>()
    sermons.forEach((s) => {
      try {
        const d = new Date(s.date)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthSet.add(key)
      } catch {
        // ignore
      }
    })
    return Array.from(monthSet).sort().reverse()
  }, [sermons])

  // Filter sermons
  const filteredSermons = useMemo(() => {
    let result = sermons

    if (selectedMonth !== 'all') {
      result = result.filter((s) => {
        try {
          const d = new Date(s.date)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          return key === selectedMonth
        } catch {
          return false
        }
      })
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.preacher && s.preacher.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q))
      )
    }

    return result
  }, [sermons, selectedMonth, search])

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ]
    return `${months[parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="page-transition pb-20 md:pb-0">
      {/* Header */}
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
                {title}
              </h1>
              <p className="mt-1 text-white/70">{subtitle}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar predicación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-[#C8E0ED] focus-visible:ring-primary"
            />
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full border-[#C8E0ED] sm:w-48">
              <SelectValue placeholder="Filtrar por mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los meses</SelectItem>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {formatMonthLabel(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredSermons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F5EA]">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {search || selectedMonth !== 'all'
                ? 'No se encontraron predicaciones'
                : 'Aún no hay predicaciones'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || selectedMonth !== 'all'
                ? 'Intenta con otros filtros'
                : 'Las predicaciones serán añadidas pronto'}
            </p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredSermons.map((sermon, i) => (
              <motion.div key={sermon.id} variants={fadeUp} custom={i}>
                <Card
                  className="group cursor-pointer border-[#D4E6F0] transition-all hover:shadow-lg hover:border-primary/20"
                  onClick={() => setSelectedSermon(sermon)}
                >
                  {/* Video thumbnail */}
                  {sermon.videoUrl && (
                    <div className="relative aspect-video overflow-hidden rounded-t-xl bg-[#1A4A5E]">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2E86AB] to-[#1A4A5E]">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                          <Play className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      {sermon.photos.length > 0 && (
                        <Badge className="absolute top-2 right-2 bg-black/50 text-white text-xs">
                          <ImageIcon className="mr-1 h-3 w-3" />
                          {sermon.photos.length}
                        </Badge>
                      )}
                    </div>
                  )}

                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(sermon.date)}
                    </div>
                    <h3 className="mt-2 font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {sermon.title}
                    </h3>
                    {sermon.preacher && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        {sermon.preacher}
                      </p>
                    )}
                    {sermon.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {sermon.description}
                      </p>
                    )}
                    {!sermon.videoUrl && sermon.photos.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                        <ImageIcon className="h-3 w-3" />
                        {sermon.photos.length} foto
                        {sermon.photos.length > 1 ? 's' : ''}
                      </div>
                    )}
                    {/* Share button */}
                    <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <ShareMenu
                        variant="mini"
                        title={sermon.title}
                        text={`Predicación: ${sermon.title} — Iglesia EBEN EZER`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Sermon Detail Dialog */}
      <Dialog
        open={!!selectedSermon}
        onOpenChange={(open) => !open && setSelectedSermon(null)}
      >
        {selectedSermon && (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-primary">
                {selectedSermon.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(selectedSermon.date)}
                </span>
                {selectedSermon.preacher && (
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {selectedSermon.preacher}
                  </span>
                )}
              </div>
            </DialogHeader>

            {/* Video */}
            {selectedSermon.videoUrl && (
              <div className="aspect-video overflow-hidden rounded-lg">
                {(() => {
                  const embedUrl = getYouTubeEmbedUrl(selectedSermon.videoUrl)
                  return embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={selectedSermon.title}
                      className="h-full w-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#1A4A5E]">
                      <a
                        href={selectedSermon.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-white hover:text-sky transition-colors"
                      >
                        <Play className="h-5 w-5" />
                        Ver video externo
                      </a>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Share buttons in dialog */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="bg-[#E6F5EA] text-primary">
                  {selectedSermon.type === 'domingo' ? 'Domingo' : 'Miércoles'}
                </Badge>
              </div>
              <ShareMenu
                title={selectedSermon.title}
                text={`Predicación: ${selectedSermon.title} — Iglesia EBEN EZER`}
                iconOnly
                label="Compartir"
              />
            </div>

            {/* Description */}
            {selectedSermon.description && (
              <div className="mt-2">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selectedSermon.description}
                </p>
              </div>
            )}

            {/* Photos */}
            {selectedSermon.photos.length > 0 && (
              <>
                <Separator className="my-2" />
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-foreground">
                    Fotos ({selectedSermon.photos.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {selectedSermon.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group/photo relative aspect-square overflow-hidden rounded-lg bg-muted"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Foto del sermón'}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover/photo:scale-105"
                        />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <p className="text-xs text-white">
                              {photo.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
