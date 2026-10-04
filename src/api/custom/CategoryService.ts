import Category from '@/models/entities/Category'
import Service from '@/sdk/core/Service'

export default class CategoryService extends Service<Category> {
  constructor() {
    super({ endpoint: 'categories' })
  }

  /** Categorías raíz con sus subcategorías (público). */
  public async tree(): Promise<Category[]> {
    const res = await this.axios.get<Category[]>('categories/tree')
    return res.data
  }
}
