'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export function ImageUpload({ value = [], onChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir imagen')
      return data.url as string
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al subir imagen'
      toast.error(msg)
      return null
    }
  }, [])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const remaining = maxImages - value.length
    if (remaining <= 0) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    const fileArray = Array.from(files).slice(0, remaining)
    setUploading(true)

    const newUrls: string[] = []
    for (const file of fileArray) {
      const url = await uploadFile(file)
      if (url) newUrls.push(url)
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls])
    }
    setUploading(false)
  }, [value, onChange, maxImages, uploadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const removeImage = useCallback((index: number) => {
    const newUrls = [...value]
    newUrls.splice(index, 1)
    onChange(newUrls)
  }, [value, onChange])

  return (
    <div className="space-y-3">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        } ${value.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground/70">
              JPG, PNG, WebP, GIF — Máximo {maxImages} imagen{maxImages !== 1 ? 'es' : ''}
            </p>
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border bg-muted">
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-24 object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
