import type ImageAsset from '@/models/app/photos/ImageAsset'

export const DEFAULT_MAX_IMAGE_SIZE_MB = 5

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function isLocalPreviewUrl(url?: string): boolean {
  return !!url && url.startsWith('blob:')
}

export function validateImageFile(
  file: File,
  options: { maxSizeMB?: number; accept?: string } = {}
): string | null {
  const { maxSizeMB = DEFAULT_MAX_IMAGE_SIZE_MB, accept = 'image/*' } = options

  if (accept === 'image/*' && !isImageFile(file)) {
    return `"${file.name}" no es una imagen válida.`
  }

  const maxBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    return `"${file.name}" supera el tamaño máximo de ${maxSizeMB}MB.`
  }

  return null
}

export function createLocalImageAsset(file: File): ImageAsset {
  return { file, url: URL.createObjectURL(file) }
}

export function fileKey(file: File): string {
  return `${file.name}_${file.size}_${file.lastModified}`
}

export function revokeImageAsset(asset?: Pick<ImageAsset, 'url'> | null) {
  if (asset?.url && isLocalPreviewUrl(asset.url)) {
    URL.revokeObjectURL(asset.url)
  }
}
