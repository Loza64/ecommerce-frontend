import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImageOff, PackageSearch, ShoppingCart } from 'lucide-react'
import { toast } from 'react-toastify'
import useCrud from '@/hooks/core/useCrud'
import { productService } from '@/api'
import type Product from '@/models/entities/Product'
import { useSession } from '@/hooks/useSession'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { sdkSettings } from '@/sdk/core/SdkSettings'
import { RoutesEnum } from '@/enum/routes..app'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/money'
import { attributesLabel, imageUrl, isOwnProduct } from '@/lib/product'
import errorResponse from '@/utils/errorResponse'

const MAX_PER_ITEM = 99
const LOW_STOCK = 5

function Gallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0)
  const images = product.images
  const current = imageUrl(images[Math.min(index, images.length - 1)])

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-(--radius-lg) border border-(--border) bg-(--surface-muted)">
        {current ? (
          <img
            src={current}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-(--text-muted)">
            <ImageOff size={36} />
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                'h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-(--radius-sm) border-2 bg-(--surface-muted) p-0',
                i === index ? 'border-(--primary)' : 'border-transparent'
              )}
            >
              <img
                src={imageUrl(image, true)}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PurchasePanel({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { profile } = useSession()
  const { addItem } = useCart()
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [quantity, setQuantity] = useState(1)

  const isOwn = isOwnProduct(product, profile?.id)
  const variant =
    product.variants.find((v) => v.id === selectedId) ??
    product.variants.find((v) => v.stockQuantity > 0) ??
    product.variants[0]

  const stock = variant ? Number(variant.stockQuantity) : 0
  const maxQuantity = Math.min(stock, MAX_PER_ITEM)
  const safeQuantity = Math.max(1, Math.min(quantity, maxQuantity || 1))

  const add = async () => {
    if (!sdkSettings.token) {
      navigate(RoutesEnum.LOGIN)
      return
    }
    if (!variant) {
      return
    }
    try {
      await addItem.mutateAsync({
        variantId: Number(variant.id),
        quantity: safeQuantity,
      })
      toast.success('Producto agregado al carrito.')
    } catch (error) {
      errorResponse({ error })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="m-0 text-2xl font-bold text-(--text)">
        {formatMoney(variant ? variant.price : 0)}
      </p>

      {product.variants.length > 1 && (
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-2 p-0 text-[13px] font-semibold text-(--text)">
            Opciones
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const unavailable = Number(v.stockQuantity) === 0
              const selected = v.id === variant?.id
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={unavailable}
                  aria-pressed={selected}
                  onClick={() => {
                    setSelectedId(v.id ?? null)
                    setQuantity(1)
                  }}
                  className={cn(
                    'cursor-pointer rounded-(--radius-sm) border px-3 py-2 text-[13px] font-medium disabled:cursor-not-allowed disabled:line-through disabled:opacity-45',
                    selected
                      ? 'border-(--primary) bg-(--primary-soft) text-(--primary)'
                      : 'border-(--border) bg-(--surface) text-(--text) hover:bg-(--surface-muted)'
                  )}
                >
                  {attributesLabel(v.attributes) || v.sku}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {variant && (
        <div className="flex flex-col gap-0.5 text-[13px] text-(--text-muted)">
          <span
            className={
              stock === 0 ? 'font-semibold text-(--danger)' : undefined
            }
          >
            {stock === 0
              ? 'Agotado'
              : stock <= LOW_STOCK
                ? `Quedan ${stock} disponibles`
                : 'Disponible'}
          </span>
          <span>SKU {variant.sku}</span>
        </div>
      )}

      {isOwn ? (
        <p className="m-0 rounded-(--radius-md) border border-(--border) bg-(--surface-muted) px-4 py-3 text-[13px] text-(--text-muted)">
          Este producto es tuyo, por eso no puedes comprarlo. Puedes editarlo
          desde{' '}
          <Link
            to={RoutesEnum.MY_PRODUCTS}
            className="font-semibold text-(--primary)"
          >
            Mis productos
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <QuantityStepper
            value={safeQuantity}
            max={maxQuantity}
            onChange={setQuantity}
            disabled={stock === 0}
          />
          <Button
            variant="primary"
            className="px-5"
            disabled={stock === 0 || addItem.isPending}
            onClick={add}
          >
            <ShoppingCart size={16} />
            {addItem.isPending ? 'Agregando...' : 'Agregar al carrito'}
          </Button>
        </div>
      )}

      {!profile && !isOwn && (
        <p className="m-0 text-xs text-(--text-muted)">
          Necesitas{' '}
          <Link
            to={RoutesEnum.LOGIN}
            className="font-semibold text-(--primary)"
          >
            iniciar sesión
          </Link>{' '}
          para comprar.
        </p>
      )}
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const crud = useCrud<Product>({
    service: productService,
    queryKey: 'products',
  })
  const {
    data: product,
    isLoading,
    isError,
  } = crud.useFindById({ id: id ?? '' })

  if (isLoading) {
    return <div className="form-loading-state">Cargando producto...</div>
  }

  if (isError || !product) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No encontramos este producto"
        description="Puede que el vendedor lo haya eliminado."
        action={
          <Link to={RoutesEnum.HOME} className="no-underline">
            <Button variant="primary">Ver productos</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-10">
      <Gallery product={product} />

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          {product.category && (
            <nav
              className="text-[13px] text-(--text-muted)"
              aria-label="Categoría"
            >
              {product.category.parent && (
                <>
                  <Link
                    to={`/?category=${product.category.parent.id}`}
                    className="text-(--text-muted) hover:text-(--primary)"
                  >
                    {product.category.parent.name}
                  </Link>
                  {' / '}
                </>
              )}
              <Link
                to={`/?category=${product.category.id}`}
                className="text-(--text-muted) hover:text-(--primary)"
              >
                {product.category.name}
              </Link>
            </nav>
          )}
          <h1 className="m-0 text-2xl leading-tight font-bold text-(--text)">
            {product.name}
          </h1>
          {product.seller && (
            <p className="m-0 text-[13px] text-(--text-muted)">
              Vendido por {product.seller.name || product.seller.username}
            </p>
          )}
        </div>

        <PurchasePanel key={product.id} product={product} />

        <section className="border-t border-(--border) pt-5">
          <h2 className="m-0 mb-2 text-sm font-semibold text-(--text)">
            Descripción
          </h2>
          <p className="m-0 max-w-[65ch] text-sm leading-relaxed whitespace-pre-line text-(--text-muted)">
            {product.description}
          </p>
        </section>
      </div>
    </div>
  )
}
