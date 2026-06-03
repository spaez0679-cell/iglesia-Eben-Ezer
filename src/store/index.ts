import { create } from 'zustand'

export type Page =
  | 'home'
  | 'predicaciones-domingos'
  | 'predicaciones-miercoles'
  | 'jovenes'
  | 'escuelita'
  | 'eventos'
  | 'biblia'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-sermons'
  | 'admin-events'
  | 'admin-youth'
  | 'admin-sundayschool'
  | 'admin-announcements'
  | 'admin-churchinfo'

interface AppState {
  currentPage: Page
  isAdmin: boolean
  adminName: string | null
  sidebarOpen: boolean
  setCurrentPage: (page: Page) => void
  login: (name: string) => void
  logout: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'home',
  isAdmin: false,
  adminName: null,
  sidebarOpen: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  login: (name) => set({ isAdmin: true, adminName: name, currentPage: 'admin-dashboard' }),
  logout: () => set({ isAdmin: false, adminName: null, currentPage: 'home' }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
