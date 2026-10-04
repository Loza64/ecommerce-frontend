import { useContext } from 'react'
import { SessionContext } from '../context/SessionContext'
import SessionType from '@/models/app/context/SessionType'

export const useSession = (): SessionType => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('El proveedor de sesión no ha sido inicializado')
  }
  return context
}
