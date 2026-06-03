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

interface Announcement {
  id: string
  title: string
  content?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface AnnouncementFormData {
  title: string
  content: string
  isActive: boolean
}

const emptyForm: AnnouncementFormData = {
  title: '',
  content: '',
  isActive: true,
}

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Announcement | null>(null)
  const [form, setForm] = useState<AnnouncementFormData>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/announcements?all=true')
      const data = await res.json()
      setAnnouncements(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar los anuncios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const openCreate = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: Announcement) => {
    setEditingItem(item)
    setForm({
      title: item.title,
      content: item.content || '',
      isActive: item.isActive,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('El título es obligatorio')
      return
    }

    setSaving(true)
    try {
      const body = {
        title: form.title.trim(),
        content: form.content.trim() || null,
        isActive: form.isActive,
      }

      let res: Response
      if (editingItem) {
        res = await fetch(`/api/announcements/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }

      toast.success(editingItem ? 'Anuncio actualizado' : 'Anuncio creado')
      setDialogOpen(false)
      fetchAnnouncements()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (item: Announcement) => {
    setTogglingId(item.id)
    try {
      const res = await fetch(`/api/announcements/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al cambiar estado')
      }
      toast.success(item.isActive ? 'Anuncio desactivado' : 'Anuncio activado')
      fetchAnnouncements()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cambiar estado')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/announcements/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }
      toast.success('Anuncio eliminado')
      setDeleteTarget(null)
      fetchAnnouncements()
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
          <h1 className="text-2xl font-bold text-gray-900">Anuncios</h1>
          <p className="text-muted-foreground">Crear y gestionar anuncios de la iglesia</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Anuncio
        </Button>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden sm:table-cell">Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  No hay anuncios registrados
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((item) => (
                <TableRow key={item.id} className={!item.isActive ? 'opacity-60' : ''}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{formatDate(item.createdAt)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    {togglingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <button onClick={() => handleToggle(item)}>
                        <Badge className={item.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''} variant={item.isActive ? 'default' : 'secondary'}>
                          {item.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Anuncio' : 'Nuevo Anuncio'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ann-title">Título *</Label>
              <Input
                id="ann-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Título del anuncio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-content">Contenido</Label>
              <Textarea
                id="ann-content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Contenido del anuncio"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="ann-active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
              <Label htmlFor="ann-active" className="cursor-pointer">
                Anuncio activo (visible en el sitio)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingItem ? 'Guardar Cambios' : 'Crear Anuncio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar anuncio?</AlertDialogTitle>
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
