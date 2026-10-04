import BaseEntity from '@/sdk/model/entities/BaseEntity'

export interface UploadVariant {
  url: string
  secureUrl: string
  width: number
  height: number
}

export default interface Upload extends BaseEntity {
  url: string
  secureUrl: string
  resourceType: string
  format: string
  originalFilename: string
  width: number | null
  height: number | null
  bytes: number | null
  tags: string[] | null
  eager: UploadVariant[] | null
}
