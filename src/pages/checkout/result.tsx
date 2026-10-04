import ResultPage from '@/features/checkout/ResultPage'
import StoreLayout from '@/features/store/StoreLayout'
import { RequireAuth } from '@/components/guards/RequireAuth'

export default function CheckoutResult() {
  return (
    <StoreLayout>
      <RequireAuth>
        <ResultPage />
      </RequireAuth>
    </StoreLayout>
  )
}
