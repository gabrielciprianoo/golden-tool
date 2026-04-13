import type { Tool, ToolCategory, ToolStatus } from '../../types/inventory'
import { IconPlus, IconSearch, IconEdit, IconTrash, IconPackage } from './InventoryIcons'
import { Input } from '../atoms/Input'
import { Select } from '../atoms/Select'
import { Button } from '../atoms/Button'
import { categoryOptions, statusOptions } from './constants'

interface ToolTableProps {
  tools: Tool[]
  isLoading: boolean
  search: string
  supplier: string
  category: ToolCategory | ''
  status: ToolStatus | ''
  totalCount: number
  onSearchChange: (value: string) => void
  onSupplierChange: (value: string) => void
  onCategoryChange: (value: ToolCategory | '') => void
  onStatusChange: (value: ToolStatus | '') => void
  onEdit: (tool: Tool) => void
  onDelete: (tool: Tool) => void
  onCreateNew: () => void
}

const StatusBadge: React.FC<{ status: ToolStatus }> = ({ status }) => {
  const styles = status === 'active'
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-gray-100 text-gray-600 border-gray-200'
  
  const labels = status === 'active' ? 'Con garantía' : 'Sin garantía'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles}`}>
      {labels}
    </span>
  )
}

const CategoryBadge: React.FC<{ category: ToolCategory }> = ({ category }) => {
  const styles = category === 'refaccion'
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-blue-100 text-blue-700 border-blue-200'
  
  const labels = category === 'refaccion' ? 'Refacción' : 'Normal'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles}`}>
      {labels}
    </span>
  )
}

const EmptyState: React.FC<{ onCreateNew: () => void }> = ({ onCreateNew }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 mb-4 rounded-full bg-[var(--accent-bg)] flex items-center justify-center">
      <IconPackage className="w-8 h-8 text-[var(--accent)]" />
    </div>
    <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
      No hay herramientas registradas
    </h3>
    <p className="text-sm text-[var(--text)] mb-6 max-w-sm">
      Comienza agregando tu primera herramienta al inventario
    </p>
    <Button onClick={onCreateNew}>
      <IconPlus /> Nueva herramienta
    </Button>
  </div>
)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value)
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const ToolTable: React.FC<ToolTableProps> = ({
  tools,
  isLoading,
  search,
  supplier,
  category,
  status,
  totalCount,
  onSearchChange,
  onSupplierChange,
  onCategoryChange,
  onStatusChange,
  onEdit,
  onDelete,
  onCreateNew,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-h)]">Inventario de Herramientas</h1>
          <p className="text-sm text-[var(--text)] mt-1">
            {tools.length} {tools.length === 1 ? 'herramienta' : 'herramientas'} 
            {tools.length !== totalCount && ` (${totalCount} en total)`}
          </p>
        </div>
<Button onClick={onCreateNew}>
            <IconPlus /> Nueva herramienta
          </Button>
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative min-w-0">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]">
              <IconSearch />
            </div>
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre..."
              className="pl-10 w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              value={supplier}
              onChange={(e) => onSupplierChange(e.target.value)}
              placeholder="Buscar proveedor..."
              className="w-full sm:w-40"
            />
            <Select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as ToolCategory | '')}
              className="w-full sm:w-44"
            >
              <option value="">Todas las categorías</option>
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as ToolStatus | '')}
              className="w-full sm:w-44"
            >
              <option value="">Todas las garantías</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tools.length === 0 ? (
          <EmptyState onCreateNew={onCreateNew} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--accent-bg)]">
                  <th className="text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider px-4 py-3">
                    Herramienta
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider px-4 py-3">
                    Categoría
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider px-4 py-3">
                    Precio
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider px-4 py-3">
                    Proveedor
                  </th>
                  <th className="text-center text-xs font-semibold text-[var(--text)] uppercase tracking-wider px-4 py-3">
                    Cantidad
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider px-4 py-3">
                    Fecha de Entrada
                  </th>
                  <th className="text-center text-xs font-semibold text-[var(--text)] uppercase tracking-wider px-4 py-3">
                    Garantía
                  </th>
                  <th className="text-right text-xs font-semibold text-[var(--text)] uppercase tracking-wider px-4 py-3">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-[var(--accent-bg)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <IconPackage className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="font-medium text-[var(--text-h)]">{tool.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={tool.category} />
                    </td>
                    <td className="px-4 py-3 text-[var(--text-h)] font-medium">
                      {formatCurrency(tool.price)}
                    </td>
                    <td className="px-4 py-3 text-[var(--text)]">
                      {tool.supplier || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-center">
                        <span className="font-medium text-[var(--text-h)]">{tool.quantity}</span>
                        <span className="text-[var(--text)] text-sm"> ({tool.unassignedQuantity})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text)] text-sm">
                      {formatDate(tool.entryDate)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={tool.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(tool)}
                          className="p-2 rounded-lg text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors"
                          title="Editar"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => onDelete(tool)}
                          className="p-2 rounded-lg text-[var(--text)] hover:bg-danger-50 hover:text-danger-600 transition-colors"
                          title="Eliminar"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
