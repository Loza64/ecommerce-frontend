import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { formatMoney } from '@/lib/money'
import { attributesLabel } from '@/lib/product'
import {
  MAX_VARIANTS,
  variantFormSchema,
  type VariantFormValues,
} from '@/schemas/product'

export interface VariantDraft {
  sku: string
  price: number
  stockQuantity: number
  attributes: Record<string, string>
}

export interface VariantRow extends VariantDraft {
  /** id de base de datos, o clave local mientras el producto aún no se guarda */
  key: string | number
}

function toFormValues(row?: VariantRow): VariantFormValues {
  return {
    sku: row?.sku ?? '',
    price: row ? String(row.price) : '',
    stockQuantity: row ? String(row.stockQuantity) : '',
    attributes: row
      ? Object.entries(row.attributes).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : [],
  }
}

function toDraft(values: VariantFormValues): VariantDraft {
  return {
    sku: values.sku.trim(),
    price: Number(values.price),
    stockQuantity: Number(values.stockQuantity),
    attributes: Object.fromEntries(
      values.attributes
        .filter((attribute) => attribute.key.trim())
        .map((attribute) => [attribute.key.trim(), attribute.value.trim()])
    ),
  }
}

function VariantEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: VariantRow
  onSave: (draft: VariantDraft) => Promise<void>
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: toFormValues(initial),
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  })

  const submit = handleSubmit(async (values) => {
    setSaving(true)
    try {
      await onSave(toDraft(values))
    } catch {
      // el padre ya mostró el error; el editor se mantiene abierto
    } finally {
      setSaving(false)
    }
  })

  return (
    // no es un <form>: va dentro de un modal que ya tiene su propio formulario
    <div
      className="flex flex-col gap-3 rounded-(--radius-md) border border-(--primary) bg-(--surface) p-4"
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          event.preventDefault()
          void submit()
        }
      }}
    >
      <FormField label="SKU" htmlFor="variant-sku" error={errors.sku?.message}>
        <input
          id="variant-sku"
          className="field-input"
          type="text"
          {...register('sku')}
        />
      </FormField>

      <div className="auth-row">
        <FormField
          label="Precio"
          htmlFor="variant-price"
          error={errors.price?.message}
        >
          <input
            id="variant-price"
            className="field-input"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            {...register('price')}
          />
        </FormField>
        <FormField
          label="Stock"
          htmlFor="variant-stock"
          error={errors.stockQuantity?.message}
        >
          <input
            id="variant-stock"
            className="field-input"
            type="number"
            step="1"
            min="0"
            inputMode="numeric"
            {...register('stockQuantity')}
          />
        </FormField>
      </div>

      <FormField
        label="Atributos"
        hint="Opcional. Por ejemplo: Talla = M, Color = Rojo."
        error={errors.attributes?.message ?? errors.attributes?.root?.message}
      >
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                className="field-input"
                placeholder="Nombre"
                aria-label="Nombre del atributo"
                {...register(`attributes.${index}.key`)}
              />
              <input
                className="field-input"
                placeholder="Valor"
                aria-label="Valor del atributo"
                {...register(`attributes.${index}.value`)}
              />
              <Button
                variant="icon-danger"
                tooltip="Quitar atributo"
                onClick={() => remove(index)}
              >
                <X size={14} />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            className="self-start"
            onClick={() => append({ key: '', value: '' })}
          >
            <Plus size={14} />
            Agregar atributo
          </Button>
        </div>
      </FormField>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={saving}
          onClick={() => void submit()}
        >
          {saving ? 'Guardando...' : 'Guardar variante'}
        </Button>
      </div>
    </div>
  )
}

export interface VariantsManagerProps {
  variants: VariantRow[]
  onCreate: (draft: VariantDraft) => Promise<void>
  onUpdate: (row: VariantRow, draft: VariantDraft) => Promise<void>
  onRemove: (row: VariantRow) => Promise<void>
}

export function VariantsManager({
  variants,
  onCreate,
  onUpdate,
  onRemove,
}: VariantsManagerProps) {
  // 'new' = formulario de alta; una clave = edición de esa variante
  const [editing, setEditing] = useState<'new' | string | number | null>(null)
  const [confirmingRemove, setConfirmingRemove] = useState<
    string | number | null
  >(null)

  const close = () => setEditing(null)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-[13px] font-semibold text-(--text)">
          Variantes
        </h3>
        <span className="hint">
          {variants.length} de {MAX_VARIANTS}
        </span>
      </div>

      {variants.length === 0 && editing !== 'new' && (
        <p className="m-0 text-[13px] text-(--text-muted)">
          Cada producto necesita al menos una variante con su precio y stock.
        </p>
      )}

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {variants.map((row) =>
          editing === row.key ? (
            <li key={row.key}>
              <VariantEditor
                initial={row}
                onCancel={close}
                onSave={async (draft) => {
                  await onUpdate(row, draft)
                  close()
                }}
              />
            </li>
          ) : (
            <li
              key={row.key}
              className="flex items-center justify-between gap-3 rounded-(--radius-md) border border-(--border) px-3.5 py-2.5"
            >
              <div className="min-w-0 text-[13px]">
                <p className="m-0 font-semibold text-(--text)">{row.sku}</p>
                <p className="m-0 truncate text-xs text-(--text-muted)">
                  {attributesLabel(row.attributes) || 'Sin atributos'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right text-[13px]">
                  <p className="m-0 font-semibold">{formatMoney(row.price)}</p>
                  <p className="m-0 text-xs text-(--text-muted)">
                    Stock {row.stockQuantity}
                  </p>
                </div>
                {confirmingRemove === row.key ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="danger"
                      className="px-2.5 py-1.5"
                      onClick={async () => {
                        try {
                          await onRemove(row)
                        } finally {
                          setConfirmingRemove(null)
                        }
                      }}
                    >
                      Eliminar
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-2.5 py-1.5"
                      onClick={() => setConfirmingRemove(null)}
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <div className="row-actions">
                    <Button
                      variant="icon"
                      tooltip="Editar variante"
                      onClick={() => setEditing(row.key)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="icon-danger"
                      tooltip="Eliminar variante"
                      onClick={() => setConfirmingRemove(row.key)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </li>
          )
        )}
      </ul>

      {editing === 'new' ? (
        <VariantEditor
          onCancel={close}
          onSave={async (draft) => {
            await onCreate(draft)
            close()
          }}
        />
      ) : (
        <Button
          variant="ghost"
          className="self-start"
          disabled={variants.length >= MAX_VARIANTS}
          onClick={() => setEditing('new')}
        >
          <Plus size={15} />
          Agregar variante
        </Button>
      )}
    </section>
  )
}
