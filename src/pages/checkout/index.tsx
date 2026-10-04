import PayPage from '@/features/checkout/PayPage'
import StoreLayout from '@/features/store/StoreLayout'
import { RequireAuth } from '@/components/guards/RequireAuth'

export default function Checkout() {
  return (
    <StoreLayout>
      <RequireAuth>
        <PayPage />
      </RequireAuth>
    </StoreLayout>
  )
}
