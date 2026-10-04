import { AxiosRequestConfig } from 'axios'
import BaseEntity from '../entities/BaseEntity'

// 1. Configuración base común
interface RequestMeta {
  onUnauthorized?: () => void
  onForbidden?: () => void
}

export type ServiceConfig = AxiosRequestConfig & RequestMeta

export interface ApiServiceParams {
  endpoint?: string
  initPath?: string
  origin?: string
}

interface QueryParams extends RequestMeta {
  endpoint?: string
  config?: ServiceConfig
}

interface IdParam extends RequestMeta {
  id: string | number
  endpoint?: string
  config?: ServiceConfig
}

interface PathParam extends QueryParams {
  path: string
}

interface PayloadParam<T> extends RequestMeta {
  payload: T | FormData
  endpoint?: string
  config?: ServiceConfig
}

export type FindAllParams = QueryParams
export type FindByIdParams = IdParam
export type FindByParams = PathParam
export type CreateParams<Entity extends BaseEntity> = PayloadParam<Entity>
export type UpdateParams<Entity extends BaseEntity> = PayloadParam<
  Partial<Entity>
> & { id: string | number }
export type DeleteParams = IdParam
export type RestoreParams = IdParam
