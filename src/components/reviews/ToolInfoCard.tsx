import { ToolStateBadge } from './ToolStateBadge'
import type { ReviewGroup } from '../../schemas/reviewSchema'

interface ToolInfoCardProps {
  group: ReviewGroup
}

export const ToolInfoCard = ({ group }: ToolInfoCardProps) => {
  const { tool, state, asignations } = group
  const total = asignations.length

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-h)]">
            {tool?.name ?? `Herramienta #${group.tool_id}`}
          </h3>
          {tool?.category && (
            <span className="text-sm text-[var(--text)] capitalize">{tool.category}</span>
          )}
        </div>
        <ToolStateBadge state={state} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {tool?.price !== undefined && (
          <div>
            <p className="text-[var(--text)]">Precio unitario</p>
            <p className="font-medium text-[var(--text-h)]">
              ${tool.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
        <div>
          <p className="text-[var(--text)]">Unidades asignadas</p>
          <p className="font-medium text-[var(--text-h)]">{total}</p>
        </div>
        {tool?.supplier && (
          <div>
            <p className="text-[var(--text)]">Proveedor</p>
            <p className="font-medium text-[var(--text-h)]">{tool.supplier}</p>
          </div>
        )}
      </div>
    </div>
  )
}
