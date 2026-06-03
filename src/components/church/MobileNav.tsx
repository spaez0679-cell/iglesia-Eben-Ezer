'use client'

import { Home, BookOpen, Users, Calendar, Book } from 'lucide-react'
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
      </div>
    </nav>
  )
}
