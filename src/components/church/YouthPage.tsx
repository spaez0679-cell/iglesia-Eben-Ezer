'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Play,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  ChevronLeft,
  Quote,
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

interface YouthPhoto {
  id: string
  url: string
  caption?: string
}

interface YouthMeeting {
  id: string
  title: string
  description?: string
  date: string
  videoUrl?: string
  quote?: string
  quoteRef?: string
  photos: YouthPhoto[]
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

export function YouthPage() {
  const { setCurrentPage } = useAppStore()
  const [meetings, setMeetings] = useState<YouthMeeting[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMeeting, setSelectedMeeting] = useState<YouthMeeting | null>(
    null
  )

  useEffect(() => {
    fetch('/api/youth')
      .then((res) => res.json())
      .then((data) => setMeetings(Array.isArray(data) ? data : []))
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false))
  }, [])

  // Get latest meeting with quote
  const quoteMeeting = meetings.find((m) => m.quote)

  return (
    <div className="page-transition pb-20 md:pb-0">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3D97B5] via-[#4AAFCF] to-[#6DC5D8] py-12 sm:py-16">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                Reunión de Jóvenes
              </h1>
              <p className="mt-1 text-white/70">
                Jóvenes con propósito, fe y energía ✨
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Quote of the day */}
        {quoteMeeting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <Card className="border-[#C8E0ED] bg-gradient-to-br from-[#EAF6FB] via-[#EAF6FB] to-[#E6F5EA]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <Quote className="mt-1 h-8 w-8 shrink-0 text-[#5E7F94]" />
                  <div>
                    <p className="text-lg italic leading-relaxed text-foreground sm:text-xl">
                      &ldquo;{quoteMeeting.quote}&rdquo;
                    </p>
                    {quoteMeeting.quoteRef && (
                      <p className="mt-2 text-sm font-medium text-[#3D97B5]">
                        — {quoteMeeting.quoteRef}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Meetings grid */}
        <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
          Reuniones
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F5EA]">
              <Sparkles className="h-8 w-8 text-[#3D97B5]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Aún no hay reuniones
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Las reuniones de jóvenes serán añadidas pronto
            </p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {meetings.map((meeting, i) => (
              <motion.div key={meeting.id} variants={fadeUp} custom={i}>
                <Card
                  className="group cursor-pointer overflow-hidden border-[#D4E6F0] transition-all hover:shadow-lg hover:border-[#A8D5E2]"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  {/* Video thumbnail */}
                  {meeting.videoUrl && (
                    <div className="relative aspect-video overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#3D97B5] to-[#4AAFCF]">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                          <Play className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(meeting.date)}
                      </span>
                      {meeting.photos.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-[#E6F5EA] text-[#2D8B4E]"
                        >
                          <ImageIcon className="mr-1 h-3 w-3" />
                          {meeting.photos.length}
                        </Badge>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-foreground group-hover:text-[#3D97B5] transition-colors">
                      {meeting.title}
                    </h3>
                    {meeting.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {meeting.description}
                      </p>
                    )}
                    {/* Share button */}
                    <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <ShareMenu
                        variant="mini"
                        title={meeting.title}
                        text={`Jóvenes: ${meeting.title} — Iglesia EBEN EZER`}
                      />
                    </div>
                    {meeting.quote && (
                      <p className="mt-2 text-sm italic text-[#3D97B5]/70 line-clamp-2">
                        &ldquo;{meeting.quote}&rdquo;
                        {meeting.quoteRef && ` — ${meeting.quoteRef}`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Meeting Detail Dialog */}
      <Dialog
        open={!!selectedMeeting}
        onOpenChange={(open) => !open && setSelectedMeeting(null)}
      >
        {selectedMeeting && (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#2D8B4E]">
                {selectedMeeting.title}
              </DialogTitle>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(selectedMeeting.date)}
                </div>
                <ShareMenu
                  title={selectedMeeting.title}
                  text={`Jóvenes: ${selectedMeeting.title} — Iglesia EBEN EZER`}
                  iconOnly
                  label="Compartir"
                />
              </div>
            </DialogHeader>

            {/* Quote */}
            {selectedMeeting.quote && (
              <Card className="border-[#D4E6F0] bg-[#EAF6FB]/50">
                <CardContent className="p-4">
                  <p className="italic text-foreground">
                    &ldquo;{selectedMeeting.quote}&rdquo;
                  </p>
                  {selectedMeeting.quoteRef && (
                    <p className="mt-1 text-sm font-medium text-[#3D97B5]">
                      — {selectedMeeting.quoteRef}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Video */}
            {selectedMeeting.videoUrl && (
              <div className="aspect-video overflow-hidden rounded-lg">
                {(() => {
                  const embedUrl = getYouTubeEmbedUrl(selectedMeeting.videoUrl)
                  return embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={selectedMeeting.title}
                      className="h-full w-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#3D97B5] to-[#4AAFCF]">
                      <a
                        href={selectedMeeting.videoUrl}
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
            {selectedMeeting.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {selectedMeeting.description}
              </p>
            )}

            {/* Photos */}
            {selectedMeeting.photos.length > 0 && (
              <>
                <Separator className="my-2" />
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-foreground">
                    Fotos ({selectedMeeting.photos.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {selectedMeeting.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group/photo relative aspect-square overflow-hidden rounded-xl bg-muted"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Foto de la reunión'}
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
