import UserService from './custom/UserService'
import ProductService from './custom/ProductService'
import CategoryService from './custom/CategoryService'
import CartService from './custom/CartService'
import OrderService from './custom/OrderService'
import UploadService from './custom/UploadService'
import Role from '@/models/entities/Role'
import Permissions from '@/models/entities/Permissions'
import Coupon from '@/models/entities/Coupon'
import { Sale } from '@/models/entities/Order'
import Service from '@/sdk/core/Service'

//custom
export const userService = new UserService()
export const productService = new ProductService()
export const categoryService = new CategoryService()
export const cartService = new CartService()
export const orderService = new OrderService()
export const uploadService = new UploadService()

//core
export const roleService = new Service<Role>({ endpoint: 'roles' })

export const permissionService = new Service<Permissions>({
  endpoint: 'permissions',
})

export const couponService = new Service<Coupon>({ endpoint: 'coupons' })

/** Cupones del vendedor: solo descuentan sus productos y el descuento lo asume él. */
export const myCouponService = new Service<Coupon>({ endpoint: 'coupons/mine' })

/** Lo que el usuario ha vendido (items de pedidos pagados). */
export const saleService = new Service<Sale>({ endpoint: 'orders/sales' })
