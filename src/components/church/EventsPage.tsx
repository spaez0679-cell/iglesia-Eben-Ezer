'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  PartyPopper,
  Calendar,
  MapPin,
  Clock,
  Image as ImageIcon,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store'
import { ShareMenu } from '@/components/church/ShareMenu'

interface EventPhoto {
  id: string
  url: string
  caption?: string
}

interface ChurchEvent {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  isUpcoming: boolean
  photos: EventPhoto[]
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

export function EventsPage() {
  const { setCurrentPage } = useAppStore()
  const [events, setEvents] = useState<ChurchEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null)

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const upcomingEvents = events.filter((e) => e.isUpcoming)
  const pastEvents = events.filter((e) => !e.isUpcoming)

  return (
    <div className="page-transition pb-20 md:pb-0">
      {/* Header */}
      <section className="relative overflow-hidden gradient-church py-12 sm:py-16">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 25%, rgba(74,175,207,0.3) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
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
                Eventos
              </h1>
              <p className="mt-1 text-white/70">
                Actividades y eventos especiales de nuestra iglesia
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-8 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upcoming" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Próximos ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Pasados ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F5EA]">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  No hay eventos próximos
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pronto anunciaremos nuevos eventos
                </p>
              </div>
            ) : (
              <EventGrid
                events={upcomingEvents}
                onSelect={setSelectedEvent}
              />
            )}
          </TabsContent>

          <TabsContent value="past">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : pastEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F5EA]">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  No hay eventos pasados
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Los eventos pasados aparecerán aquí
                </p>
              </div>
            ) : (
              <EventGrid events={pastEvents} onSelect={setSelectedEvent} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Event Detail Dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        {selectedEvent && (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl text-primary">
                  {selectedEvent.title}
                </DialogTitle>
                <Badge
                  className={
                    selectedEvent.isUpcoming
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }
                >
                  {selectedEvent.isUpcoming ? 'Próximo' : 'Pasado'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(selectedEvent.date)}
                </span>
                {selectedEvent.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {selectedEvent.time}
                  </span>
                )}
                {selectedEvent.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedEvent.location}
                  </span>
                )}
              </div>
            </DialogHeader>

            {/* Share in dialog */}
            <div className="flex justify-end">
              <ShareMenu
                title={selectedEvent.title}
                text={`Evento: ${selectedEvent.title} — Iglesia EBEN EZER`}
                iconOnly
                label="Compartir"
              />
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {selectedEvent.description}
              </p>
            )}

            {/* Photos */}
            {selectedEvent.photos.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-foreground">
                    Fotos ({selectedEvent.photos.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {selectedEvent.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group/photo relative aspect-square overflow-hidden rounded-xl bg-muted"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Foto del evento'}
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

/* ─── Event Grid sub-component ─── */
function EventGrid({
  events,
  onSelect,
}: {
  events: ChurchEvent[]
  onSelect: (e: ChurchEvent) => void
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {events.map((event, i) => (
        <motion.div key={event.id} variants={fadeUp} custom={i}>
          <Card
            className="group cursor-pointer overflow-hidden border-[#D4E6F0] transition-all hover:shadow-lg hover:border-primary/20"
            onClick={() => onSelect(event)}
          >
            {/* Cover image or placeholder */}
            {event.photos.length > 0 ? (
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={event.photos[0].url}
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Badge
                    className={
                      event.isUpcoming
                        ? 'bg-green-500 text-white'
                        : 'bg-black/50 text-white'
                    }
                  >
                    {event.isUpcoming ? 'Próximo' : 'Pasado'}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#E6F5EA] to-[#EAF6FB]">
                <PartyPopper className="h-10 w-10 text-primary/30" />
                <Badge
                  className="absolute top-2 right-2"
                  variant={
                    event.isUpcoming ? 'default' : 'secondary'
                  }
                >
                  {event.isUpcoming ? 'Próximo' : 'Pasado'}
                </Badge>
              </div>
            )}

            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(event.date)}
                </span>
                {event.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {event.time}
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-semibold text-foreground group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              {event.location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </p>
              )}
              {event.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              )}
              {event.photos.length > 1 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <ImageIcon className="h-3 w-3" />
                  {event.photos.length} fotos
                </div>
              )}
              {/* Share buttons */}
              <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
                <ShareMenu
                  variant="mini"
                  title={event.title}
                  text={`Evento: ${event.title} — Iglesia EBEN EZER`}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
