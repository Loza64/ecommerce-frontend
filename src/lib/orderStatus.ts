import type { OrderStatus } from '@/models/entities/Order'
import type { BadgeVariant } from '@/components/ui/Badge'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Pendiente de pago',
  paid: 'Pagado',
  cancelled: 'Cancelado',
}

export const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  pending_payment: 'warning',
  paid: 'success',
  cancelled: 'neutral',
}
