import { useMemo, useState } from 'react'
import { Moon, Sun, Undo2 } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import {
  THEME_COLOR_FIELDS,
  buildThemeBaseVars,
  type Theme,
} from '@/models/app/theme'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ColorField } from '@/components/ui/ColorField'

export default function SettingsPage() {
  const {
    theme: activeTheme,
    setTheme,
    palette,
    setColor,
    resetMode,
    resetAll,
  } = useTheme()

  const [activeTab, setActiveTab] = useState<Theme>(activeTheme)

  const currentPalette = palette(activeTab)

  const previewStyles = useMemo(
    () => buildThemeBaseVars(currentPalette),
    [currentPalette]
  ) as React.CSSProperties

  return (
    <div className="flex max-w-[1100px] flex-col gap-5">
      <header>
        <h2 className="m-0 mb-1 text-lg font-bold text-[var(--text)]">
          Personaliza los colores
        </h2>
        <p className="m-0 max-w-[60ch] text-[13px] text-[var(--text-muted)]">
          Elige los colores del panel para el modo claro y el modo oscuro. Los
          cambios se aplican al instante y se guardan en este navegador, así que
          no se pierden al recargar.
        </p>
      </header>

      <div
        role="tablist"
        className="inline-flex w-fit gap-1 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'light'}
          onClick={() => setActiveTab('light')}
          className={`inline-flex items-center gap-2 rounded-[var(--radius-sm)] border-none px-3.5 py-2 text-[13px] font-semibold transition-colors ${
            activeTab === 'light'
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Sun size={15} />
          Modo claro
          {activeTheme === 'light' && (
            <span className="rounded-full bg-[var(--primary-soft)] px-[7px] py-px text-[10.5px] font-bold tracking-wide text-[var(--primary)] uppercase">
              Activo ahora
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'dark'}
          onClick={() => setActiveTab('dark')}
          className={`inline-flex items-center gap-2 rounded-[var(--radius-sm)] border-none px-3.5 py-2 text-[13px] font-semibold transition-colors ${
            activeTab === 'dark'
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Moon size={15} />
          Modo oscuro
          {activeTheme === 'dark' && (
            <span className="rounded-full bg-[var(--primary-soft)] px-[7px] py-px text-[10.5px] font-bold tracking-wide text-[var(--primary)] uppercase">
              Activo ahora
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 min-[901px]:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
        <div className="grid grid-cols-1 gap-2.5 min-[640px]:grid-cols-2">
          {THEME_COLOR_FIELDS.map((field) => (
            <ColorField
              key={field.key}
              label={field.label}
              hint={field.hint}
              value={currentPalette[field.key]}
              onValueChange={(value) => setColor(activeTab, field.key, value)}
            />
          ))}
        </div>

        <div className="sticky top-4 flex flex-col gap-2 max-[900px]:static min-[901px]:sticky">
          <span className="text-xs font-semibold tracking-[0.03em] text-[var(--text-muted)] uppercase">
            Vista previa en vivo
          </span>

          <div
            className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg)]"
            data-theme={activeTab}
            style={previewStyles}
          >
            <div className="flex min-h-[260px]">
              <aside className="flex w-24 flex-shrink-0 flex-col gap-1.5 bg-[var(--sidebar-bg)] p-2 text-[var(--sidebar-text)]">
                <span className="mb-2 inline-flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[var(--primary)] text-[11px] font-bold text-[var(--primary-contrast)]">
                  A
                </span>
                <div className="flex items-center gap-1.5 rounded-md bg-white/[0.08] px-[7px] py-1.5 text-[11px] font-semibold text-[var(--sidebar-text-active)]">
                  Usuarios
                </div>
                <div className="flex items-center gap-1.5 rounded-md px-[7px] py-1.5 text-[11px] text-[var(--sidebar-text)]">
                  Roles
                </div>
                <div className="flex items-center gap-1.5 rounded-md px-[7px] py-1.5 text-[11px] text-[var(--sidebar-text)]">
                  Permisos
                </div>
              </aside>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-b border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs font-semibold text-[var(--text)]">
                  Panel de administración
                </div>

                <div className="m-3.5 flex flex-col gap-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="success">Activo</Badge>
                    <Badge variant="danger">Bloqueado</Badge>
                    <span className="inline-flex items-center rounded-full bg-[var(--warning-soft)] px-2.5 py-[3px] text-xs font-semibold text-[var(--warning)]">
                      Pendiente
                    </span>
                  </div>

                  <p className="m-0 text-[12.5px] text-[var(--text-muted)]">
                    Así se verán el texto y las tarjetas con esta paleta.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary">Botón primario</Button>
                    <Button variant="ghost">Botón secundario</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 border-t border-[var(--border)] pt-1">
        <Button variant="ghost" onClick={() => resetMode(activeTab)}>
          <Undo2 size={14} />
          Restablecer {activeTab === 'dark' ? 'modo oscuro' : 'modo claro'}
        </Button>

        <Button variant="ghost" onClick={resetAll}>
          <Undo2 size={14} />
          Restablecer todo
        </Button>

        <span className="flex-1" />

        {activeTheme !== activeTab && (
          <Button variant="primary" onClick={() => setTheme(activeTab)}>
            Usar {activeTab === 'dark' ? 'modo oscuro' : 'modo claro'} ahora
          </Button>
        )}
      </div>
    </div>
  )
}
