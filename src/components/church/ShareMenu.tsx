'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  Facebook,
  Instagram,
  Send,
  Music2,
  Mail,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const CHURCH_INFO = {
  title: 'Iglesia EBEN EZER',
  url: typeof window !== 'undefined' ? window.location.origin : '',
}

interface ShareMenuProps {
  /** URL to share. Defaults to current page */
  url?: string
  /** Title for the share. Defaults to church name */
  title?: string
  /** Text for social media shares */
  text?: string
  /** Variant: 'default' for full menu, 'mini' for compact icon buttons */
  variant?: 'default' | 'mini'
  /** Button label */
  label?: string
  /** Show as icon-only button */
  iconOnly?: boolean
}

interface ShareItem {
  name: string
  icon: React.ReactNode
  color: string
  bgHover: string
  action: () => void | Promise<void>
}

export function ShareMenu({
  url,
  title = CHURCH_INFO.title,
  text,
  variant = 'default',
  label = 'Compartir',
  iconOnly = false,
}: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const shareText = text || `Visita ${title} — Iglesia Cristiana, La Restauración`

  const getShareUrl = useCallback(
    (platform: string) => {
      const encodedUrl = encodeURIComponent(shareUrl)
      const encodedText = encodeURIComponent(shareText)
      const encodedTitle = encodeURIComponent(title)

      switch (platform) {
        case 'whatsapp':
          return `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`
        case 'facebook':
          return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        case 'telegram':
          return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
        case 'twitter':
          return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        case 'tiktok':
          return `https://www.tiktok.com/`
        case 'email':
          return `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`
        default:
          return shareUrl
      }
    },
    [shareUrl, shareText, title]
  )

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareUrl])

  const nativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        })
      } catch {
        // User cancelled or not supported
      }
    } else {
      setIsOpen(true)
    }
  }, [title, shareText, shareUrl])

  const shareItems: ShareItem[] = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'text-white',
      bgHover: 'hover:bg-green-600',
      action: () => window.open(getShareUrl('whatsapp'), '_blank'),
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      color: 'text-white',
      bgHover: 'hover:bg-blue-700',
      action: () => window.open(getShareUrl('facebook'), '_blank'),
    },
    {
      name: 'Instagram',
      icon: <Instagram className="h-5 w-5" />,
      color: 'text-white',
      bgHover: 'hover:bg-pink-600',
      action: () => {
        copyLink()
        const instagramText = encodeURIComponent(`${shareText}\n\n🔗 ${shareUrl}`)
        window.open(`https://www.instagram.com/`, '_blank')
      },
    },
    {
      name: 'Telegram',
      icon: <Send className="h-5 w-5" />,
      color: 'text-white',
      bgHover: 'hover:bg-sky-600',
      action: () => window.open(getShareUrl('telegram'), '_blank'),
    },
    {
      name: 'TikTok',
      icon: <Music2 className="h-5 w-5" />,
      color: 'text-white',
      bgHover: 'hover:bg-black',
      action: () => {
        copyLink()
        window.open('https://www.tiktok.com/', '_blank')
      },
    },
    {
      name: 'Correo',
      icon: <Mail className="h-5 w-5" />,
      color: 'text-white',
      bgHover: 'hover:bg-gray-600',
      action: () => window.open(getShareUrl('email'), '_self'),
    },
  ]

  // Mini variant: show compact inline share buttons
  if (variant === 'mini') {
    return (
      <div className="flex items-center gap-1.5">
        {shareItems.map((item) => (
          <motion.button
            key={item.name}
            onClick={item.action}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground transition-colors hover:text-foreground"
            title={item.name}
          >
            {item.icon}
          </motion.button>
        ))}
        <motion.button
          onClick={copyLink}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground transition-colors hover:text-foreground"
          title={copied ? '¡Copiado!' : 'Copiar enlace'}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </motion.button>
      </div>
    )
  }

  return (
    <>
      {/* Trigger button */}
      <Button
        onClick={nativeShare}
        variant="outline"
        size="sm"
        className="border-[#C8E0ED] text-primary hover:bg-[#EAF6FB]"
      >
        <Share2 className={iconOnly ? 'h-5 w-5' : 'mr-1.5 h-4 w-4'} />
        {!iconOnly && label}
      </Button>

      {/* Dropdown (shown when Web Share API is not available) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#D4E6F0] bg-white p-5 shadow-2xl sm:top-auto sm:left-auto sm:translate-x-0 sm:translate-y-0"
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <Share2 className="h-5 w-5 text-primary" />
                  Compartir
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Share preview */}
              <div className="mb-4 rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Compartiendo:</p>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                  {title}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {shareUrl}
                </p>
              </div>

              {/* Share grid */}
              <div className="grid grid-cols-3 gap-2">
                {shareItems.map((item, i) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      item.action()
                      setIsOpen(false)
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors ${item.bgHover}`}
                    style={{
                      backgroundColor: getPlatformColor(item.name),
                    }}
                  >
                    {item.icon}
                    <span className="text-[11px] font-medium text-white">
                      {item.name}
                    </span>
                  </motion.button>
                ))}

                {/* Copy Link */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyLink}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-gray-100 p-3 transition-colors hover:bg-gray-200"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600" />
                  )}
                  <span className="text-[11px] font-medium text-gray-600">
                    {copied ? '¡Copiado!' : 'Copiar'}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function getPlatformColor(name: string): string {
  const colors: Record<string, string> = {
    WhatsApp: '#25D366',
    Facebook: '#1877F2',
    Instagram: '#E4405F',
    Telegram: '#0088CC',
    TikTok: '#000000',
    Correo: '#6B7280',
  }
  return colors[name] || '#6B7280'
}
