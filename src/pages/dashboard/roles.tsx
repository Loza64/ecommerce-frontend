import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { useSession } from '@/hooks/useSession'
import { roles } from '@/enum/role'

export default function RolesGate() {
  const { profile } = useSession()
  return (
    <ProtectedRoute
      allowedRoles={[roles.super_admin, roles.admin]}
      userRole={profile?.role?.name ?? ''}
    />
  )
}
