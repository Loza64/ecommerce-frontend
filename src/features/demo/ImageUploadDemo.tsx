import { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { AvatarUploader } from '@/components/ui/AvatarUploader'
import { ImageDropzone } from '@/components/ui/ImageDropzone'
import type ImageAsset from '@/models/app/photos/ImageAsset'

export default function ImageUploadDemo() {
  const [modalOpen, setModalOpen] = useState(false)
  const [avatar, setAvatar] = useState<ImageAsset | null>(null)
  const [gallery, setGallery] = useState<ImageAsset[]>([])
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex max-w-[720px] flex-col gap-5">
      <header>
        <h2 className="m-0 mb-1 text-lg font-bold text-[var(--text)]">
          Componentes de imágenes
        </h2>
        <p className="m-0 max-w-[60ch] text-[13px] text-[var(--text-muted)]">
          Pantalla de ejemplo para ver `AvatarUploader` y `ImageDropzone` en
          acción antes de usarlos en un formulario real.
        </p>
      </header>

      <Button variant="primary" onClick={() => setModalOpen(true)}>
        <ImagePlus size={15} />
        Ver ejemplo
      </Button>

      <Modal
        open={modalOpen}
        title="Ejemplo: subida de imágenes"
        widthPx={560}
        onClose={() => setModalOpen(false)}
      >
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <FormField label="Avatar (objeto único)">
            <AvatarUploader
              value={avatar}
              onChange={setAvatar}
              onError={setError}
            />
          </FormField>

          <FormField
            label="Galería (arreglo, drag & drop)"
            hint="Puedes soltar varias imágenes a la vez."
          >
            <ImageDropzone
              value={gallery}
              onChange={setGallery}
              maxFiles={6}
              onError={setError}
            />
          </FormField>

          {error && <span className="form-error">{error}</span>}

          <div className="form-actions">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
