import AccountShell from '@/features/account/AccountShell'
import StoreLayout from '@/features/store/StoreLayout'
import { RequireAuth } from '@/components/guards/RequireAuth'

export default function Account() {
  return (
    <StoreLayout>
      <RequireAuth>
        <AccountShell />
      </RequireAuth>
    </StoreLayout>
  )
}
