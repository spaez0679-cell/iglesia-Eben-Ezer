'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { AdminLayout } from './AdminLayout'
import { AdminDashboard } from './AdminDashboard'
import { AdminSermons } from './AdminSermons'
import { AdminEvents } from './AdminEvents'
import { AdminYouth } from './AdminYouth'
import { AdminSundaySchool } from './AdminSundaySchool'
import { AdminAnnouncements } from './AdminAnnouncements'
import { AdminChurchInfo } from './AdminChurchInfo'

export function AdminPages() {
  const { currentPage, isAdmin, setCurrentPage } = useAppStore()

  useEffect(() => {
    if (!isAdmin) {
      setCurrentPage('admin-login')
    }
  }, [isAdmin, setCurrentPage])

  if (!isAdmin) {
    return null
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'admin-dashboard':
        return <AdminDashboard />
      case 'admin-sermons':
        return <AdminSermons />
      case 'admin-events':
        return <AdminEvents />
      case 'admin-youth':
        return <AdminYouth />
      case 'admin-sundayschool':
        return <AdminSundaySchool />
      case 'admin-announcements':
        return <AdminAnnouncements />
      case 'admin-churchinfo':
        return <AdminChurchInfo />
      default:
        return <AdminDashboard />
    }
  }

  return <AdminLayout>{renderContent()}</AdminLayout>
}
