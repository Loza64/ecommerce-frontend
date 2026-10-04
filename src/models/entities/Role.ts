import BaseEntity from '@/sdk/model/entities/BaseEntity'
import Permissions from './Permissions'

export default interface Role extends BaseEntity {
  active: boolean
  permissions: Permissions[]
}
