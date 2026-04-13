import type { ReviewGroup } from '../../schemas/reviewSchema'
import { ToolStateBadge } from './ToolStateBadge'

interface WizardProgressProps {
  groups: ReviewGroup[]
  currentIndex: number
}

export const WizardProgress = ({ groups, currentIndex }: WizardProgressProps) => {
  // Precompute labels — show "(2/4)" suffix when same tool appears multiple times
  const labels = groups.map((g, i) => {
    const total = groups.filter((x) => x.tool_id === g.tool_id).length
    if (total === 1) return g.tool?.name ?? `#${g.tool_id}`
    const pos = groups.slice(0, i).filter((x) => x.tool_id === g.tool_id).length + 1
    return `${g.tool?.name ?? `#${g.tool_id}`} (${pos}/${total})`
  })

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">
          Herramientas a revisar
        </p>
      </div>
      <ul className="divide-y divide-[var(--border)]">
        {groups.map((group, i) => {
          const isDone = i < currentIndex
          const isCurrent = i === currentIndex

          return (
            <li
              key={`${group.tool_id}-${i}`}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                isCurrent ? 'bg-primary-50 dark:bg-primary-900/20' : isDone ? 'opacity-40' : ''
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isDone
                  ? 'bg-emerald-500 text-white'
                  : isCurrent
                    ? 'bg-primary-600 text-white'
                    : 'bg-[var(--border)] text-[var(--text)]'
              }`}>
                {isDone ? '✓' : i + 1}
              </span>

              <span className={`flex-1 truncate ${isCurrent ? 'font-semibold text-[var(--text-h)]' : 'text-[var(--text)]'}`}>
                {labels[i]}
              </span>

              {!isCurrent && !isDone && (
                <ToolStateBadge state={group.state} />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
