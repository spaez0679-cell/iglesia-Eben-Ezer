'use client'

import { useState } from 'react'
import { X, Church } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/store'
import { useToast } from '@/hooks/use-toast'

export function AdminLoginDialog() {
  const { setCurrentPage, login } = useAppStore()
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(true)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor ingresa usuario y contraseña',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: 'Error de autenticación',
          description: data.error || 'Usuario o contraseña incorrectos',
          variant: 'destructive',
        })
        return
      }

      login(data.name)
      toast({
        title: '¡Bienvenido!',
        description: `Hola, ${data.name}`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Hubo un error al conectar con el servidor',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShowDialog(false)
    setCurrentPage('home')
  }

  return (
    <div className="page-transition flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#D4E6F0] shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F5EA]">
            <Church className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Panel de Administración
          </CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al panel
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-[#C8E0ED] focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#C8E0ED] focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full gradient-church text-white hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-muted-foreground"
            >
              Volver al inicio
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
