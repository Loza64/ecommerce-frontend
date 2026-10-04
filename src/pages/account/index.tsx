import { Navigate } from 'react-router-dom'
import { RoutesEnum } from '@/enum/routes..app'

export default function AccountIndex() {
  return <Navigate to={RoutesEnum.MY_ORDERS} replace />
}
