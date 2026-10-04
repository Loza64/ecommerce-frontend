import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useCrud from '@/hooks/core/useCrud'
import { couponService } from '@/api'
import Coupon from '@/models/entities/Coupon'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { couponFormSchema, type CouponFormValues } from '@/schemas/coupon'
import { fromDatetimeLocal, toDatetimeLocal } from '@/lib/date'
import errorResponse from '@/utils/errorResponse'

export interface CouponFormProps {
  couponId: string | number | null
  onSaved: () => void
  onCancelled: () => void
}

export function CouponForm({
  couponId,
  onSaved,
  onCancelled,
}: CouponFormProps) {
  const crud = useCrud<Coupon>({ service: couponService, queryKey: 'coupons' })
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
