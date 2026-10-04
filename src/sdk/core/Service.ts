import { type AxiosInstance } from 'axios'
import { AxiosConfig } from './AxiosConfig'
import { sdkSettings } from '@/sdk/core/SdkSettings'
import BaseEntity from '../model/entities/BaseEntity'
import { BaseResponse } from '../model/response/BaseResponse'
import PaginationResponse from '../model/response/PaginationResponse'
import { AbstractService } from '../model/core/AbstractService'
import {
  ApiServiceParams,
  CreateParams,
  DeleteParams,
  FindAllParams,
  FindByIdParams,
  FindByParams,
  RestoreParams,
  ServiceConfig,
  UpdateParams,
} from '../model/core/ParamsService'

export default class Service<
  Entity extends BaseEntity,
> implements AbstractService<Entity> {
  protected readonly axios: AxiosInstance
  protected readonly endpoint: string

  constructor({
    origin = sdkSettings.apiService,
    initPath = 'api',
    endpoint = '',
  }: ApiServiceParams) {
    if (!origin) {
      throw new Error('Origin is required for ApiService instance')
    }
    this.endpoint = endpoint
    this.axios = AxiosConfig({ origin, initPath })
  }

  private getUrl(endpoint?: string, idOrPath?: string | number): string {
    const base = endpoint || this.endpoint
    if (idOrPath === null || idOrPath === undefined) {
      return base
    }
    const normalized = String(idOrPath).replace(/^\/+/, '')
    return `${base}/${normalized}`
  }

  private withMeta(config?: ServiceConfig) {
    return {
      ...config,
      onUnauthorized: config?.onUnauthorized,
      onForbidden: config?.onForbidden,
    }
  }

  async findAll(params: FindAllParams): Promise<PaginationResponse<Entity>> {
    const res = await this.axios.get(
      this.getUrl(params.endpoint),
      this.withMeta(params.config)
    )
    return res.data
  }

  async findById(params: FindByIdParams): Promise<BaseResponse<Entity>> {
    const res = await this.axios.get(
      this.getUrl(params.endpoint, params.id),
      this.withMeta(params.config)
    )
    return res.data
  }

  async findBy(params: FindByParams): Promise<BaseResponse<Entity>> {
    const response = await this.axios.get<BaseResponse<Entity>>(
      this.getUrl(params.endpoint, params.path),
      this.withMeta(params.config)
    )
    return response.data
  }

  async create(params: CreateParams<Entity>): Promise<BaseResponse<Entity>> {
    const res = await this.axios.post(
      this.getUrl(params.endpoint),
      params.payload,
      this.withMeta(params.config)
    )
    return res.data
  }

  async update(params: UpdateParams<Entity>): Promise<BaseResponse<Entity>> {
    const res = await this.axios.put(
      this.getUrl(params.endpoint, params.id),
      params.payload,
      this.withMeta(params.config)
    )
    return res.data
  }

  async delete(params: DeleteParams): Promise<void> {
    await this.axios.delete(
      this.getUrl(params.endpoint, params.id),
      this.withMeta(params.config)
    )
  }

  async restore(params: RestoreParams): Promise<void> {
    await this.axios.patch(
      this.getUrl(params.endpoint, `${params.id}/restore`),
      this.withMeta(params.config)
    )
  }
}
