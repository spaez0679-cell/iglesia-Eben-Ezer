'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Church, Menu, X, ChevronDown, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type Page } from '@/store'
import { NotificationBell } from '@/components/church/NotificationBell'

const navItems = [
  { label: 'Inicio', page: 'home' as Page },
  {
    label: 'Predicaciones',
    children: [
      { label: 'Domingos', page: 'predicaciones-domingos' as Page },
      { label: 'Miércoles', page: 'predicaciones-miercoles' as Page },
    ],
  },
  { label: 'Jóvenes', page: 'jovenes' as Page },
  { label: 'Escuelita', page: 'escuelita' as Page },
  { label: 'Eventos', page: 'eventos' as Page },
  { label: 'Biblia', page: 'biblia' as Page },
]

export function Header() {
  const { currentPage, setCurrentPage } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigateTo = (page: Page) => {
    setCurrentPage(page)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="gradient-church shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <img
                src="/logo.png"
                alt="Logo Iglesia EBEN EZER"
                className="h-10 w-10 rounded-full object-cover border-2 border-sky/40 shadow-sm"
              />
              <div className="flex flex-col leading-none">
                <span className="text-gradient-gold text-lg font-bold tracking-wide">
                  EBEN EZER
                </span>
                <span className="text-[10px] font-medium tracking-widest text-white/70 uppercase">
                  Iglesia Cristiana
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) =>
                'children' in item && item.children ? (
                  <DropdownMenu key={item.label}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 gap-1"
                      >
                        {item.label}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="w-48 border-[#C8E0ED] bg-white"
                    >
                      {item.children.map((child) => (
                        <DropdownMenuItem
                          key={child.page}
                          onClick={() => navigateTo(child.page)}
                          className={`cursor-pointer text-sm ${
                            currentPage === child.page
                              ? 'bg-[#EAF6FB] text-primary font-medium'
                              : 'text-foreground'
                          }`}
                        >
                          {child.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <motion.button
                    key={item.page}
                    onClick={() => navigateTo(item.page)}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                      currentPage === item.page
                        ? 'text-white'
                        : 'text-white/80'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {currentPage === item.page && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-md bg-white/15"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </motion.button>
                )
              )}
            </nav>

            {/* Right side: Admin + Mobile menu */}
            <div className="flex items-center gap-1">
              <NotificationBell />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo('admin-login')}
                className="hidden sm:flex items-center gap-1.5 text-white/70 hover:text-white hover:bg-white/10 text-xs"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Button>

              {/* Mobile hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-72 bg-white p-0"
                >
                  <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                  <div className="gradient-church p-4">
                    <div className="flex items-center gap-2.5">
                      <img src="/logo.png" alt="Logo Iglesia EBEN EZER" className="h-8 w-8 rounded-full object-cover border-2 border-sky/30" />
                      <span className="text-gradient-gold text-lg font-bold">
                        EBEN EZER
                      </span>
                    </div>
                  </div>

                  <nav className="flex flex-col p-2">
                    {navItems.map((item) =>
                      'children' in item && item.children ? (
                        <div key={item.label}>
                          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {item.label}
                          </p>
                          {item.children.map((child) => (
                            <button
                              key={child.page}
                              onClick={() => navigateTo(child.page)}
                              className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                                currentPage === child.page
                                  ? 'bg-[#EAF6FB] font-medium text-primary'
                                  : 'text-foreground hover:bg-muted'
                              }`}
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          key={item.page}
                          onClick={() => navigateTo(item.page)}
                          className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                            currentPage === item.page
                              ? 'bg-[#EAF6FB] font-medium text-primary'
                              : 'text-foreground hover:bg-muted'
                          }`}
                        >
                          {item.label}
                        </button>
                      )
                    )}
                    <Separator className="my-2" />
                    <button
                      onClick={() => navigateTo('admin-login')}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted"
                    >
                      <Shield className="h-4 w-4" />
                      Administrador
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
