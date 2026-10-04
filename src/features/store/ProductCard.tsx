import { Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import type Product from '@/models/entities/Product'
import { Badge } from '@/components/ui/Badge'
import { formatMoney } from '@/lib/money'
import { productPath } from '@/lib/routes'
import { imageUrl, mainImage, priceRange, totalStock } from '@/lib/product'

export function ProductCard({
  product,
  isOwn,
}: {
  product: Product
  isOwn: boolean
}) {
  const image = imageUrl(mainImage(product), true)
  const { min, max } = priceRange(product.variants)
  const soldOut = totalStock(product.variants) === 0

  return (
    <Link
      to={productPath(product.id!)}
      className="group flex flex-col overflow-hidden rounded-(--radius-lg) border border-(--border) bg-(--surface) text-(--text) no-underline transition-colors hover:border-(--primary)"
    >
      <div className="aspect-square overflow-hidden bg-(--surface-muted)">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-(--text-muted)">
            <ImageOff size={28} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        {product.category && (
          <span className="text-xs text-(--text-muted)">
            {product.category.name}
          </span>
        )}
        <h3 className="m-0 line-clamp-2 text-sm leading-snug font-semibold">
          {product.name}
        </h3>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="text-[15px] font-semibold">
            {min === max ? formatMoney(min) : `Desde ${formatMoney(min)}`}
          </span>
          {soldOut ? (
            <Badge variant="danger">Agotado</Badge>
          ) : isOwn ? (
            <Badge variant="neutral">Es tuyo</Badge>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
