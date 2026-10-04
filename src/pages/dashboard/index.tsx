import { Navigate } from 'react-router-dom'
import { RoutesEnum } from '@/enum/routes..app'

export default function DashboardIndex() {
  return <Navigate to={RoutesEnum.USERS} replace />
}
