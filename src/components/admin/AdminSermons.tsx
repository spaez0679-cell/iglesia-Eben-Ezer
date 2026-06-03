'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, ImageOff } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageUpload } from './ImageUpload'

interface SermonPhoto {
  id?: string
  url: string
  caption?: string | null
}

interface Sermon {
  id: string
  title: string
  description?: string | null
  preacher?: string | null
  date: string
  videoUrl?: string | null
  type: string
  photos: SermonPhoto[]
}

interface SermonFormData {
  title: string
  description: string
  preacher: string
  date: string
  videoUrl: string
  type: string
  photos: string[]
}

const emptyForm: SermonFormData = {
  title: '',
  description: '',
  preacher: '',
  date: '',
  videoUrl: '',
  type: 'domingo',
  photos: [],
}

export function AdminSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('domingo')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null)
  const [form, setForm] = useState<SermonFormData>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Sermon | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchSermons = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/sermons?type=${activeTab}`)
      const data = await res.json()
      setSermons(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar las predicaciones')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchSermons()
  }, [fetchSermons])

  const openCreate = () => {
    setEditingSermon(null)
    setForm({ ...emptyForm, type: activeTab })
    setDialogOpen(true)
  }

  const openEdit = (sermon: Sermon) => {
    setEditingSermon(sermon)
    setForm({
      title: sermon.title,
      description: sermon.description || '',
      preacher: sermon.preacher || '',
      date: sermon.date ? sermon.date.split('T')[0] : '',
      videoUrl: sermon.videoUrl || '',
      type: sermon.type,
      photos: sermon.photos?.map((p) => p.url) || [],
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
        preacher: form.preacher.trim() || null,
        date: form.date,
        videoUrl: form.videoUrl.trim() || null,
        type: form.type,
        photos: form.photos.map((url) => ({ url })),
      }

      let res: Response
      if (editingSermon) {
        res = await fetch(`/api/sermons/${editingSermon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/sermons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }

      toast.success(editingSermon ? 'Predicación actualizada' : 'Predicación creada')
      setDialogOpen(false)
      fetchSermons()
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
      const res = await fetch(`/api/sermons/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }
      toast.success('Predicación eliminada')
      setDeleteTarget(null)
      fetchSermons()
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
          <h1 className="text-2xl font-bold text-gray-900">Predicaciones</h1>
          <p className="text-muted-foreground">Gestionar sermones de domingos y miércoles</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Predicación
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="domingo">Domingos</TabsTrigger>
          <TabsTrigger value="miercoles">Miércoles</TabsTrigger>
        </TabsList>

        {['domingo', 'miercoles'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="border rounded-lg bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                    <TableHead className="hidden md:table-cell">Predicador</TableHead>
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
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : sermons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No hay predicaciones registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    sermons.map((sermon) => (
                      <TableRow key={sermon.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sermon.title}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">{formatDate(sermon.date)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{formatDate(sermon.date)}</TableCell>
                        <TableCell className="hidden md:table-cell">{sermon.preacher || '—'}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {sermon.photos?.length > 0 ? (
                            <Badge variant="secondary">{sermon.photos.length} foto{sermon.photos.length !== 1 ? 's' : ''}</Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(sermon)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(sermon)}>
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
          </TabsContent>
        ))}
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSermon ? 'Editar Predicación' : 'Nueva Predicación'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sermon-title">Título *</Label>
              <Input
                id="sermon-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Título de la predicación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sermon-description">Descripción</Label>
              <Textarea
                id="sermon-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descripción de la predicación"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sermon-preacher">Predicador</Label>
                <Input
                  id="sermon-preacher"
                  value={form.preacher}
                  onChange={(e) => setForm((f) => ({ ...f, preacher: e.target.value }))}
                  placeholder="Nombre del predicador"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sermon-date">Fecha *</Label>
                <Input
                  id="sermon-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sermon-type">Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger id="sermon-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domingo">Domingo</SelectItem>
                    <SelectItem value="miercoles">Miércoles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sermon-video">URL del Video</Label>
                <Input
                  id="sermon-video"
                  value={form.videoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  placeholder="https://youtube.com/..."
                />
              </div>
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
              {editingSermon ? 'Guardar Cambios' : 'Crear Predicación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar predicación?</AlertDialogTitle>
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
