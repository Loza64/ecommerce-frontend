import { Navigate, Outlet } from 'react-router-dom'

interface ProtectedRouteProps {
  allowedRoles: string[]
  userRole: string
}

export function ProtectedRoute({
  allowedRoles,
  userRole,
}: ProtectedRouteProps) {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
