/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { MenuItem } from '@/config/dashboardMenu'
import { cn } from '@/lib/utils'

export interface SidebarMenuProps {
  items: MenuItem[]
  currentPath: string
  onNavigate?: () => void
  depth?: number
}

export function menuItemIsActive(item: MenuItem, currentPath: string): boolean {
  if (item.route && currentPath.startsWith(item.route)) {
    return true
  }
  return (
    item.children?.some((child) => menuItemIsActive(child, currentPath)) ??
    false
  )
}

export function SidebarMenu({
  items,
  currentPath,
  onNavigate,
  depth = 0,
}: SidebarMenuProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => (
        <SidebarMenuEntry
          key={item.label}
          item={item}
          currentPath={currentPath}
          onNavigate={onNavigate}
          depth={depth}
        />
      ))}
    </div>
  )
}

function SidebarMenuEntry({
  item,
  currentPath,
  onNavigate,
  depth,
}: {
  item: MenuItem
  currentPath: string
  onNavigate?: () => void
  depth: number
}) {
  const ItemIcon = item.icon
  const isBranch = !!item.children?.length
  const childActive = menuItemIsActive(item, currentPath)
  const active = !isBranch && childActive
  const [open, setOpen] = useState(childActive)
  const indent = 12 + depth * 16

  if (isBranch) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          style={{ paddingLeft: indent }}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] py-2.5 pr-3 text-left text-sm font-medium text-[var(--sidebar-text)] transition-colors hover:bg-white/[0.06] hover:text-[var(--sidebar-text-active)]',
            childActive && 'text-[var(--sidebar-text-active)]'
          )}
        >
          <ItemIcon size={18} />
          <span className="flex-1">{item.label}</span>
          <ChevronRight
            size={15}
            className={cn(
              'transition-transform duration-200',
              open && 'rotate-90'
            )}
          />
        </button>

        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-out',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="overflow-hidden">
            <SidebarMenu
              items={item.children!}
              currentPath={currentPath}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link
      to={item.route ?? '#'}
      onClick={onNavigate}
      style={{ paddingLeft: indent }}
      className={cn(
        'flex items-center gap-2.5 rounded-[var(--radius-sm)] py-2.5 pr-3 text-sm font-medium text-[var(--sidebar-text)] no-underline transition-colors hover:bg-white/[0.06] hover:text-[var(--sidebar-text-active)]',
        active &&
          'bg-[var(--primary)] text-[var(--sidebar-text-active)] hover:bg-[var(--primary)]'
      )}
    >
      <ItemIcon size={18} />
      <span>{item.label}</span>
    </Link>
  )
}
