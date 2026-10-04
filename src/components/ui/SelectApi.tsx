import { useCallback, useMemo, useRef, useState } from 'react'
import AsyncSelect from 'react-select/async'
import {
  components,
  type GroupBase,
  type OptionProps,
  type OptionsOrGroups,
} from 'react-select'
import { Check } from 'lucide-react'
import type { AbstractService } from '@/sdk/model/core/AbstractService'
import type BaseEntity from '@/sdk/model/entities/BaseEntity'

export interface SelectApiProps<T extends BaseEntity> {
  service: AbstractService<T>
  querySearch?: (search: string) => Record<string, unknown>
  queryParams?: Record<string, unknown>
  placeholder?: string
  notFoundText?: string
  renderOption?: (item: T) => string
  multiple?: boolean
  value: T | T[] | null
  onChange: (value: T | T[] | null) => void
  disabled?: boolean
  id?: string
}

const DEBOUNCE_MS = 400

function Option<T extends BaseEntity>(
  props: OptionProps<T, boolean, GroupBase<T>>
) {
  return (
    <components.Option {...props}>
      <span className="flex items-center justify-between gap-2">
        <span className="truncate">{props.children}</span>
        {props.isSelected && (
          <Check size={14} className="shrink-0 text-(--primary-contrast)" />
        )}
      </span>
    </components.Option>
  )
}

export function SelectApi<T extends BaseEntity>({
  service,
  querySearch,
  queryParams = {},
  placeholder = 'Selecciona...',
  notFoundText = 'No se encontraron resultados',
  renderOption,
  multiple = false,
  value,
  onChange,
  disabled = false,
  id,
}: SelectApiProps<T>) {
  const [hasError, setHasError] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const label = useCallback(
    (item: T): string =>
      renderOption ? renderOption(item) : (item.name ?? String(item.id ?? '')),
    [renderOption]
  )

  const loadOptions = useCallback(
    (
      inputValue: string,
      callback: (options: OptionsOrGroups<T, GroupBase<T>>) => void
    ) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        service
          .findAll({
            config: {
              params: {
                ...(querySearch?.(inputValue) ?? {}),
                ...queryParams,
              },
            },
          })
          .then((res) => {
            setHasError(false)
            callback(res.data)
          })
          .catch(() => {
            setHasError(true)
            callback([])
          })
      }, DEBOUNCE_MS)
    },
    [service, querySearch, queryParams]
  )

  const selectValue = useMemo(() => {
    if (Array.isArray(value)) {
      return value
    }
    return value ?? null
  }, [value])

  return (
    <div className="w-full">
      <AsyncSelect<T, boolean>
        inputId={id}
        isDisabled={disabled}
        isMulti={multiple}
        isClearable
        hideSelectedOptions={false}
        defaultOptions
        cacheOptions
        loadOptions={loadOptions}
        value={selectValue}
        onChange={(next) =>
          onChange(
            multiple ? ((next as T[]) ?? []) : ((next as T | null) ?? null)
          )
        }
        getOptionValue={(item) => String(item.id)}
        getOptionLabel={(item) => label(item)}
        placeholder={placeholder}
        noOptionsMessage={() => notFoundText}
        loadingMessage={() => 'Cargando...'}
        menuPortalTarget={
          typeof document !== 'undefined' ? document.body : undefined
        }
        menuPosition="fixed"
        components={{ Option }}
        unstyled
        classNamePrefix="select-api"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 999999 }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? 'var(--primary)'
              : state.isFocused
                ? 'var(--surface-muted)'
                : 'transparent',
            color: state.isSelected ? 'var(--primary-contrast)' : 'var(--text)',
            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
          }),
        }}
        classNames={{
          control: ({ isFocused }) =>
            `!min-h-[32px] !rounded-[var(--radius-sm)] !border !bg-[var(--select-bg,var(--surface))] !cursor-pointer !transition-colors ${
              isFocused
                ? '!border-[var(--primary)] !shadow-[0_0_0_3px_var(--primary-soft)]'
                : '!border-[var(--select-border,var(--border))] hover:!border-[var(--primary)]'
            } ${disabled ? '!cursor-not-allowed !bg-[var(--surface-muted)]' : ''}`,
          valueContainer: () => '!px-[11px] !py-0.5 !gap-1',
          placeholder: () => '!text-[var(--text-muted)] !text-sm',
          input: () => '!text-[var(--text)] !text-sm',
          singleValue: () => '!text-[var(--text)] !text-sm',
          multiValue: () =>
            '!bg-[var(--surface-muted)] !rounded !items-center !my-0.5 !mr-1',
          multiValueLabel: () => '!text-[var(--text)] !text-xs !py-0.5 !pl-2',
          multiValueRemove: () =>
            '!text-[var(--text-muted)] hover:!text-[var(--text)] hover:!bg-transparent !rounded-r',
          indicatorsContainer: () => '!gap-0.5',
          dropdownIndicator: () => '!text-[var(--text-muted)] !p-1.5',
          clearIndicator: () =>
            '!text-[var(--text-muted)] hover:!text-[var(--text)] !p-1.5',
          indicatorSeparator: () => '!hidden',
          loadingIndicator: () => '!text-[var(--primary)]',
          menuPortal: () => '!z-[999999]',
          menu: () =>
            '!mt-2 !overflow-hidden !rounded-[var(--radius-lg)] !border !border-[var(--border)] !bg-[var(--surface)] !shadow-[0_16px_40px_-8px_rgba(15,18,25,0.25)] !ring-1 !ring-black/5',
          menuList: () => '!max-h-72 !space-y-0.5 !p-2',
          option: ({ isSelected, isDisabled }) =>
            `!rounded-[var(--radius-sm)] !px-3 !py-2.5 !text-[13px] !leading-tight !transition-colors ${
              isSelected ? '!font-semibold' : '!font-normal'
            } ${isDisabled ? '!opacity-50' : ''}`,
          noOptionsMessage: () =>
            '!px-3 !py-6 !text-center !text-[13px] !text-[var(--text-muted)]',
          loadingMessage: () =>
            '!px-3 !py-6 !text-center !text-[13px] !text-[var(--text-muted)]',
          groupHeading: () =>
            '!px-3 !pt-2 !pb-1 !text-[11px] !font-semibold !uppercase !tracking-wide !text-[var(--text-muted)]',
        }}
      />
      {hasError && (
        <small className="select-api-error">
          No se pudo cargar la lista. Intenta nuevamente.
        </small>
      )}
    </div>
  )
}
