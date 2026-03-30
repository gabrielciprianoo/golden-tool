import { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { object, string, number, optional, parse } from 'valibot'
import { Input } from '../components/atoms/Input'
import { Select } from '../components/atoms/Select'
import { FormField } from '../components/molecules/FormField'
import { Button } from '../components/atoms/Button'
import { Modal } from '../components/molecules/Modal'
import type { Tool, ToolInput, ToolCategory, ToolStatus } from '../types/inventory'
import { herramientaService } from '../services/herramientaService'

const toolSchema = object({
  name: string('El nombre es requerido'),
  category: string('La categoría es requerida'),
  price: number('El precio debe ser un número'),
  supplier: optional(string()),
  quantity: number('La cantidad debe ser un número'),
  unassignedQuantity: number('La cantidad no asignada debe ser un número'),
  status: optional(string()),
})

const categoryOptions: { value: ToolCategory; label: string }[] = [
  { value: 'normal', label: 'Herramienta Normal' },
  { value: 'refaccion', label: 'Refacción' },
]

const statusOptions: { value: ToolStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const IconEdit = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const IconTrash = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const IconPackage = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
)

interface ToolFormData {
  name: string
  category: ToolCategory
  price: number
  supplier: string
  quantity: number
  unassignedQuantity: number
  status: ToolStatus
}

const ToolForm: React.FC<{
  tool: Tool | null
  onSubmit: (data: ToolInput) => void
  isLoading: boolean
  onClose: () => void
}> = ({ tool, onSubmit, isLoading, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ToolFormData>({
    defaultValues: {
      name: '',
      category: 'normal',
      price: 0,
      supplier: '',
      quantity: 0,
      unassignedQuantity: 0,
      status: 'active',
    },
  })

  useEffect(() => {
    if (tool) {
      reset({
        name: tool.name,
        category: tool.category,
        price: tool.price,
        supplier: tool.supplier || '',
        quantity: tool.quantity,
        unassignedQuantity: tool.unassignedQuantity,
        status: tool.status,
      })
    } else {
      reset({
        name: '',
        category: 'normal',
        price: 0,
        supplier: '',
        quantity: 0,
        unassignedQuantity: 0,
        status: 'active',
      })
    }
  }, [tool, reset])

  const handleFormSubmit = (data: ToolFormData) => {
    const validData = parse(toolSchema, {
      ...data,
      price: Number(data.price),
      quantity: Number(data.quantity),
      unassignedQuantity: Number(data.unassignedQuantity),
    })

    onSubmit(validData as ToolInput)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nombre" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            {...register('name', { required: 'El nombre es requerido' })}
            placeholder="Nombre de la herramienta"
          />
        </FormField>

        <FormField label="Categoría" htmlFor="category" error={errors.category?.message}>
          <Select id="category" {...register('category', { required: 'La categoría es requerida' })}>
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Precio" htmlFor="price" error={errors.price?.message}>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { required: 'El precio es requerido', valueAsNumber: true })}
            placeholder="0.00"
          />
        </FormField>

        <FormField label="Proveedor" htmlFor="supplier" error={errors.supplier?.message}>
          <Input
            id="supplier"
            {...register('supplier')}
            placeholder="Nombre del proveedor"
          />
        </FormField>

        <FormField label="Cantidad total" htmlFor="quantity" error={errors.quantity?.message}>
          <Input
            id="quantity"
            type="number"
            {...register('quantity', { required: 'La cantidad es requerida', valueAsNumber: true })}
            placeholder="0"
          />
        </FormField>

        <FormField label="Cantidad disponible" htmlFor="unassignedQuantity" error={errors.unassignedQuantity?.message}>
          <Input
            id="unassignedQuantity"
            type="number"
            {...register('unassignedQuantity', { required: 'La cantidad es requerida', valueAsNumber: true })}
            placeholder="0"
          />
        </FormField>

        <FormField label="Estado" htmlFor="status">
          <Select id="status" {...register('status')}>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {tool ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}

const StatusBadge: React.FC<{ status: ToolStatus }> = ({ status }) => {
  const styles = status === 'active'
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-gray-100 text-gray-600 border-gray-200'
  
  const labels = status === 'active' ? 'Activo' : 'Inactivo'

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

const DeleteConfirmModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  toolName: string
  isLoading: boolean
}> = ({ isOpen, onClose, onConfirm, toolName, isLoading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg)] rounded-xl shadow-2xl border border-[var(--border)] p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center">
            <IconTrash className="w-6 h-6 text-danger-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-h)]">Eliminar herramienta</h3>
            <p className="text-sm text-[var(--text)]">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-[var(--text)] mb-6">
          ¿Estás seguro de que deseas eliminar <strong className="text-[var(--text-h)]">{toolName}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

export const InventoryPage = () => {
  const [tools, setTools] = useState<Tool[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<ToolCategory | ''>('')
  const [filterStatus, setFilterStatus] = useState<ToolStatus | ''>('')

  useEffect(() => {
    const cargarHerramientas = async () => {
      setIsLoading(true)
      try {
        const res = await herramientaService.getAll()
        if ('success' in res && !res.success) {
          console.error('Error fetching tools:', 'error' in res ? res.error : 'Unknown error')
          setTools([])
          return
        }
        
        const responseData = 'data' in res ? res.data : []
        if (!Array.isArray(responseData)) {
          setTools([])
          return
        }

        const mapped: Tool[] = responseData.map((item) => ({
          id: String(item.id),
          name: item.nombre,
          category: (item.categoria || 'normal') as ToolCategory,
          price: Number(item.precio) || 0,
          supplier: item.proveedor || '',
          quantity: Number(item.cantidad) || 0,
          unassignedQuantity: Number(item.cantidad_no_asignada) || 0,
          entryDate: item.fecha_ingreso || '',
          status: 'active' as ToolStatus,
        }))

        setTools(mapped)
      } catch (error) {
        console.error(error)
        setTools([])
      } finally {
        setIsLoading(false)
      }
    }

    cargarHerramientas()
  }, [])

  const handleSubmit = async (data: ToolInput) => {
    setIsSubmitting(true)

    try {
      const payload = {
        nombre: data.name,
        categoria: data.category,
        precio: data.price,
        proveedor: data.supplier || '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        cantidad: data.quantity,
        cantidad_no_asignada: data.unassignedQuantity,
      }

      if (editingTool) {
        await herramientaService.update(Number(editingTool.id), payload)

        setTools(prev =>
          prev.map(t =>
            t.id === editingTool.id
              ? { ...t, ...data }
              : t
          )
        )
      } else {
        const res = await herramientaService.create(payload)

        if ('success' in res && res.success && 'data' in res && res.data) {
          const created = res.data
          const newTool = {
            id: String(created.id || Date.now()),
            name: created.nombre,
            category: created.categoria as ToolCategory,
            price: Number(created.precio),
            supplier: created.proveedor || '',
            quantity: created.cantidad,
            unassignedQuantity: created.cantidad_no_asignada,
            entryDate: created.fecha_ingreso,
            status: 'active' as ToolStatus,
          }

          setTools(prev => [...prev, newTool])
        }
      }
    } catch (error) {
      console.error(error)
    }

    setIsSubmitting(false)
    setIsModalOpen(false)
    setEditingTool(null)
  }

  const handleDelete = async () => {
    if (!deletingTool) return
    
    setIsSubmitting(true)
    try {
      await herramientaService.delete(Number(deletingTool.id))
      setTools(prev => prev.filter(t => t.id !== deletingTool.id))
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
      setIsDeleteModalOpen(false)
      setDeletingTool(null)
    }
  }

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool)
    setIsModalOpen(true)
  }

  const handleCreateNew = () => {
    setEditingTool(null)
    setIsModalOpen(true)
  }

  const openDeleteModal = (tool: Tool) => {
    setDeletingTool(tool)
    setIsDeleteModalOpen(true)
  }

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === '' || tool.category === filterCategory
      const matchesStatus = filterStatus === '' || tool.status === filterStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [tools, searchTerm, filterCategory, filterStatus])

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-h)]">Inventario de Herramientas</h1>
          <p className="text-sm text-[var(--text)] mt-1">
            {filteredTools.length} {filteredTools.length === 1 ? 'herramienta' : 'herramientas'} 
            {filteredTools.length !== tools.length && ` (${tools.length} total)`}
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <IconPlus /> Nueva herramienta
        </Button>
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]">
              <IconSearch />
            </div>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre..."
              className="pl-10"
            />
          </div>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ToolCategory | '')}
            className="w-full md:w-48"
          >
            <option value="">Todas las categorías</option>
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ToolStatus | '')}
            className="w-full md:w-40"
          >
            <option value="">Todos los estados</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTools.length === 0 ? (
          <EmptyState onCreateNew={handleCreateNew} />
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
                    Ingreso
                  </th>
                  <th className="text-center text-xs font-semibold text-[var(--text)] uppercase tracking-wider px-4 py-3">
                    Estado
                  </th>
                  <th className="text-right text-xs font-semibold text-[var(--text)] uppercase tracking-wider px-4 py-3">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredTools.map((tool) => (
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
                          onClick={() => handleEdit(tool)}
                          className="p-2 rounded-lg text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors"
                          title="Editar"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(tool)}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTool ? 'Editar herramienta' : 'Nueva herramienta'}
        size="lg"
      >
        <ToolForm
          tool={editingTool}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        toolName={deletingTool?.name || ''}
        isLoading={isSubmitting}
      />
    </div>
  )
}
