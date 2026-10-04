/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_SERVICE: string
  readonly VITE_SECRET_KEY: string
  /** Clave pública de Stripe (pk_test_...). Sin ella el pago no está disponible. */
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
