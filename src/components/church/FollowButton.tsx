'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellRing, Mail, Check, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export function FollowButton() {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [browserNotifGranted, setBrowserNotifGranted] = useState(false)

  // Check if already subscribed (from localStorage)
  useEffect(() => {
    const saved = localStorage.getItem('eben-ezer-subscribed')
    if (saved === 'true') {
      setIsFollowing(true)
    }
    // Check browser notification permission
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      setBrowserNotifGranted(true)
    }
  }, [])

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), name: name || undefined }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setIsFollowing(true)
        localStorage.setItem('eben-ezer-subscribed', 'true')
        localStorage.setItem('eben-ezer-email', email.toLowerCase())

        // Request browser notification permission
        requestBrowserNotification()

        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
          setEmail('')
          setName('')
        }, 2500)
      } else {
        setError(data.error || 'Error al suscribirse')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const requestBrowserNotification = async () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          setBrowserNotifGranted(true)
          // Send a welcome notification
          new Notification('¡Bienvenido a EBEN EZER! 🙏', {
            body: 'Recibirás notificaciones de nuevas predicaciones, eventos y más.',
            icon: '/logo.png',
          })
        }
      } catch {
        // Notification API not available
      }
    }
  }

  const handleUnsubscribe = async () => {
    const savedEmail = localStorage.getItem('eben-ezer-email')
    if (savedEmail) {
      try {
        await fetch('/api/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: savedEmail }),
        })
      } catch {
        // Silently fail
      }
    }
    setIsFollowing(false)
    localStorage.removeItem('eben-ezer-subscribed')
    localStorage.removeItem('eben-ezer-email')
  }

  return (
    <>
      {/* Follow Button */}
      {isFollowing ? (
        <motion.div className="flex items-center gap-2" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <Button
            onClick={handleUnsubscribe}
            variant="outline"
            size="sm"
            className="border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
          >
            <Check className="mr-1.5 h-4 w-4" />
            Siguiendo
          </Button>
          {!browserNotifGranted && (
            <Button
              onClick={requestBrowserNotification}
              variant="outline"
              size="sm"
              className="border-[#C8E0ED] text-primary hover:bg-[#EAF6FB]"
            >
              <Bell className="mr-1.5 h-4 w-4" />
              Activar Alertas
            </Button>
          )}
        </motion.div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="bg-gradient-to-r from-primary to-[#4AAFCF] text-white shadow-md hover:shadow-lg transition-all"
        >
          <Bell className="mr-1.5 h-4 w-4" />
          Seguir y Notificarme
        </Button>
      )}

      {/* Subscribe Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border-[#D4E6F0]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <BellRing className="h-5 w-5" />
              ¡Sigue a EBEN EZER!
            </DialogTitle>
            <DialogDescription>
              Recibe notificaciones cuando se publiquen nuevas predicaciones, eventos, fotos, videos y anuncios.
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-6"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-center font-medium text-foreground">
                  ¡Suscrito exitosamente!
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Recibirás notificaciones de todo lo nuevo en la iglesia.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3 rounded-xl bg-[#EAF6FB] p-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Ingresa tu correo electrónico para recibir notificaciones. También puedes activar las notificaciones del navegador para alertas instantáneas.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tu nombre (opcional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 border-[#C8E0ED] focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      className="pl-9 border-[#C8E0ED] focus-visible:ring-primary/20"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 border-[#C8E0ED]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubscribe}
                    disabled={loading || !email}
                    className="flex-1 bg-gradient-to-r from-primary to-[#4AAFCF] text-white"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Procesando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Suscribirme
                      </span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  )
}
