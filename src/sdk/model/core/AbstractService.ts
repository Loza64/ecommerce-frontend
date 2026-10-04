import PaginationResponse from '../response/PaginationResponse'
import { BaseResponse } from '../response/BaseResponse'
import {
  CreateParams,
  DeleteParams,
  FindAllParams,
  FindByIdParams,
  FindByParams,
  RestoreParams,
  UpdateParams,
} from './ParamsService'
import BaseEntity from '../entities/BaseEntity'

export abstract class AbstractService<Entity extends BaseEntity> {
  abstract findAll(params?: FindAllParams): Promise<PaginationResponse<Entity>>
  abstract findById(params: FindByIdParams): Promise<BaseResponse<Entity>>
  abstract findBy(params: FindByParams): Promise<BaseResponse<Entity>>
  abstract create(params: CreateParams<Entity>): Promise<BaseResponse<Entity>>
  abstract update(params: UpdateParams<Entity>): Promise<BaseResponse<Entity>>
  abstract delete(params: DeleteParams): Promise<void>
  abstract restore(params: RestoreParams): Promise<void>
}
