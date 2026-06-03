'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Quote } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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

interface YouthPhoto {
  id?: string
  url: string
  caption?: string | null
}

interface YouthMeeting {
  id: string
  title: string
  description?: string | null
  date: string
  videoUrl?: string | null
  quote?: string | null
  quoteRef?: string | null
  photos: YouthPhoto[]
}

interface YouthFormData {
  title: string
  description: string
  date: string
  videoUrl: string
  quote: string
  quoteRef: string
  photos: string[]
}

const emptyForm: YouthFormData = {
  title: '',
  description: '',
  date: '',
  videoUrl: '',
  quote: '',
  quoteRef: '',
  photos: [],
}

export function AdminYouth() {
  const [meetings, setMeetings] = useState<YouthMeeting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<YouthMeeting | null>(null)
  const [form, setForm] = useState<YouthFormData>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<YouthMeeting | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/youth')
      const data = await res.json()
      setMeetings(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar las reuniones de jóvenes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  const openCreate = () => {
    setEditingMeeting(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (meeting: YouthMeeting) => {
    setEditingMeeting(meeting)
    setForm({
      title: meeting.title,
      description: meeting.description || '',
      date: meeting.date ? meeting.date.split('T')[0] : '',
      videoUrl: meeting.videoUrl || '',
      quote: meeting.quote || '',
      quoteRef: meeting.quoteRef || '',
      photos: meeting.photos?.map((p) => p.url) || [],
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
        videoUrl: form.videoUrl.trim() || null,
        quote: form.quote.trim() || null,
        quoteRef: form.quoteRef.trim() || null,
        photos: form.photos.map((url) => ({ url })),
      }

      let res: Response
      if (editingMeeting) {
        res = await fetch(`/api/youth/${editingMeeting.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/youth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }

      toast.success(editingMeeting ? 'Reunión actualizada' : 'Reunión creada')
      setDialogOpen(false)
      fetchMeetings()
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
      const res = await fetch(`/api/youth/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }
      toast.success('Reunión eliminada')
      setDeleteTarget(null)
      fetchMeetings()
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
          <h1 className="text-2xl font-bold text-gray-900">Jóvenes</h1>
          <p className="text-muted-foreground">Reuniones y actividades de jóvenes</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Reunión
        </Button>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden sm:table-cell">Fecha</TableHead>
              <TableHead className="hidden md:table-cell">Cita Bíblica</TableHead>
              <TableHead className="hidden md:table-cell">Fotos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : meetings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No hay reuniones de jóvenes registradas
                </TableCell>
              </TableRow>
            ) : (
              meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{meeting.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{formatDate(meeting.date)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(meeting.date)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {meeting.quote ? (
                      <div className="flex items-start gap-1.5 max-w-[200px]">
                        <Quote className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm truncate">{meeting.quoteRef || meeting.quote}</span>
                      </div>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {meeting.photos?.length > 0 ? (
                      <Badge variant="secondary">{meeting.photos.length} foto{meeting.photos.length !== 1 ? 's' : ''}</Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(meeting)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(meeting)}>
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
            <DialogTitle>{editingMeeting ? 'Editar Reunión' : 'Nueva Reunión'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="youth-title">Título *</Label>
              <Input
                id="youth-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Título de la reunión"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youth-description">Descripción</Label>
              <Textarea
                id="youth-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descripción de la reunión"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youth-date">Fecha *</Label>
              <Input
                id="youth-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youth-video">URL del Video</Label>
              <Input
                id="youth-video"
                value={form.videoUrl}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youth-quote">Cita Bíblica</Label>
              <Textarea
                id="youth-quote"
                value={form.quote}
                onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                placeholder="Texto de la cita bíblica"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youth-ref">Referencia</Label>
              <Input
                id="youth-ref"
                value={form.quoteRef}
                onChange={(e) => setForm((f) => ({ ...f, quoteRef: e.target.value }))}
                placeholder="Ej: Romanos 8:28"
              />
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
              {editingMeeting ? 'Guardar Cambios' : 'Crear Reunión'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reunión?</AlertDialogTitle>
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
