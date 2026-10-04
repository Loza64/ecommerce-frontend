import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { ImageOff, Plus, UploadCloud, X, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createLocalImageAsset,
  fileKey,
  revokeImageAsset,
  validateImageFile,
} from '@/lib/image'
import { ImageWithBlurHash } from '@/components/ui/ImageWithBlurHash'
import type ImageAsset from '@/models/app/photos/ImageAsset'

export interface ImageDropzoneProps {
  /** Mix of local picks ({ file, url }) and already-uploaded API items ({ id, url, blurHash }). */
  value: ImageAsset[]
  onChange: (value: ImageAsset[]) => void
  disabled?: boolean
  accept?: string
  maxSizeMB?: number
  /** Leave undefined for no limit. */
  maxFiles?: number
  multiple?: boolean
  id?: string
  onError?: (message: string) => void
}

function assetKey(asset: ImageAsset, index: number) {
  return asset.id ?? asset.url ?? `pending-${index}`
}

const REMOVE_ANIM_MS = 180

export function ImageDropzone({
  value,
  onChange,
  disabled = false,
  accept = 'image/*',
  maxSizeMB = 5,
  maxFiles,
  multiple = true,
  id,
  onError,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [removingKeys, setRemovingKeys] = useState<Set<string | number>>(
    new Set()
  )

  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const localUrlsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    value.forEach((asset) => {
      if (asset.url?.startsWith('blob:')) {
        localUrlsRef.current.add(asset.url)
      }
    })
  }, [value])

  useEffect(
    () => () => {
      localUrlsRef.current.forEach((url) => revokeImageAsset({ url }))
    },
    []
  )

  const isEmpty = value.length === 0
  const atLimit = maxFiles !== undefined && value.length >= maxFiles

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || disabled) {
      return
    }
    const incoming = Array.from(fileList)
    const room =
      maxFiles !== undefined ? maxFiles - value.length : incoming.length

    if (room <= 0) {
      onError?.(`Ya alcanzaste el máximo de ${maxFiles} imágenes.`)
      return
    }

    const accepted: ImageAsset[] = []
    const existingKeys = new Set(
      value.filter((a) => a.file).map((a) => fileKey(a.file!))
    )
    const seenInBatch = new Set<string>()

    for (const file of incoming) {
      if (accepted.length >= room) {
        onError?.(
          `Solo se agregaron ${room} de ${incoming.length} imágenes (máximo ${maxFiles}).`
        )
        break
      }

      const key = fileKey(file)
      if (existingKeys.has(key) || seenInBatch.has(key)) {
        onError?.(`"${file.name}" ya fue agregada.`)
        continue
      }

      const error = validateImageFile(file, { maxSizeMB, accept })
      if (error) {
        onError?.(error)
        continue
      }

      seenInBatch.add(key)
      accepted.push(createLocalImageAsset(file))
    }

    if (accepted.length) {
      onChange([...value, ...accepted])
    }
  }

  const openPicker = () => {
    if (!disabled && !atLimit) {
      inputRef.current?.click()
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled && !atLimit) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleRemove = (index: number) => {
    if (disabled) {
      return
    }
    const asset = value[index]
    const key = assetKey(asset, index)
    if (removingKeys.has(key)) {
      return
    }

    setRemovingKeys((prev) => new Set(prev).add(key))
    window.setTimeout(() => {
      if (asset.url?.startsWith('blob:')) {
        revokeImageAsset(asset)
        localUrlsRef.current.delete(asset.url)
      }
      onChange(value.filter((_, i) => i !== index))
      setRemovingKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }, REMOVE_ANIM_MS)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled && !atLimit) {
          setIsDragging(true)
        }
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'group relative flex flex-col gap-2.5 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-3 transition-colors duration-150',
        isDragging && 'border-[var(--primary)] bg-[var(--primary-soft)]',
        'hover:border-[var(--primary)]',
        disabled && 'opacity-60'
      )}
    >
      {isEmpty ? (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className={cn(
            'flex min-h-[160px] w-full flex-col items-center justify-center gap-1.5 rounded-[var(--radius-md)] py-6 text-center transition-colors duration-150',
            !disabled && 'cursor-pointer',
            disabled && 'cursor-not-allowed'
          )}
        >
          <UploadCloud
            size={28}
            className="animate-[icon-pop-in_0.3s_ease-out] text-[var(--text-muted)]"
          />
          <span className="text-[13px] font-semibold text-[var(--text)]">
            Sube un archivo
          </span>
          <span className="text-[12px] text-[var(--text-muted)]">
            o arrastra imágenes aquí
          </span>
        </button>
      ) : (
        <>
          {!atLimit && (
            <p className="m-0 text-center text-[12px] text-[var(--text-muted)]">
              Arrastra imágenes aquí o haz clic en{' '}
              <Plus size={11} className="inline align-[-1px]" /> para agregar
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {value.map((asset, index) => {
              const key = assetKey(asset, index)
              const isRemoving = removingKeys.has(key)

              return (
                <div
                  key={key}
                  className={cn(
                    'group/item relative aspect-square cursor-pointer overflow-hidden rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border)] bg-[var(--surface)] transition-colors duration-150',
                    'ease-in-out hover:border-[var(--primary)]',
                    isRemoving
                      ? 'animate-[rise-out_0.18s_ease-in]'
                      : 'animate-[rise-in_0.2s_ease-out]'
                  )}
                  onClick={() => asset.url && setPreviewImage(asset.url)}
                >
                  {asset.url ? (
                    <div className="h-full w-full transition-transform duration-200 group-hover/item:scale-105">
                      <ImageWithBlurHash
                        src={asset.url}
                        blurHash={asset.blurHash}
                        alt={asset.file?.name ?? `Imagen ${index + 1}`}
                      />
                      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 text-white opacity-0 transition-opacity duration-150 group-hover/item:opacity-100">
                        <Eye size={18} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageOff
                        size={20}
                        className="text-[var(--text-muted)]"
                      />
                    </div>
                  )}

                  {!disabled && !isRemoving && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(index)
                      }}
                      aria-label="Quitar imagen"
                      className="absolute top-1 right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] opacity-0 shadow-sm transition-[opacity,transform] duration-150 group-hover/item:opacity-100 hover:scale-110 hover:text-[var(--danger)]"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )
            })}

            {!disabled && !atLimit && (
              <button
                type="button"
                onClick={openPicker}
                aria-label="Agregar imágenes"
                className="flex aspect-square animate-[icon-pop-in_0.25s_ease-out] items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border)] text-[var(--text-muted)] transition-colors duration-150 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </>
      )}

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 flex animate-[fade-in_0.15s_ease-out] items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary-soft)]">
          <span className="text-[13px] font-semibold text-[var(--primary)]">
            Suelta las imágenes aquí
          </span>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex animate-[fade-in_0.2s_ease-out] items-center justify-center bg-black/70"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] p-2">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white transition-colors hover:text-gray-300"
              aria-label="Cerrar vista previa"
            >
              <X size={24} />
            </button>
            <img
              src={previewImage}
              alt="Vista previa ampliada"
              className="max-h-[85vh] max-w-[85vw] animate-[scale-in_0.2s_ease-out] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled || atLimit}
        onChange={handleInputChange}
      />
    </div>
  )
}
