import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createLocalImageAsset,
  revokeImageAsset,
  validateImageFile,
} from '@/lib/image'
import { ImageWithBlurHash } from '@/components/ui/ImageWithBlurHash'
import type ImageAsset from '@/models/app/photos/ImageAsset'

export interface AvatarUploaderProps {
  value: ImageAsset | null
  onChange: (value: ImageAsset | null) => void
  disabled?: boolean
  accept?: string
  maxSizeMB?: number
  sizePx?: number
  id?: string
  onError?: (message: string) => void
}

const REMOVE_ANIM_MS = 180

export function AvatarUploader({
  value,
  onChange,
  disabled = false,
  accept = 'image/*',
  maxSizeMB = 5,
  sizePx = 96,
  id,
  onError,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const prevUrlRef = useRef(value?.url)

  useEffect(() => {
    if (prevUrlRef.current && prevUrlRef.current !== value?.url) {
      revokeImageAsset({ url: prevUrlRef.current })
    }
    prevUrlRef.current = value?.url
  }, [value?.url])

  useEffect(
    () => () => {
      if (prevUrlRef.current) {
        revokeImageAsset({ url: prevUrlRef.current })
      }
    },
    []
  )

  const pickFile = (file: File | undefined) => {
    if (!file || disabled) {
      return
    }
    const error = validateImageFile(file, { maxSizeMB, accept })
    if (error) {
      onError?.(error)
      return
    }
    setIsRemoving(false)
    onChange(createLocalImageAsset(file))
  }

  const openPicker = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      openPicker()
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    pickFile(e.target.files?.[0])
    e.target.value = ''
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled) {
      pickFile(e.dataTransfer.files?.[0])
    }
  }

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation()
    if (disabled || isRemoving) {
      return
    }
    setIsRemoving(true)
    window.setTimeout(() => {
      onChange(null)
      setIsRemoving(false)
    }, REMOVE_ANIM_MS)
  }

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        className="relative shrink-0"
        style={{ width: sizePx, height: sizePx }}
      >
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-label="Subir avatar"
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) {
              setIsDragging(true)
            }
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'group absolute inset-0 flex items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[var(--border)] bg-[var(--surface-muted)] transition-[transform,background-color,border-color] duration-150',
            !disabled && 'cursor-pointer hover:border-[var(--primary)]',
            isDragging &&
              'scale-105 border-[var(--primary)] bg-[var(--primary-soft)]',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          {value?.url ? (
            <div
              key={value.url}
              className={cn(
                'h-full w-full transition-transform duration-200 group-hover:scale-105',
                isRemoving
                  ? 'animate-[rise-out_0.18s_ease-in]'
                  : 'animate-[rise-in_0.2s_ease-out]'
              )}
            >
              <ImageWithBlurHash
                src={value.url}
                blurHash={value.blurHash}
                alt="Avatar"
              />
            </div>
          ) : (
            <Camera
              size={Math.max(20, sizePx * 0.28)}
              className="animate-[icon-pop-in_0.3s_ease-out] text-[var(--text-muted)]"
            />
          )}

          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity duration-150 group-hover:bg-black/40 group-hover:opacity-100">
              <Camera
                size={Math.max(18, sizePx * 0.22)}
                className="text-white"
              />
            </div>
          )}
        </div>

        {value && !disabled && !isRemoving && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Quitar avatar"
            className="absolute -top-1 -right-1 z-10 flex h-6 w-6 animate-[icon-pop-in_0.2s_ease-out] items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] shadow-[0_1px_4px_rgba(15,18,25,0.25)] transition-transform hover:scale-110 hover:text-[var(--danger)]"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={handleInputChange}
      />
    </div>
  )
}
