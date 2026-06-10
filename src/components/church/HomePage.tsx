'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Church,
  Calendar,
  BookOpen,
  Users,
  Baby,
  PartyPopper,
  Book,
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  Play,
  Megaphone,
  ArrowRight,
  Facebook,
  Instagram,
  Share2,
  MessageCircle,
  ExternalLink,
  Navigation,
  Heart,
  Cross,
  UsersRound,
  Quote,
  Sparkles,
  HandHeart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type Page } from '@/store'
import { FollowButton } from '@/components/church/FollowButton'
import { ShareMenu } from '@/components/church/ShareMenu'

/* ─── Church Constants ─── */
const CHURCH = {
  name: 'EBEN EZER',
  subtitle: 'Iglesia Cristiana — La Restauración',
  pastors: 'Pastores Oscar Aguero y Mónica Rosales',
  mapsLink: 'https://maps.app.goo.gl/bSMUhEHn2XLJ12q56',
  mapsEmbed:
    'https://maps.google.com/maps?q=Iglesia+Eben+Ezer&z=15&ie=UTF8&iwloc=&output=embed',
  facebook: 'https://www.facebook.com/profile.php?id=61561282300406',
  instagram: 'https://www.instagram.com/eben_ezer.iglesia',
  schedule: [
    { day: 'Domingo', time: '17:30 hs', label: 'Culto Principal', icon: '🌅' },
    { day: 'Miércoles', time: '20:00 hs', label: 'Estudio Bíblico', icon: '📖' },
  ],
}

/* ─── Types ─── */
interface Announcement {
  id: string
  title: string
  content?: string
  isActive: boolean
}

interface Sermon {
  id: string
  title: string
  date: string
  preacher?: string
  type: string
  videoUrl?: string
  description?: string
}

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
}

const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const fadeRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
}

/* ─── Quick Nav Cards ─── */
const quickNavItems: {
  title: string
  description: string
  icon: React.ReactNode
  page: Page
  color: string
  bgColor: string
}[] = [
  {
    title: 'Predicaciones de los Domingos',
    description: 'Mensajes de cada domingo para edificar tu fe',
    icon: <Calendar className="h-6 w-6" />,
    page: 'predicaciones-domingos',
    color: 'text-primary',
    bgColor: 'bg-[#E6F5EA]',
  },
  {
    title: 'Predicaciones de los Miércoles',
    description: 'Estudios bíblicos de la semana',
    icon: <BookOpen className="h-6 w-6" />,
    page: 'predicaciones-miercoles',
    color: 'text-green-deep',
    bgColor: 'bg-[#D4E6F0]',
  },
  {
    title: 'Reunión de Jóvenes',
    description: 'Un espacio para la juventud con energía y fe',
    icon: <Users className="h-6 w-6" />,
    page: 'jovenes',
    color: 'text-green-medium',
    bgColor: 'bg-[#E6F5EA]',
  },
  {
    title: 'Escuelita Dominical',
    description: 'Enseñanza de la Palabra para los más pequeños',
    icon: <Baby className="h-6 w-6" />,
    page: 'escuelita',
    color: 'text-[#3D97B5]',
    bgColor: 'bg-[#E6F5EA]',
  },
  {
    title: 'Eventos',
    description: 'Próximos eventos y actividades especiales',
    icon: <PartyPopper className="h-6 w-6" />,
    page: 'eventos',
    color: 'text-accent',
    bgColor: 'bg-sky-light',
  },
  {
    title: 'Biblia',
    description: 'Lee la Palabra de Dios en cualquier momento',
    icon: <Book className="h-6 w-6" />,
    page: 'biblia',
    color: 'text-primary',
    bgColor: 'bg-[#E6F5EA]',
  },
]

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/hero-church.jpg"
          alt="Iglesia EBEN EZER"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Secondary overlay image (church/pastors) - subtle blend */}
      <div className="absolute inset-0 opacity-[0.07]">
        <img
          src="/pastors-main.jpg"
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
      </div>

      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(74,175,207,0.3) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="hero-overlay absolute inset-0" />

      <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Church Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: 'spring', stiffness: 150 }}
            className="mb-6 overflow-hidden rounded-full border-[3px] border-sky/50 shadow-xl sm:mb-8"
          >
            <img
              src="/logo.png"
              alt="Logo Iglesia EBEN EZER"
              className="h-20 w-20 object-cover sm:h-28 sm:w-28"
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-gradient-gold text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          >
            EBEN EZER
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-3 text-lg font-light tracking-widest text-white/80 sm:text-xl md:text-2xl"
          >
            Iglesia Cristiana — La Restauración
          </motion.p>

          {/* Pastors */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 backdrop-blur-sm"
          >
            <Heart className="h-4 w-4 text-sky" />
            <span className="text-sm font-medium text-white/90">
              {CHURCH.pastors}
            </span>
          </motion.div>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mt-6 h-px w-32 bg-gradient-to-r from-transparent via-primary to-transparent"
          />

          {/* Bible verse */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-6 max-w-lg text-sm italic text-white/60 sm:text-base"
          >
            &ldquo;Porque donde están dos o tres congregados en mi nombre, allí
            estoy yo en medio de ellos.&rdquo;
            <br />
            <span className="font-medium text-white/70">Mateo 18:20</span>
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 1.5, duration: 0.5 },
            y: { delay: 1.5, duration: 2, repeat: Infinity },
          }}
          className="absolute bottom-8"
        >
          <ChevronDown className="h-6 w-6 text-white/40" />
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Nuestros Pastores Section ─── */
function NuestrosPastoresSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#EAF6FB]/60 via-white to-white" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="mb-12 text-center"
        >
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10"
          >
            <HandHeart className="h-7 w-7 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
            Nuestros Pastores
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Guiados por la fe, llamados a servir
          </p>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-primary via-accent to-primary" />
        </motion.div>

        {/* Main content: two columns */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: Pastors Photo */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="order-1 flex justify-center lg:order-none"
          >
            {/* ARREGLADO: Agregado overflow-hidden para que la tarjetita no rompa la pantalla en celulares */}
            <div className="relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/15 via-accent/10 to-primary/15 blur-xl" />
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-sky/30 via-primary/20 to-accent/30" />

              {/* Photo frame */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-sky/30 shadow-2xl">
                <img
                  src="/pastors-main.jpg"
                  alt="Pastores Oscar Aguero y Mónica Rosales"
                  className="h-auto w-full max-w-lg object-cover sm:max-w-none"
                  loading="lazy"
                />

                {/* Gold accent overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4">
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 backdrop-blur-md">
                    <img
                      src="/logo.png"
                      alt=""
                      className="h-5 w-5 rounded-full border border-white/30"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-white tracking-wide">
                      Iglesia EBEN EZER
                    </span>
                  </div>
                </div>
              </div>

              {/* ARREGLADO: Tarjeta flotante ajustada para no salirse en celulares pequeños */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute right-2 bottom-2 z-10 rounded-xl bg-white p-3 shadow-lg border border-[#D4E6F0] sm:-right-4 sm:-bottom-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Servimos con amor</p>
                    <p className="text-[10px] text-muted-foreground">Desde el corazón</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="order-2 lg:order-none"
          >
            {/* Pastors names */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-accent to-primary" />
                <span className="text-sm font-semibold uppercase tracking-widest text-accent">
                  Pastores
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                Oscar Aguero
              </h3>
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                y{' '}
                <span className="text-gradient-gold">Mónica Rosales</span>
              </h3>
            </div>

            {/* Decorative separator */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-[#C8E0ED] to-transparent" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F5EA]">
                <Cross className="h-4 w-4 text-primary" />
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-[#C8E0ED] to-transparent" />
            </div>

            {/* Bio / Welcome message */}
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Con un llamado profundo en sus corazones, los Pastores{' '}
                <span className="font-semibold text-primary">Oscar Aguero</span> y{' '}
                <span className="font-semibold text-primary">Mónica Rosales</span>{' '}
                lideran la Iglesia Cristiana EBEN EZER con dedicación, amor y una fe inquebrantable.
                Su ministerio se caracteriza por la cercanía con cada miembro de la congregación,
                creando un ambiente familiar donde cada persona es valorada y acogida.
              </p>
              <p>
                Juntos, han construido una comunidad donde la Palabra de Dios es el fundamento,
                la oración es el motor y el amor fraternal es el sello que nos identifica como
                familia en Cristo. Su visión es ver a cada creyente crecer, desarrollarse y
                cumplir el propósito que Dios tiene para su vida.
              </p>
            </div>

            {/* Bible verse card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="mt-8"
            >
              <div className="rounded-2xl border border-[#D4E6F0] bg-gradient-to-br from-[#EAF6FB]/80 via-white to-[#E6F5EA]/30 p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Quote className="h-5 w-5 text-accent" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Palabra de Vida
                  </span>
                </div>
                <p className="text-base italic leading-relaxed text-foreground sm:text-lg">
                  &ldquo;Apacientad la grey de Dios que está entre vosotros, no por fuerza,
                  sino voluntariamente; no por ganancia deshonesta, sino con ánimo pronto.&rdquo;
                </p>
                <p className="mt-2 text-sm font-semibold text-primary">
                  1 Pedro 5:2
                </p>
              </div>
            </motion.div>

            {/* ARREGLADO: Ministry highlights. Cambiado a 1 columna en celulares chicos, 2 en normales */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
            >
              {[
                {
                  icon: <BookOpen className="h-5 w-5" />,
                  title: 'Enseñanza',
                  desc: 'Palabra con unción',
                  color: 'bg-[#E6F5EA] text-primary',
                },
                {
                  icon: <Heart className="h-5 w-5" />,
                  title: 'Pastoreo',
                  desc: 'Cercanía y cuidado',
                  color: 'bg-rose-100 text-rose-600',
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  title: 'Liderazgo',
                  desc: 'Guía espiritual',
                  color: 'bg-[#E6F5EA] text-[#3D97B5]',
                },
                {
                  icon: <Sparkles className="h-5 w-5" />,
                  title: 'Fe',
                  desc: 'Confianza en Dios',
                  color: 'bg-[#E6F5EA] text-accent',
                },
              ].map((item, i) => (
                <motion.div key={item.title} variants={fadeUp} custom={i}>
                  <div className="flex items-center gap-3 rounded-xl border border-[#D4E6F0]/60 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/20 sm:p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom decorative gallery strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="mt-16 overflow-hidden rounded-2xl border border-[#D4E6F0] shadow-lg"
        >
          <div className="relative aspect-[21/9] w-full">
            <img
              src="/church-institutional.jpg"
              alt="Iglesia EBEN EZER - Nuestra familia de fe"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A4A5E]/50 via-[#1A4A5E]/30 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex items-center p-6 sm:p-10">
              <div className="max-w-md">
                <p className="text-sm font-semibold uppercase tracking-widest text-sky sm:text-base">
                  Bienvenidos a la Familia
                </p>
                <p className="mt-2 text-lg font-bold text-white sm:text-2xl">
                  Somos EBEN EZER, La Restauración
                </p>
                <p className="mt-2 text-sm text-white/80 sm:text-base">
                  Un lugar de encuentro, fe y esperanza para toda la familia.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Welcome Section ─── */
function WelcomeSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="glass-card mx-auto max-w-3xl rounded-2xl p-8 text-center shadow-lg sm:p-10"
        >
          {/* Church photo thumbnail */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto mb-6 overflow-hidden rounded-2xl border-2 border-sky/20 shadow-md"
          >
            <img
              src="/pastors-card.jpg"
              alt="Iglesia EBEN EZER - Comunidad de fe"
              className="h-32 w-full object-cover sm:h-40"
              loading="lazy"
            />
          </motion.div>

          <h2 className="text-3xl font-bold text-primary sm:text-4xl">
            Bienvenidos a Nuestra Familia
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent" />

          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            ¡Gracias por visitarnos! En la Iglesia Cristiana EBEN EZER, creemos
            que la casa de Dios es un lugar de encuentro, fe y esperanza. Aquí
            encontrarás un hogar espiritual donde puedes crecer en la
            Palabra, conectar con hermanos y experimentar el amor de Dios. Bajo
            la guía de nuestros pastores,{' '}
            <span className="font-semibold text-primary">
              Oscar Aguero y Mónica Rosales
            </span>
            , te invitamos a ser parte de nuestra familia y a caminar juntos en
            la fe.
          </p>

          {/* Quick action buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={CHURCH.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              <Navigation className="h-4 w-4" />
              Cómo Llegar
            </a>
            <a
              href={CHURCH.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#C8E0ED] bg-white px-5 py-2.5 text-sm font-medium text-primary shadow-sm transition-all hover:bg-[#EAF6FB] hover:shadow-md"
            >
              <Facebook className="h-4 w-4" />
              Síguenos
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Schedule Section ─── */
function ScheduleSection() {
  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">
            Horarios de Reuniones
          </h2>
          <p className="mt-2 text-muted-foreground">
            Te esperamos con los brazos abiertos
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {CHURCH.schedule.map((item, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <Card className="group overflow-hidden border-[#D4E6F0] transition-all hover:border-primary/20 hover:shadow-xl">
                {/* Gradient top bar */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-green-medium to-accent" />
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary">{item.day}</h3>
                  <p className="mt-1 text-2xl font-extrabold text-green-medium">
                    {item.time}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional info */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={2}
          className="mx-auto mt-8 max-w-2xl text-center"
        >
          <p className="text-sm text-muted-foreground">
            <Clock className="mr-1 inline-block h-3.5 w-3.5" />
            Te invitamos a llegar unos minutos antes para compartir en
            comunión.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Quick Navigation Cards ─── */
function QuickNavSection() {
  const { setCurrentPage } = useAppStore()

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">
            Explora Nuestra Iglesia
          </h2>
          <p className="mt-2 text-muted-foreground">
            Descubre todo lo que tenemos para ti
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6"
        >
          {quickNavItems.map((item, i) => (
            <motion.button
              key={item.page}
              variants={fadeUp}
              custom={i}
              onClick={() => setCurrentPage(item.page)}
              className="group text-left"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="h-full border-[#D4E6F0] transition-all duration-300 group-hover:border-primary/20 group-hover:shadow-lg">
                <CardContent className="flex items-start gap-4 p-6">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bgColor} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <span className={item.color}>{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Ver más <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Featured Sermons Section ─── */
function FeaturedSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sermons')
      .then((res) => res.json())
      .then((data) => {
        setSermons(Array.isArray(data) ? data.slice(0, 2) : [])
      })
      .catch(() => setSermons([]))
      .finally(() => setLoading(false))
  }, [])

  const { setCurrentPage } = useAppStore()

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  if (!loading && sermons.length === 0) return null

  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="mb-10 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F5EA]">
              <Play className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary sm:text-3xl">
                Últimas Predicaciones
              </h2>
              <p className="text-sm text-muted-foreground">
                Mensajes recientes para tu vida espiritual
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage('predicaciones-domingos')}
            className="hidden sm:flex border-[#C8E0ED] text-primary hover:bg-[#EAF6FB]"
          >
            Ver todas <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {sermons.map((sermon, i) => (
              <motion.div key={sermon.id} variants={fadeUp} custom={i}>
                <Card className="group cursor-pointer border-[#D4E6F0] transition-all hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <Badge
                        variant="secondary"
                        className="bg-[#E6F5EA] text-primary"
                      >
                        {sermon.type === 'domingo' ? 'Domingo' : 'Miércoles'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(sermon.date)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {sermon.title}
                    </h3>
                    {sermon.preacher && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Por: {sermon.preacher}
                      </p>
                    )}
                    {sermon.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {sermon.description}
                      </p>
                    )}
                    {sermon.videoUrl && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                        <Play className="h-3 w-3" />
                        Incluye video
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile "Ver todas" button */}
        {!loading && sermons.length > 0 && (
          <div className="mt-6 text-center sm:hidden">
            <Button
              variant="outline"
              onClick={() => setCurrentPage('predicaciones-domingos')}
              className="border-[#C8E0ED] text-primary hover:bg-[#EAF6FB]"
            >
              Ver todas las predicaciones
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── Announcements Section ─── */
function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(Array.isArray(data) ? data : [])
      })
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && announcements.length === 0) return null

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="mb-10 flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F5EA]">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary sm:text-3xl">
              Anuncios
            </h2>
            <p className="text-sm text-muted-foreground">
              Novedades y comunicados importantes
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {announcements.map((a, i) => (
              <motion.div key={a.id} variants={fadeUp} custom={i}>
                <Card className="border-accent/20 bg-gradient-to-r from-[#E6F5EA]/30 to-white">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5 shrink-0 bg-accent/10 text-accent-foreground hover:bg-accent/20">
                        Nuevo
                      </Badge>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {a.title}
                        </h3>
                        {a.content && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {a.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

/* ─── Social Media & Action Buttons Section ─── */
function SocialMediaSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="mb-6 text-center"
        >
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">
            Síguenos y Conecta
          </h2>
          <p className="mt-2 text-muted-foreground">
            Estamos en redes sociales y siempre disponibles para ti
          </p>
        </motion.div>

        {/* Follow + Share row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
          className="mb-8 flex flex-wrap items-center justify-center gap-3"
        >
          <FollowButton />
          <ShareMenu
            title="Iglesia EBEN EZER"
            text="Visita la Iglesia Cristiana EBEN EZER — La Restauración. Predicaciones, eventos, y más."
            label="Compartir página"
          />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Facebook Button */}
          <motion.a
            href={CHURCH.facebook}
            target="_blank"
            rel="noopener noreferrer"
            variants={fadeUp}
            custom={0}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="group"
          >
            <Card className="overflow-hidden border-blue-100 transition-all hover:shadow-lg hover:border-blue-300">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 transition-transform group-hover:scale-110">
                  <Facebook className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Facebook</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Síguenos en Facebook
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors group-hover:bg-blue-100">
                  Seguir <ExternalLink className="h-3 w-3" />
                </span>
              </CardContent>
            </Card>
          </motion.a>

          {/* Instagram Button */}
          <motion.a
            href={CHURCH.instagram}
            target="_blank"
            rel="noopener noreferrer"
            variants={fadeUp}
            custom={1}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="group"
          >
            <Card className="overflow-hidden border-pink-100 transition-all hover:shadow-lg hover:border-pink-300">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400" />
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EAF6FB] to-pink-50 transition-transform group-hover:scale-110">
                  <Instagram className="h-7 w-7 text-pink-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Instagram</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    @eben_ezer.iglesia
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#EAF6FB] to-pink-50 px-3 py-1 text-xs font-medium text-pink-600 transition-colors group-hover:from-[#E6F5EA] group-hover:to-pink-100">
                  Seguir <ExternalLink className="h-3 w-3" />
                </span>
              </CardContent>
            </Card>
          </motion.a>

          {/* Google Maps Button */}
          <motion.a
            href={CHURCH.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            variants={fadeUp}
            custom={2}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="group"
          >
            <Card className="overflow-hidden border-green-100 transition-all hover:shadow-lg hover:border-green-300">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 transition-transform group-hover:scale-110">
                  <Navigation className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Ubicación</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Abrir en Google Maps
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600 transition-colors group-hover:bg-green-100">
                  Cómo llegar <ExternalLink className="h-3 w-3" />
                </span>
              </CardContent>
            </Card>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Contact & Location Section with Embedded Map ─── */
function ContactLocationSection() {
  return (
    <section id="contacto" className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">
            Visítanos
          </h2>
          <p className="mt-2 text-muted-foreground">
            Te esperamos en nuestra La Restauración
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Map */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <Card className="overflow-hidden border-[#D4E6F0] shadow-lg">
              <div className="relative aspect-[4/3] w-full">
                <iframe
                  src={CHURCH.mapsEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Iglesia EBEN EZER"
                  className="absolute inset-0"
                />
              </div>
              <CardContent className="p-4">
                <a
                  href={CHURCH.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  <Navigation className="h-4 w-4" />
                  Abrir en Google Maps
                </a>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact info */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {/* Address card */}
            <motion.div variants={fadeUp} custom={0}>
              <Card className="border-[#D4E6F0] transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E6F5EA]">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Ubicación</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Iglesia Cristiana EBEN EZER
                    </p>
                    <a
                      href={CHURCH.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Ver en Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pastors card */}
            <motion.div variants={fadeUp} custom={1}>
              <Card className="border-[#D4E6F0] transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <img
                    src="/pastors-thumb.jpg"
                    alt="Pastores"
                    className="h-12 w-12 shrink-0 rounded-xl object-cover border border-sky/20"
                  />
                  <div>
                    <p className="font-semibold text-foreground">Pastores</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Oscar Aguero y Mónica Rosales
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Schedule card */}
            <motion.div variants={fadeUp} custom={2}>
              <Card className="border-[#D4E6F0] transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F5EA]">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground">
                      Horarios de Reuniones
                    </p>
                  </div>
                  <div className="space-y-2">
                    {CHURCH.schedule.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.day} — {item.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Social links row */}
            <motion.div variants={fadeUp} custom={3}>
              <Card className="border-[#D4E6F0]">
                <CardContent className="p-5">
                  <p className="mb-3 text-sm font-semibold text-foreground">
                    Síguenos en Redes Sociales
                  </p>
                  <div className="flex items-center gap-3">
                    {/* Facebook */}
                    <a
                      href={CHURCH.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-100 hover:shadow-sm"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="hidden sm:inline">Facebook</span>
                    </a>
                    {/* Instagram */}
                    <a
                      href={CHURCH.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#EAF6FB] to-pink-50 px-4 py-2.5 text-sm font-medium text-pink-600 transition-all hover:from-[#E6F5EA] hover:to-pink-100 hover:shadow-sm"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="hidden sm:inline">Instagram</span>
                    </a>
                    {/* Share */}
                    <button
                      onClick={async () => {
                        if (typeof navigator !== 'undefined' && navigator.share) {
                          try {
                            await navigator.share({
                              title: 'Iglesia EBEN EZER',
                              text: 'Visita la Iglesia Cristiana EBEN EZER',
                              url: window.location.href,
                            })
                          } catch {
                            // Cancelled
                          }
                        } else {
                          try {
                            await navigator.clipboard.writeText(
                              window.location.href
                            )
                            alert('¡Enlace copiado!')
                          } catch {
                            // Fail silently
                          }
                        }
                      }}
                      className="flex items-center gap-2 rounded-xl bg-[#EAF6FB] px-4 py-2.5 text-sm font-medium text-primary transition-all hover:bg-[#E6F5EA] hover:shadow-sm"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Compartir</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── Main HomePage ─── */
export function HomePage() {
  return (
    // ARREGLADO: Agregado overflow-x-hidden para que nada se salga de la pantalla en celulares
    <div className="overflow-x-hidden pb-16 md:pb-0">
      <HeroSection />
      <WelcomeSection />
      <NuestrosPastoresSection />
      <ScheduleSection />
      <QuickNavSection />
      <FeaturedSermons />
      <AnnouncementsSection />
      <SocialMediaSection />
      <ContactLocationSection />
    </div>
  )
} 