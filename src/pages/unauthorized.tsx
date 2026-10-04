import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { RoutesEnum } from '@/enum/routes..app'

export default function Unauthorized() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[var(--bg)] px-6 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
        <ShieldAlert size={26} />
      </span>
      <h1 className="m-0 text-lg font-bold text-[var(--text)]">
        No tienes acceso a esta sección
      </h1>
      <p className="m-0 max-w-[46ch] text-[13px] text-[var(--text-muted)]">
        Tu rol no tiene permisos suficientes para ver esta página. Si crees que
        es un error, contacta a un administrador.
      </p>
      <Link
        to={RoutesEnum.HOME}
        className="mt-2 rounded-[var(--radius-sm)] bg-[var(--primary)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--primary-contrast)] no-underline hover:bg-[var(--primary-hover)]"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
