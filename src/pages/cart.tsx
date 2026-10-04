import CartPage from '@/features/cart/CartPage'
import StoreLayout from '@/features/store/StoreLayout'
import { RequireAuth } from '@/components/guards/RequireAuth'

export default function Cart() {
  return (
    <StoreLayout>
      <RequireAuth>
        <CartPage />
      </RequireAuth>
    </StoreLayout>
  )
}
