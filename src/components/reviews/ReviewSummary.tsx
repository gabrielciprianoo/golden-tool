import { useMemo, useState } from 'react'
import { Button, Input } from '../atoms'
import { FormField } from '../molecules'
import { ToolStateBadge } from './ToolStateBadge'
import { CorrectionModal } from './CorrectionModal'
import type { ReviewItemResult } from '../../schemas/reviewSchema'

interface ReviewSummaryProps {
  results: ReviewItemResult[]
  onResultsChange: (updated: ReviewItemResult[]) => void
  reviewName: string
  onNameChange: (name: string) => void
  onConfirm: () => void
  isLoading: boolean
}

interface DisplayGroup {
  tool_id: number
  toolName: string
  items: { result: ReviewItemResult; flatIndex: number }[]
}

export const ReviewSummary = ({
  results,
  onResultsChange,
  reviewName,
  onNameChange,
  onConfirm,
  isLoading,
}: ReviewSummaryProps) => {
  const [correctingIndex, setCorrectingIndex] = useState<number | null>(null)
  const [expandedToolId, setExpandedToolId] = useState<number | null>(null)

  const displayGroups = useMemo<DisplayGroup[]>(() => {
    const map = new Map<number, DisplayGroup>()
    results.forEach((result, flatIndex) => {
      const tid = result.group.tool_id
      const existing = map.get(tid)
      const entry = { result, flatIndex }
      if (existing) {
        existing.items.push(entry)
      } else {
        map.set(tid, {
          tool_id: tid,
          toolName: result.group.tool?.name ?? `#${tid}`,
          items: [entry],
        })
      }
    })
    return Array.from(map.values())
  }, [results])

  const totalLost = results.filter((r) => r.quantityPresent === 0).length
  const correctingResult = correctingIndex !== null ? results[correctingIndex] : null

  const handleCorrection = (corrected: ReviewItemResult) => {
    onResultsChange(results.map((r, i) => (i === correctingIndex ? corrected : r)))
    setCorrectingIndex(null)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[var(--text-h)] mb-1">Resumen de la revisión</h3>
        <p className="text-sm text-[var(--text)]">
          {results.length} herramienta{results.length !== 1 ? 's' : ''} revisada{results.length !== 1 ? 's' : ''}
          {totalLost > 0 && (
            <span className="text-red-600 dark:text-red-400 font-medium">
              {' '}· {totalLost} perdida{totalLost > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden mb-6 divide-y divide-[var(--border)]">
        {displayGroups.map((group) => {
          const isExpanded = expandedToolId === group.tool_id
          const presentCount = group.items.filter((e) => e.result.quantityPresent > 0).length
          const total = group.items.length
          const lost = total - presentCount

          return (
            <div key={group.tool_id}>
              {/* Group header */}
              <button
                onClick={() => setExpandedToolId(isExpanded ? null : group.tool_id)}
                className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-[var(--surface-50)] dark:hover:bg-[var(--surface-800)] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-h)]">{group.toolName}</p>
                  <p className="text-xs text-[var(--text)] mt-0.5">
                    {lost === 0 ? (
                      `${total} ${total === 1 ? 'unidad presente' : 'unidades presentes'}`
                    ) : presentCount === 0 ? (
                      <span className="text-red-500 dark:text-red-400">{total === 1 ? 'Perdida' : `Todas perdidas (${total})`}</span>
                    ) : (
                      <span>
                        <span className="text-[var(--text)]">{presentCount}/{total} presentes</span>
                        <span className="text-red-500 dark:text-red-400"> · {lost} perdida{lost !== 1 ? 's' : ''}</span>
                      </span>
                    )}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-[var(--text)] shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Per-unit accordion */}
              {isExpanded && (
                <div className="bg-[var(--surface-50)] dark:bg-[var(--surface-800)] divide-y divide-[var(--border)]">
                  {group.items.map(({ result, flatIndex }, unitIndex) => (
                    <div key={flatIndex} className="flex items-center gap-3 px-6 py-3">
                      <span className="text-xs text-[var(--text)] w-16 shrink-0">
                        {total > 1 ? `Unidad ${unitIndex + 1}` : 'Unidad'}
                      </span>
                      <ToolStateBadge state={result.group.asignations[0].state} />
                      <span className="text-[var(--text)] text-xs">→</span>
                      {result.quantityPresent > 0
                        ? <ToolStateBadge state={result.unitStates[0]} />
                        : <ToolStateBadge state="perdida" />}
                      <button
                        onClick={() => setCorrectingIndex(flatIndex)}
                        className="ml-auto text-xs text-[var(--text)] hover:text-[var(--accent)] underline underline-offset-2 transition-colors shrink-0"
                      >
                        Corregir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6">
        <FormField label="Nombre de la revisión" htmlFor="review-name">
          <Input
            id="review-name"
            placeholder="Ej: Revisión mensual mayo 2026"
            value={reviewName}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </FormField>
        <div className="flex justify-end mt-4">
          <Button onClick={onConfirm} isLoading={isLoading} disabled={!reviewName.trim()} size="lg">
            Guardar revisión
          </Button>
        </div>
      </div>

      {correctingResult && (
        <CorrectionModal
          result={correctingResult}
          onConfirm={handleCorrection}
          onClose={() => setCorrectingIndex(null)}
        />
      )}
    </div>
  )
}
