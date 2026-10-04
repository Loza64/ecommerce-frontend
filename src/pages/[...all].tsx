import { Navigate } from 'react-router-dom'
import { RoutesEnum } from '@/enum/routes..app'

export default function CatchAll() {
  return <Navigate to={RoutesEnum.HOME} replace />
}
