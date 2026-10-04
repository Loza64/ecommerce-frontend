import { useEffect, useRef, useState } from 'react'
import { decode } from 'blurhash'
import { cn } from '@/lib/utils'

export interface ImageWithBlurHashProps {
  src?: string
  blurHash?: string
  alt: string
  className?: string
}

const DECODE_SIZE = 32

export function ImageWithBlurHash({
  src,
  blurHash,
  alt,
  className,
}: ImageWithBlurHashProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setLoaded(false))
  }, [src])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!blurHash || !canvas) {
      return
    }

    try {
      const pixels = decode(blurHash, DECODE_SIZE, DECODE_SIZE)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return
      }
      const imageData = ctx.createImageData(DECODE_SIZE, DECODE_SIZE)
      imageData.data.set(pixels)
      ctx.putImageData(imageData, 0, 0)
    } catch (ex) {
      console.error(ex)
    }
  }, [blurHash])

  return (
    <div className={cn('relative h-full w-full', className)}>
      {blurHash && (
        <canvas
          ref={canvasRef}
          width={DECODE_SIZE}
          height={DECODE_SIZE}
          aria-hidden="true"
          className={cn(
            'absolute inset-0 h-full w-full scale-110 object-cover blur-lg transition-opacity duration-300',
            loaded ? 'opacity-0' : 'opacity-100'
          )}
        />
      )}

      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  )
}
