'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, X, UserPlus } from 'lucide-react'
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

interface SundaySchoolPhoto {
  id?: string
  url: string
  caption?: string | null
}

interface Participant {
  id?: string
  name: string
}

interface SundaySchoolItem {
  id: string
  title: string
  description?: string | null
  date: string
  teacher?: string | null
  videoUrl?: string | null
  photos: SundaySchoolPhoto[]
  participants: Participant[]
}

interface SundaySchoolFormData {
  title: string
  description: string
  date: string
  teacher: string
  videoUrl: string
  photos: string[]
  participants: string[]
}

const emptyForm: SundaySchoolFormData = {
  title: '',
  description: '',
  date: '',
  teacher: '',
  videoUrl: '',
  photos: [],
  participants: [],
}

export function AdminSundaySchool() {
  const [items, setItems] = useState<SundaySchoolItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SundaySchoolItem | null>(null)
  const [form, setForm] = useState<SundaySchoolFormData>(emptyForm)
  const [newParticipant, setNewParticipant] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SundaySchoolItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/sunday-school')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar las clases de escuelita')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const openCreate = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setNewParticipant('')
    setDialogOpen(true)
  }

  const openEdit = (item: SundaySchoolItem) => {
    setEditingItem(item)
    setForm({
      title: item.title,
      description: item.description || '',
      date: item.date ? item.date.split('T')[0] : '',
      teacher: item.teacher || '',
      videoUrl: item.videoUrl || '',
      photos: item.photos?.map((p) => p.url) || [],
      participants: item.participants?.map((p) => p.name) || [],
    })
    setNewParticipant('')
    setDialogOpen(true)
  }

  const addParticipant = () => {
    const name = newParticipant.trim()
    if (!name) return
    if (form.participants.includes(name)) {
      toast.error('Este participante ya está en la lista')
      return
    }
    setForm((f) => ({ ...f, participants: [...f.participants, name] }))
    setNewParticipant('')
  }

  const removeParticipant = (index: number) => {
    setForm((f) => ({
      ...f,
      participants: f.participants.filter((_, i) => i !== index),
    }))
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
        teacher: form.teacher.trim() || null,
        videoUrl: form.videoUrl.trim() || null,
        photos: form.photos.map((url) => ({ url })),
        participants: form.participants.map((name) => ({ name })),
      }

      let res: Response
      if (editingItem) {
        res = await fetch(`/api/sunday-school/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/sunday-school', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }

      toast.success(editingItem ? 'Clase actualizada' : 'Clase creada')
      setDialogOpen(false)
      fetchItems()
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
      const res = await fetch(`/api/sunday-school/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }
      toast.success('Clase eliminada')
      setDeleteTarget(null)
      fetchItems()
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
          <h1 className="text-2xl font-bold text-gray-900">Escuelita Dominical</h1>
          <p className="text-muted-foreground">Clases, maestros y participantes</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Clase
        </Button>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden sm:table-cell">Fecha</TableHead>
              <TableHead className="hidden md:table-cell">Maestro</TableHead>
              <TableHead className="hidden lg:table-cell">Participantes</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No hay clases de escuelita registradas
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {formatDate(item.date)}{item.teacher ? ` — ${item.teacher}` : ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(item.date)}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.teacher || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {item.participants?.length > 0 ? (
                      <Badge variant="secondary">{item.participants.length} participante{item.participants.length !== 1 ? 's' : ''}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(item)}>
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
            <DialogTitle>{editingItem ? 'Editar Clase' : 'Nueva Clase'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ss-title">Título *</Label>
              <Input
                id="ss-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Título de la clase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss-description">Descripción</Label>
              <Textarea
                id="ss-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descripción de la clase"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ss-date">Fecha *</Label>
                <Input
                  id="ss-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ss-teacher">Maestro</Label>
                <Input
                  id="ss-teacher"
                  value={form.teacher}
                  onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
                  placeholder="Nombre del maestro"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss-video">URL del Video</Label>
              <Input
                id="ss-video"
                value={form.videoUrl}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/..."
              />
            </div>

            {/* Participants */}
            <div className="space-y-2">
              <Label>Participantes</Label>
              <div className="flex gap-2">
                <Input
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  placeholder="Nombre del participante"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addParticipant()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addParticipant} className="flex-shrink-0">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              {form.participants.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.participants.map((name, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 py-1 px-2">
                      {name}
                      <button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        className="ml-1 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
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
              {editingItem ? 'Guardar Cambios' : 'Crear Clase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar clase?</AlertDialogTitle>
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
