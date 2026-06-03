'use client'

import { useAppStore } from '@/store'
import { Header } from '@/components/church/Header'
import { Footer } from '@/components/church/Footer'
import { MobileNav } from '@/components/church/MobileNav'
import { WhatsAppButton } from '@/components/church/WhatsAppButton'
import { AdminLoginDialog } from '@/components/church/AdminLoginDialog'
import { AdminPages } from '@/components/church/AdminPages'
import { HomePage } from '@/components/church/HomePage'
import { SermonPage } from '@/components/church/SermonPage'
import { YouthPage } from '@/components/church/YouthPage'
import { SundaySchoolPage } from '@/components/church/SundaySchoolPage'
import { EventsPage } from '@/components/church/EventsPage'
import { BiblePage } from '@/components/church/BiblePage'

export default function ChurchPage() {
  const { currentPage, isAdmin } = useAppStore()

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'predicaciones-domingos':
        return <SermonPage type="domingo" />
      case 'predicaciones-miercoles':
        return <SermonPage type="miercoles" />
      case 'jovenes':
        return <YouthPage />
      case 'escuelita':
        return <SundaySchoolPage />
      case 'eventos':
        return <EventsPage />
      case 'biblia':
        return <BiblePage />
      case 'admin-login':
        return <AdminLoginDialog />
      default:
        return <HomePage />
    }
  }

  const isAdminPage = currentPage.startsWith('admin')

  if (isAdminPage && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <AdminLoginDialog />
        </main>
        <Footer />
        <MobileNav />
        <WhatsAppButton />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {isAdminPage ? <AdminPages /> : renderPage()}
      </main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <MobileNav />}
      {!isAdminPage && <WhatsAppButton />}
    </div>
  )
}
