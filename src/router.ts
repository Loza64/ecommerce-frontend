// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `*`
  | `/`
  | `/account`
  | `/account/orders`
  | `/account/products`
  | `/account/sales`
  | `/cart`
  | `/checkout`
  | `/checkout/result`
  | `/dashboard`
  | `/dashboard/categories`
  | `/dashboard/coupons`
  | `/dashboard/demo`
  | `/dashboard/permissions`
  | `/dashboard/products`
  | `/dashboard/roles`
  | `/dashboard/settings`
  | `/dashboard/users`
  | `/login`
  | `/products/:id`
  | `/signup`
  | `/unauthorized`

export type Params = {
  '/*': { '*': string }
  '/products/:id': { id: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>()
export const { redirect } = utils<Path, Params>()
