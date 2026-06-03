'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageUpload } from './ImageUpload'

interface EventPhoto {
  id?: string
  url: string
  caption?: string | null
}

interface EventItem {
  id: string
  title: string
  description?: string | null
  date: string
  time?: string | null
  location?: string | null
  isUpcoming: boolean
  photos: EventPhoto[]
}

interface EventFormData {
  title: string
  description: string
  date: string
  time: string
  location: string
  isUpcoming: boolean
  photos: string[]
}

const emptyForm: EventFormData = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  isUpcoming: true,
  photos: [],
}

export function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [form, setForm] = useState<EventFormData>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/events')
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar los eventos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const openCreate = () => {
    setEditingEvent(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (event: EventItem) => {
    setEditingEvent(event)
    setForm({
      title: event.title,
      description: event.description || '',
      date: event.date ? event.date.split('T')[0] : '',
      time: event.time || '',
      location: event.location || '',
      isUpcoming: event.isUpcoming,
      photos: event.photos?.map((p) => p.url) || [],
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) {
      toast.error('El título y la fecha son obligatorios')
      return
    }

    setSaving(true)
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        date: form.date,
        time: form.time.trim() || null,
        location: form.location.trim() || null,
        isUpcoming: form.isUpcoming,
        photos: form.photos.map((url) => ({ url })),
      }

      let res: Response
      if (editingEvent) {
        res = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }

      toast.success(editingEvent ? 'Evento actualizado' : 'Evento creado')
      setDialogOpen(false)
      fetchEvents()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/events/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }
      toast.success('Evento eliminado')
      setDeleteTarget(null)
      fetchEvents()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-muted-foreground">Administrar eventos de la iglesia</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden sm:table-cell">Fecha</TableHead>
              <TableHead className="hidden md:table-cell">Hora</TableHead>
              <TableHead className="hidden lg:table-cell">Ubicación</TableHead>
              <TableHead className="hidden md:table-cell">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No hay eventos registrados
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {formatDate(event.date)}{event.time ? ` — ${event.time}` : ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(event.date)}</TableCell>
                  <TableCell className="hidden md:table-cell">{event.time || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{event.location || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {event.isUpcoming ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Próximo</Badge>
                    ) : (
                      <Badge variant="secondary">Pasado</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(event)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(event)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="event-title">Título *</Label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Título del evento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-description">Descripción</Label>
              <Textarea
                id="event-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del evento"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date">Fecha *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-time">Hora</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-location">Ubicación</Label>
              <Input
                id="event-location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Lugar del evento"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="event-upcoming"
                checked={form.isUpcoming}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isUpcoming: checked }))}
              />
              <Label htmlFor="event-upcoming" className="cursor-pointer">
                Marcar como evento próximo
              </Label>
            </div>
            <div className="space-y-2">
              <Label>Fotos</Label>
              <ImageUpload value={form.photos} onChange={(photos) => setForm((f) => ({ ...f, photos }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingEvent ? 'Guardar Cambios' : 'Crear Evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente &quot;{deleteTarget?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
