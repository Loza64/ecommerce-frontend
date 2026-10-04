import BaseEntity from '@/sdk/model/entities/BaseEntity'

export interface CategoryRef {
  id: number
  name?: string
}

export default interface Category extends BaseEntity {
  name: string
  description?: string | null
  /** null o ausente = categoría raíz; con valor = subcategoría */
  parent?: CategoryRef | null
  children?: { id: number; name: string; description: string | null }[]
}
