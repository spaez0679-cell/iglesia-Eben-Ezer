'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Baby,
  Play,
  Image as ImageIcon,
  Calendar,
  User,
  ChevronLeft,
  GraduationCap,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store'
import { ShareMenu } from '@/components/church/ShareMenu'

interface SundaySchoolPhoto {
  id: string
  url: string
  caption?: string
}

interface Participant {
  id: string
  name: string
}

interface SundaySchoolEntry {
  id: string
  title: string
  description?: string
  date: string
  teacher?: string
  videoUrl?: string
  photos: SundaySchoolPhoto[]
  participants: Participant[]
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
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
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  )
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  if (url.includes('youtube.com/embed/')) return url
  return null
}

export function SundaySchoolPage() {
  const { setCurrentPage } = useAppStore()
  const [entries, setEntries] = useState<SundaySchoolEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<SundaySchoolEntry | null>(
    null
  )

  useEffect(() => {
    fetch('/api/sunday-school')
      .then((res) => res.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-transition pb-20 md:pb-0">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3D97B5] via-[#5BBF6F] to-[#4AAFCF] py-12 sm:py-16">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '35px 35px',
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="mb-4 flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
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
                Escuelita Dominical
              </h1>
              <p className="mt-1 text-white/80">
                Enseñando la Palabra a los más pequeños 🌟
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Intro card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Card className="border-[#D4E6F0] bg-gradient-to-r from-[#E6F5EA] via-[#EAF6FB] to-[#E6F5EA]">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E6F5EA]">
                <GraduationCap className="h-6 w-6 text-[#2D8B4E]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Sobre la Escuelita
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Nuestra Escuelita Dominical es un espacio especial donde los
                  niños aprenden sobre el amor de Dios a través de historias
                  bíblicas, actividades creativas y enseñanzas divertidas. Cada
                  domingo es una nueva aventura de fe.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
          Lecciones y Actividades
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F5EA]">
              <Star className="h-8 w-8 text-[#3D97B5]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Aún no hay lecciones
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Las lecciones de la escuelita serán añadidas pronto
            </p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {entries.map((entry, i) => (
              <motion.div key={entry.id} variants={fadeUp} custom={i}>
                <Card
                  className="group cursor-pointer overflow-hidden border-[#D4E6F0] transition-all hover:shadow-lg hover:border-[#3D97B5]/30"
                  onClick={() => setSelectedEntry(entry)}
                >
                  {/* Top color bar */}
                  <div className="h-2 bg-gradient-to-r from-[#5BBF6F] via-[#4AAFCF] to-[#3D97B5]" />

                  {entry.videoUrl && (
                    <div className="relative aspect-video overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#3D97B5] to-[#4AAFCF]">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                          <Play className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(entry.date)}
                      </span>
                      {entry.teacher && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {entry.teacher}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-foreground group-hover:text-[#3D97B5] transition-colors">
                      {entry.title}
                    </h3>
                    {entry.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {entry.description}
                      </p>
                    )}
                    {/* Share button */}
                    <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <ShareMenu
                        variant="mini"
                        title={entry.title}
                        text={`Escuelita: ${entry.title} — Iglesia EBEN EZER`}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.photos.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-[#E6F5EA] text-[#2D8B4E]"
                        >
                          <ImageIcon className="mr-1 h-3 w-3" />
                          {entry.photos.length} foto
                          {entry.photos.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {entry.participants.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-[#E6F5EA] text-[#2D8B4E]"
                        >
                          <User className="mr-1 h-3 w-3" />
                          {entry.participants.length} participante
                          {entry.participants.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Entry Detail Dialog */}
      <Dialog
        open={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      >
        {selectedEntry && (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#3D97B5]">
                {selectedEntry.title}
              </DialogTitle>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(selectedEntry.date)}
                  </span>
                  {selectedEntry.teacher && (
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Maestro/a: {selectedEntry.teacher}
                    </span>
                  )}
                </div>
                <ShareMenu
                  title={selectedEntry.title}
                  text={`Escuelita: ${selectedEntry.title} — Iglesia EBEN EZER`}
                  iconOnly
                  label="Compartir"
                />
              </div>
            </DialogHeader>

            {/* Video */}
            {selectedEntry.videoUrl && (
              <div className="aspect-video overflow-hidden rounded-xl">
                {(() => {
                  const embedUrl = getYouTubeEmbedUrl(selectedEntry.videoUrl)
                  return embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={selectedEntry.title}
                      className="h-full w-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#3D97B5] to-[#4AAFCF]">
                      <a
                        href={selectedEntry.videoUrl}
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

            {/* Description */}
            {selectedEntry.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {selectedEntry.description}
              </p>
            )}

            {/* Participants */}
            {selectedEntry.participants.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground">
                  Participantes ({selectedEntry.participants.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEntry.participants.map((p) => (
                    <Badge
                      key={p.id}
                      variant="secondary"
                      className="bg-[#E6F5EA] text-[#2D8B4E]"
                    >
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {selectedEntry.photos.length > 0 && (
              <>
                <Separator className="my-2" />
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-foreground">
                    Fotos ({selectedEntry.photos.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {selectedEntry.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group/photo relative aspect-square overflow-hidden rounded-xl bg-muted"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Foto de escuelita'}
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
