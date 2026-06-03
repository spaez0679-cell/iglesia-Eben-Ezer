'use client'

import { useEffect, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  Users,
  GraduationCap,
  Megaphone,
  ArrowRight,
  Church,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type Page } from '@/store'

interface Stats {
  sermons: number
  events: number
  youth: number
  announcements: number
  sundaySchool: number
}

interface QuickLink {
  label: string
  description: string
  icon: React.ElementType
  page: Page
  color: string
}

const quickLinks: QuickLink[] = [
  {
    label: 'Predicaciones',
    description: 'Gestionar sermones de domingos y miércoles',
    icon: BookOpen,
    page: 'admin-sermons',
    color: 'bg-violet-100 text-violet-700',
  },
  {
    label: 'Eventos',
    description: 'Administrar eventos de la iglesia',
    icon: CalendarDays,
    page: 'admin-events',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    label: 'Jóvenes',
    description: 'Reuniones y actividades de jóvenes',
    icon: Users,
    page: 'admin-youth',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    label: 'Escuelita Dominical',
    description: 'Clases y participantes',
    icon: GraduationCap,
    page: 'admin-sundayschool',
    color: 'bg-sky-100 text-sky-700',
  },
  {
    label: 'Anuncios',
    description: 'Crear y gestionar anuncios',
    icon: Megaphone,
    page: 'admin-announcements',
    color: 'bg-rose-100 text-rose-700',
  },
  {
    label: 'Información de Iglesia',
    description: 'Datos de contacto y horarios',
    icon: Church,
    page: 'admin-churchinfo',
    color: 'bg-purple-100 text-purple-700',
  },
]

export function AdminDashboard() {
  const { adminName, setCurrentPage } = useAppStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [sermonsRes, eventsRes, youthRes, announcementsRes, sundaySchoolRes] = await Promise.all([
          fetch('/api/sermons'),
          fetch('/api/events'),
          fetch('/api/youth'),
          fetch('/api/announcements?all=true'),
          fetch('/api/sunday-school'),
        ])

        const [sermons, events, youth, announcements, sundaySchool] = await Promise.all([
          sermonsRes.json(),
          eventsRes.json(),
          youthRes.json(),
          announcementsRes.json(),
          sundaySchoolRes.json(),
        ])

        setStats({
          sermons: Array.isArray(sermons) ? sermons.length : 0,
          events: Array.isArray(events) ? events.length : 0,
          youth: Array.isArray(youth) ? youth.length : 0,
          announcements: Array.isArray(announcements) ? announcements.length : 0,
          sundaySchool: Array.isArray(sundaySchool) ? sundaySchool.length : 0,
        })
      } catch {
        setStats({ sermons: 0, events: 0, youth: 0, announcements: 0, sundaySchool: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          ¡Bienvenido, {adminName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Panel de administración — Iglesia EBEN EZER
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-violet-600" />
                  <span className="text-sm text-muted-foreground">Predicaciones</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.sermons || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-muted-foreground">Eventos</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.events || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-muted-foreground">Jóvenes</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.youth || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="h-4 w-4 text-rose-600" />
                  <span className="text-sm text-muted-foreground">Anuncios</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.announcements || 0}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Card
                key={link.page}
                className="cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => setCurrentPage(link.page)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${link.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardTitle className="text-base mt-2">{link.label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
