import BaseEntity from '@/sdk/model/entities/BaseEntity'

export default interface Permissions extends BaseEntity {
  name: string
  title: string
}
