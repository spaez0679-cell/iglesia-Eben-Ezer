'use client'

import { useState, useEffect } from 'react'
import { Home, BookOpen, Users, Calendar, Book, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore, type Page } from '@/store'

interface NavItem {
  icon: React.ReactNode
  label: string
  page: Page
}

const navItems: NavItem[] = [
  { icon: <Home className="h-5 w-5" />, label: 'Inicio', page: 'home' },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: 'Predicas',
    page: 'predicaciones-domingos',
  },
  { icon: <Users className="h-5 w-5" />, label: 'Jóvenes', page: 'jovenes' },
  {
    icon: <Calendar className="h-5 w-5" />,
    label: 'Eventos',
    page: 'eventos',
  },
  { icon: <Book className="h-5 w-5" />, label: 'Biblia', page: 'biblia' },
]

export function MobileNav() {
  const { currentPage, setCurrentPage } = useAppStore()
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  // Este useEffect detecta cuando el navegador está listo para instalar la app
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault() // Evitamos que el navegador muestre su propio cartel feo
      setInstallPrompt(e) // Guardamos el evento para usarlo después
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Esta función se ejecuta cuando el usuario toca "Descargar App"
  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt() // Mostramos el cartel nativo de instalar
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null) // Si la instaló, ocultamos el botón
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#D4E6F0] bg-white/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            item.page === 'home'
              ? currentPage === 'home'
              : currentPage.startsWith(item.page) ||
                currentPage === item.page

          return (
            <motion.button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavActive"
                  className="absolute inset-0 rounded-lg bg-[#EAF6FB]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10 text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </motion.button>
          )
        })}

        {/* BOTÓN DE DESCARGAR APP - Solo aparece si el dispositivo permite instalarla */}
        {installPrompt && (
          <motion.button
            onClick={handleInstallClick}
            className="relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-green-600 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <span className="relative z-10"><Download className="h-5 w-5" /></span>
            <span className="relative z-10 text-[10px] font-medium leading-tight">Instalar</span>
          </motion.button>
        )}
      </div>
    </nav>
  )
} 