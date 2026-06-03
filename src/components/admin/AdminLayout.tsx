'use client'

import { ReactNode } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Users,
  GraduationCap,
  Megaphone,
  Church,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore, type Page } from '@/store'

interface NavItem {
  label: string
  icon: React.ElementType
  page: Page
}

const navItems: NavItem[] = [
  { label: 'Panel Principal', icon: LayoutDashboard, page: 'admin-dashboard' },
  { label: 'Predicaciones', icon: BookOpen, page: 'admin-sermons' },
  { label: 'Eventos', icon: CalendarDays, page: 'admin-events' },
  { label: 'Jóvenes', icon: Users, page: 'admin-youth' },
  { label: 'Escuelita', icon: GraduationCap, page: 'admin-sundayschool' },
  { label: 'Anuncios', icon: Megaphone, page: 'admin-announcements' },
  { label: 'Información de Iglesia', icon: Church, page: 'admin-churchinfo' },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { currentPage, setCurrentPage, adminName, logout } = useAppStore()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Logo Iglesia EBEN EZER"
          className="w-10 h-10 rounded-lg object-cover border-2 border-white/20 flex-shrink-0"
        />
        <div className="min-w-0">
          <h1 className="text-white font-bold text-lg leading-tight truncate">EBEN EZER</h1>
          <p className="text-white/60 text-xs">Panel de Administración</p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.page
            const Icon = item.icon
            return (
              <button
                key={item.page}
                onClick={() => {
                  setCurrentPage(item.page)
                  onNavigate?.()
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}

          <Separator className="bg-white/10 my-3" />

          <button
            onClick={() => {
              setCurrentPage('home')
              onNavigate?.()
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5 flex-shrink-0" />
            <span className="truncate">Volver al Sitio</span>
          </button>
        </nav>
      </ScrollArea>

      {/* User / Logout */}
      <Separator className="bg-white/10" />
      <div className="p-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {adminName?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">{adminName}</p>
            <p className="text-white/50 text-xs">Administrador</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            logout()
            onNavigate?.()
          }}
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 gap-3 px-3"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0" style={{ backgroundColor: '#4A1A6B' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72" style={{ backgroundColor: '#4A1A6B' }}>
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar (mobile) */}
        <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo Iglesia EBEN EZER"
              className="h-6 w-6 rounded-full object-cover border border-[#4A1A6B]/20"
            />
            <span className="font-bold text-[#4A1A6B]">EBEN EZER</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
