'use client'

import {
  Church,
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  Facebook,
  Instagram,
  ExternalLink,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type Page } from '@/store'
import { FollowButton } from '@/components/church/FollowButton'

const CHURCH = {
  mapsLink: 'https://maps.app.goo.gl/bSMUhEHn2XLJ12q56',
  facebook: 'https://www.facebook.com/profile.php?id=61561282300406',
  instagram: 'https://www.instagram.com/eben_ezer.iglesia',
}

const quickLinks: { label: string; page: Page }[] = [
  { label: 'Predicaciones de Domingos', page: 'predicaciones-domingos' },
  { label: 'Predicaciones de Miércoles', page: 'predicaciones-miercoles' },
  { label: 'Reunión de Jóvenes', page: 'jovenes' },
  { label: 'Escuelita Dominical', page: 'escuelita' },
  { label: 'Eventos', page: 'eventos' },
  { label: 'Biblia', page: 'biblia' },
]

const scheduleItems = [
  { day: 'Domingo', time: '17:30 hs', label: 'Culto Principal' },
  { day: 'Miércoles', time: '20:00 hs', label: 'Estudio Bíblico' },
]

export function Footer() {
  const { setCurrentPage } = useAppStore()

  const socialLinks = [
    {
      icon: Facebook,
      url: CHURCH.facebook,
      label: 'Facebook',
      color: 'hover:bg-blue-600/20 hover:text-blue-400',
    },
    {
      icon: Instagram,
      url: CHURCH.instagram,
      label: 'Instagram',
      color: 'hover:bg-pink-600/20 hover:text-pink-400',
    },
  ]

  return (
    <footer className="mt-auto border-t border-[#D4E6F0] bg-[#1A4A5E] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Church Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Logo Iglesia EBEN EZER"
                className="h-11 w-11 rounded-full object-cover border-2 border-sky/30 shadow-sm"
              />
              <div>
                <h3 className="text-gradient-gold text-lg font-bold">
                  EBEN EZER
                </h3>
                <p className="text-xs text-white/60">Iglesia Cristiana</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Bienvenidos a la La Restauración. Somos una comunidad de fe que busca
              glorificar a Dios y servir a nuestros hermanos, bajo la dirección
              de los Pastores Oscar Aguero y Mónica Rosales.
            </p>
            {/* Social Media */}
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:bg-white/20 hover:scale-110`}
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </a>
                )
              })}
            </div>
            {/* Follow button in footer */}
            <div className="mt-4">
              <FollowButton />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => {
                      setCurrentPage(link.page)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="text-sm text-white/70 transition-colors hover:text-sky"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky">
              Ubicación
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={CHURCH.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-white/70 transition-colors hover:text-sky"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky/60" />
                  <span>
                    Iglesia EBEN EZER
                    <ExternalLink className="ml-1 inline-block h-3 w-3" />
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={CHURCH.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-blue-400"
                >
                  <Facebook className="h-4 w-4 shrink-0 text-sky/60" />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href={CHURCH.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-pink-400"
                >
                  <Instagram className="h-4 w-4 shrink-0 text-sky/60" />
                  <span>@eben_ezer.iglesia</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Schedule */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky">
              Horarios
            </h4>
            <div className="space-y-2.5">
              {scheduleItems.map((item, i) => (
                <p key={i} className="flex items-start gap-2 text-sm text-white/70">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sky/60" />
                  <span>
                    <strong className="text-white/90">{item.day}</strong>{' '}
                    {item.time} — {item.label}
                  </span>
                </p>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} Iglesia EBEN EZER. Todos los
            derechos reservados.
          </p>
          <p className="flex items-center gap-1 text-sm text-white/50">
            Hecho con{' '}
            <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" /> para la
            gloria de Dios
          </p>
        </div>
      </div>
    </footer>
  )
}
