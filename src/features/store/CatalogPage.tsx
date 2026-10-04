import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PackageSearch, X } from 'lucide-react'
import { useFindAll } from '@/hooks/core/useFindAll'
import { categoryService, productService } from '@/api'
import type Product from '@/models/entities/Product'
import type Category from '@/models/entities/Category'
import { useSession } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pager } from '@/components/ui/Pager'
import { cn } from '@/lib/utils'
import { isOwnProduct } from '@/lib/product'
import { ProductCard } from './ProductCard'

const PAGE_SIZE = 12

const chip =
  'inline-flex items-center rounded-full border px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap cursor-pointer transition-colors'
const chipIdle =
  'border-(--border) bg-(--surface) text-(--text) hover:bg-(--surface-muted)'
const chipActive = 'border-(--primary) bg-(--primary) text-(--primary-contrast)'

function CategoryChips({
  tree,
  selected,
  onSelect,
}: {
  tree: Category[]
  selected: number | null
  onSelect: (id: number | null) => void
}) {
  // la raíz activa es la seleccionada o la que contiene la subcategoría elegida
  const activeRoot = tree.find(
    (root) =>
      Number(root.id) === selected ||
      root.children?.some((child) => child.id === selected)
  )

  return (
    <div className="mb-5 flex flex-col gap-2.5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          className={cn(chip, selected === null ? chipActive : chipIdle)}
          onClick={() => onSelect(null)}
        >
          Todas
        </button>
        {tree.map((root) => (
          <button
            key={root.id}
            type="button"
            className={cn(
              chip,
              activeRoot?.id === root.id ? chipActive : chipIdle
            )}
            onClick={() => onSelect(Number(root.id))}
          >
            {root.name}
          </button>
        ))}
      </div>

      {activeRoot?.children && activeRoot.children.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {activeRoot.children.map((child) => (
            <button
              key={child.id}
              type="button"
              className={cn(
                chip,
                'py-1 text-xs',
                selected === child.id ? chipActive : chipIdle
              )}
              onClick={() => onSelect(child.id)}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="aspect-[4/5] animate-pulse rounded-(--radius-lg) bg-(--surface-muted)"
        />
      ))}
    </div>
  )
}

export default function CatalogPage() {
  const { profile } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') ?? ''
  const categoryParam = Number(searchParams.get('category'))
  const category =
    Number.isInteger(categoryParam) && categoryParam > 0 ? categoryParam : null
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === '') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    })
    setSearchParams(next)
  }

  const treeQuery = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoryService.tree(),
  })

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(category ? { category } : {}),
    }),
    [page, search, category]
  )

  const productsQuery = useFindAll<Product>({
    service: productService,
    queryKey: 'products',
    queryParams,
  })
  const products = productsQuery.data?.data ?? []
  const pagination = productsQuery.data?.pagination
  const hasFilters = !!search || category !== null

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-xl font-bold text-(--text)">
          {search ? `Resultados para "${search}"` : 'Productos'}
        </h1>
        {search && (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--surface) px-2.5 py-1 text-xs text-(--text-muted) hover:text-(--text)"
            onClick={() => update({ search: null, page: null })}
          >
            Quitar búsqueda
            <X size={13} />
          </button>
        )}
        {pagination && (
          <span className="ml-auto text-[13px] text-(--text-muted)">
            {pagination.total}{' '}
            {pagination.total === 1 ? 'producto' : 'productos'}
          </span>
        )}
      </div>

      {treeQuery.data && treeQuery.data.length > 0 && (
        <CategoryChips
          tree={treeQuery.data}
          selected={category}
          onSelect={(id) =>
            update({ category: id === null ? null : String(id), page: null })
          }
        />
      )}

      {productsQuery.isLoading ? (
        <ProductGridSkeleton />
      ) : productsQuery.isError ? (
        <EmptyState
          icon={PackageSearch}
          title="No pudimos cargar los productos"
          description="Revisa tu conexión e inténtalo de nuevo."
          action={
            <Button variant="primary" onClick={() => productsQuery.refetch()}>
              Reintentar
            </Button>
          }
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={
            hasFilters
              ? 'No hay productos con esos filtros'
              : 'Aún no hay productos'
          }
          description={
            hasFilters
              ? 'Prueba con otra búsqueda o quita los filtros.'
              : 'Cuando alguien publique un producto aparecerá aquí.'
          }
          action={
            hasFilters ? (
              <Button
                variant="ghost"
                onClick={() => setSearchParams(new URLSearchParams())}
              >
                Ver todos los productos
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isOwn={isOwnProduct(product, profile?.id)}
              />
            ))}
          </div>
          <Pager
            page={pagination?.page ?? 1}
            pageCount={pagination?.pageCount ?? 1}
            onChange={(next) =>
              update({ page: next === 1 ? null : String(next) })
            }
          />
        </>
      )}
    </>
  )
}
