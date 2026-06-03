'use client'

import { useCallback, useEffect, useState } from 'react'
import { Save, Loader2, Church, MapPin, Phone, Mail, Clock, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

interface ChurchInfoData {
  churchName: string
  address: string
  phone: string
  email: string
  whatsapp: string
  schedule: string
  facebook: string
  instagram: string
  youtube: string
  tiktok: string
}

const defaultInfo: ChurchInfoData = {
  churchName: '',
  address: '',
  phone: '',
  email: '',
  whatsapp: '',
  schedule: '',
  facebook: '',
  instagram: '',
  youtube: '',
  tiktok: '',
}

export function AdminChurchInfo() {
  const [info, setInfo] = useState<ChurchInfoData>(defaultInfo)
  const [originalInfo, setOriginalInfo] = useState<ChurchInfoData>(defaultInfo)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchInfo = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/church-info')
      const data = await res.json()
      const loaded: ChurchInfoData = {
        churchName: data.churchName || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        schedule: data.schedule || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        youtube: data.youtube || '',
        tiktok: data.tiktok || '',
      }
      setInfo(loaded)
      setOriginalInfo(loaded)
    } catch {
      toast.error('Error al cargar la información de la iglesia')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInfo()
  }, [fetchInfo])

  const handleChange = (key: keyof ChurchInfoData, value: string) => {
    setInfo((prev) => ({ ...prev, [key]: value }))
  }

  const hasChanges = JSON.stringify(info) !== JSON.stringify(originalInfo)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/church-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }

      toast.success('Información de la iglesia actualizada')
      setOriginalInfo({ ...info })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Información de la Iglesia</h1>
          <p className="text-muted-foreground">Datos de contacto e información general</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card><CardContent className="p-6"><Skeleton className="h-4 w-32 mb-4" /><Skeleton className="h-10 w-full mb-3" /><Skeleton className="h-10 w-full mb-3" /><Skeleton className="h-10 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-4 w-32 mb-4" /><Skeleton className="h-10 w-full mb-3" /><Skeleton className="h-10 w-full mb-3" /><Skeleton className="h-10 w-full" /></CardContent></Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Información de la Iglesia</h1>
          <p className="text-muted-foreground">Datos de contacto e información general</p>
        </div>
        <Button onClick={handleSave} disabled={saving || !hasChanges} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Church Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Church className="h-4.5 w-4.5 text-[#4A1A6B]" />
              Datos de la Iglesia
            </CardTitle>
            <CardDescription>Nombre, dirección y datos de contacto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="church-name">Nombre de la Iglesia</Label>
              <Input
                id="church-name"
                value={info.churchName}
                onChange={(e) => handleChange('churchName', e.target.value)}
                placeholder="EBEN EZER"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="church-address" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Dirección
              </Label>
              <Textarea
                id="church-address"
                value={info.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Dirección completa de la iglesia"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="church-phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Teléfono
                </Label>
                <Input
                  id="church-phone"
                  value={info.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="church-whatsapp" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  WhatsApp
                </Label>
                <Input
                  id="church-whatsapp"
                  value={info.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="church-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Correo Electrónico
              </Label>
              <Input
                id="church-email"
                type="email"
                value={info.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="iglesia@ebenezer.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="church-schedule" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Horarios
              </Label>
              <Textarea
                id="church-schedule"
                value={info.schedule}
                onChange={(e) => handleChange('schedule', e.target.value)}
                placeholder="Domingos 10:00 AM&#10;Miércoles 7:00 PM"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4.5 w-4.5 text-[#4A1A6B]" />
              Redes Sociales
            </CardTitle>
            <CardDescription>Enlaces a las redes sociales de la iglesia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="church-facebook">Facebook</Label>
              <Input
                id="church-facebook"
                value={info.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                placeholder="https://facebook.com/ebenezer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="church-instagram">Instagram</Label>
              <Input
                id="church-instagram"
                value={info.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="https://instagram.com/ebenezer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="church-youtube">YouTube</Label>
              <Input
                id="church-youtube"
                value={info.youtube}
                onChange={(e) => handleChange('youtube', e.target.value)}
                placeholder="https://youtube.com/@ebenezer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="church-tiktok">TikTok</Label>
              <Input
                id="church-tiktok"
                value={info.tiktok}
                onChange={(e) => handleChange('tiktok', e.target.value)}
                placeholder="https://tiktok.com/@ebenezer"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save button for mobile */}
      <div className="md:hidden">
        <Button onClick={handleSave} disabled={saving || !hasChanges} className="w-full gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}
