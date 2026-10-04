import SessionType from '@/models/app/context/SessionType'
import { createContext } from 'react'

export const SessionContext = createContext<SessionType | undefined>(undefined)
