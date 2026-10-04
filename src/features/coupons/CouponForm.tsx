import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useCrud from '@/hooks/core/useCrud'
import { couponService } from '@/api'
import type Service from '@/sdk/core/Service'
import Coupon from '@/models/entities/Coupon'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { couponFormSchema, type CouponFormValues } from '@/schemas/coupon'
import { fromDatetimeLocal, toDatetimeLocal } from '@/lib/date'
import errorResponse from '@/utils/errorResponse'

export interface CouponFormProps {
  couponId: string | number | null
  /** Por defecto el servicio de administración; el vendedor usa `coupons/mine` */
  service?: Service<Coupon>
  queryKey?: string
  onSaved: () => void
  onCancelled: () => void
}

export function CouponForm({
  couponId,
  service = couponService,
  queryKey = 'coupons',
  onSaved,
  onCancelled,
}: CouponFormProps) {
  const crud = useCrud<Coupon>({ service, queryKey })
  const [formError, setFormError] = useState<string | null>(null)
  const saving = crud.isCreating || crud.isUpdating
  const isEditing = couponId !== null && couponId !== undefined

  const { data: editCoupon, isLoading: loadingEdit } = crud.useFindById({
    id: couponId ?? '',
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: '',
      discountType: 'percentage',
      discountValue: '',
      expirationDate: '',
      maxUses: '',
      maxUsesPerUser: '',
    },
  })

  const discountType = useWatch({ control, name: 'discountType' })

  useEffect(() => {
    if (editCoupon && isEditing) {
      reset({
        code: editCoupon.code,
        discountType: editCoupon.discountType,
        discountValue: String(editCoupon.discountValue),
        expirationDate: toDatetimeLocal(editCoupon.expirationDate),
        maxUses: String(editCoupon.maxUses ?? ''),
        maxUsesPerUser: String(editCoupon.maxUsesPerUser ?? ''),
      })
    }
  }, [editCoupon, isEditing, reset])

  const onSubmit = async (values: CouponFormValues) => {
    setFormError(null)
    const payload: Partial<Coupon> = {
      code: values.code.toUpperCase(),
      discountType: values.discountType,
      discountValue: Number(values.discountValue),
      expirationDate: fromDatetimeLocal(values.expirationDate),
      // vacío = sin límite (null también borra un límite al editar)
      maxUses: values.maxUses === '' ? null : Number(values.maxUses),
      maxUsesPerUser:
        values.maxUsesPerUser === '' ? null : Number(values.maxUsesPerUser),
    }

    try {
      if (isEditing) {
        await crud.update({ id: couponId, payload })
      } else {
        await crud.create({ payload: payload as Coupon })
      }
      onSaved()
    } catch (error) {
      setFormError(errorResponse({ error, alert: false }).message)
    }
  }

  if (isEditing && loadingEdit) {
    return <div className="form-loading-state">Cargando datos del cupón...</div>
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField
        label="Código"
        htmlFor="coupon-code"
        hint="Se guarda en mayúsculas."
        error={errors.code?.message}
      >
        <input
          id="coupon-code"
          className="field-input"
          type="text"
          autoCapitalize="characters"
          {...register('code')}
        />
      </FormField>

      <div className="auth-row">
        <FormField label="Tipo de descuento" htmlFor="coupon-type">
          <select
            id="coupon-type"
            className="field-input"
            {...register('discountType')}
          >
            <option value="percentage">Porcentaje</option>
            <option value="fixed">Monto fijo</option>
          </select>
        </FormField>

        <FormField
          label={discountType === 'percentage' ? 'Porcentaje (%)' : 'Monto'}
          htmlFor="coupon-value"
          error={errors.discountValue?.message}
        >
          <input
            id="coupon-value"
            className="field-input"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            {...register('discountValue')}
          />
        </FormField>
      </div>

      <FormField
        label="Vence el"
        htmlFor="coupon-expiration"
        error={errors.expirationDate?.message}
      >
        <input
          id="coupon-expiration"
          className="field-input"
          type="datetime-local"
          {...register('expirationDate')}
        />
      </FormField>

      <div className="auth-row">
        <FormField
          label="Usos totales"
          htmlFor="coupon-max-uses"
          hint="Vacío = sin límite."
          error={errors.maxUses?.message}
        >
          <input
            id="coupon-max-uses"
            className="field-input"
            type="number"
            step="1"
            min="1"
            inputMode="numeric"
            {...register('maxUses')}
          />
        </FormField>

        <FormField
          label="Usos por comprador"
          htmlFor="coupon-max-uses-user"
          hint="Vacío = sin límite."
          error={errors.maxUsesPerUser?.message}
        >
          <input
            id="coupon-max-uses-user"
            className="field-input"
            type="number"
            step="1"
            min="1"
            inputMode="numeric"
            {...register('maxUsesPerUser')}
          />
        </FormField>
      </div>

      {formError && <span className="form-error">{formError}</span>}

      <div className="form-actions">
        <Button variant="ghost" onClick={onCancelled}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
