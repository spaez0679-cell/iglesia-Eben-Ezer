'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, Clock, BookOpen, PartyPopper, Camera, Video, Megaphone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

const typeIcons: Record<string, React.ReactNode> = {
  sermon: <BookOpen className="h-4 w-4 text-primary" />,
  event: <PartyPopper className="h-4 w-4 text-accent" />,
  announcement: <Megaphone className="h-4 w-4 text-[#4AAFCF]" />,
  photo: <Camera className="h-4 w-4 text-green-600" />,
  video: <Video className="h-4 w-4 text-red-500" />,
  general: <Bell className="h-4 w-4 text-muted-foreground" />,
}

const typeBgColors: Record<string, string> = {
  sermon: 'bg-[#E6F5EA]',
  event: 'bg-sky-light',
  announcement: 'bg-[#E6F5EA]',
  photo: 'bg-green-100',
  video: 'bg-red-50',
  general: 'bg-muted',
}

function timeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Ahora mismo'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Hace ${days}d`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/10"
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="h-5 w-5 text-white/80" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[#D4E6F0] bg-white shadow-xl sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-primary to-[#4AAFCF] p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-white" />
                <h3 className="font-semibold text-white">Notificaciones</h3>
                {unreadCount > 0 && (
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    {unreadCount} nueva{unreadCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllRead}
                    className="h-8 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <CheckCheck className="mr-1 h-3.5 w-3.5" />
                    <span className="text-xs">Leer todo</span>
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No hay notificaciones
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Sé el primero en seguir la página
                  </p>
                </div>
              ) : (
                notifications.map((notification, i) => (
                  <div key={notification.id}>
                    {i > 0 && <Separator />}
                    <div
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                        !notification.isRead ? 'bg-[#EAF6FB]/50' : ''
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          typeBgColors[notification.type] || typeBgColors.general
                        }`}
                      >
                        {typeIcons[notification.type] || typeIcons.general}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/60">
                          <Clock className="h-3 w-3" />
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
