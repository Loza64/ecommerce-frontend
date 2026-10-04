import { AbstractService } from '@/sdk/model/core/AbstractService'
import {
  CreateParams,
  DeleteParams,
  FindByIdParams,
  FindByParams,
  RestoreParams,
  UpdateParams,
} from '@/sdk/model/core/ParamsService'
import BaseEntity from '@/sdk/model/entities/BaseEntity'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface UseCrudOptions<Entity extends BaseEntity> {
  service: AbstractService<Entity>
  queryKey: string | string[]
  onUnauthorized?: () => void
  onForbidden?: () => void
}

export default function useCrud<Entity extends BaseEntity>({
  onForbidden,
  onUnauthorized,
  service,
  queryKey = 'list',
}: UseCrudOptions<Entity>) {
  const queryClient = useQueryClient()

  const normalizedQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey]

  const injectConfig = <
    T extends {
      config?: object
      onForbidden?: () => void
      onUnauthorized?: () => void
    },
  >(
    params: T
  ) => ({
    ...params,
    config: {
      ...params.config,
      onForbidden: onForbidden ?? params.onForbidden,
      onUnauthorized: onUnauthorized ?? params.onUnauthorized,
    },
  })

  const createMutation = useMutation({
    mutationFn: (params: CreateParams<Entity>) =>
      service.create(injectConfig(params)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: normalizedQueryKey }),
  })

  const updateMutation = useMutation({
    mutationFn: (params: UpdateParams<Entity>) =>
      service.update(injectConfig(params)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: normalizedQueryKey }),
  })

  const deleteMutation = useMutation({
    mutationFn: (params: DeleteParams) => service.delete(injectConfig(params)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: normalizedQueryKey }),
  })

  const restoreMutation = useMutation({
    mutationFn: (params: RestoreParams) =>
      service.restore(injectConfig(params)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: normalizedQueryKey }),
  })

  const useFindById = (params: FindByIdParams) => {
    return useQuery({
      queryKey: [queryKey, params.id],
      queryFn: () => service.findById(injectConfig(params)),
      enabled: !!params.id,
    })
  }

  const useFindBy = (params: FindByParams) => {
    return useQuery({
      queryKey: [queryKey, params],
      queryFn: () => service.findBy(injectConfig(params)),
      enabled: !!params,
    })
  }

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRestoring: deleteMutation.isPending,

    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    restoreError: restoreMutation.error,

    useFindById,
    useFindByPath: useFindBy,
  }
}
