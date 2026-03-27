import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { object, string, number, optional, parse } from 'valibot'
import { Input } from '../components/atoms/Input'
import { Select } from '../components/atoms/Select'
import { FormField } from '../components/molecules/FormField'
import { Button } from '../components/atoms/Button'
import { Modal } from '../components/molecules/Modal'
import type { Tool, ToolInput, ToolCategory, ToolStatus } from '../types/inventory'

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

const generateId = () => Math.random().toString(36).substring(2, 15)

const initialTools: Tool[] = [
  {
    id: generateId(),
    name: 'Llave Stilson 14"',
    category: 'normal',
    price: 450,
    supplier: 'Ferretería Industrial',
    entryDate: new Date().toISOString(),
    quantity: 5,
    unassignedQuantity: 3,
    status: 'active',
  },
  {
    id: generateId(),
    name: 'Juego de Dados 200 pzas',
    category: 'refaccion',
    price: 1200,
    supplier: 'Herramientas Express',
    entryDate: new Date().toISOString(),
    quantity: 2,
    unassignedQuantity: 2,
    status: 'active',
  },
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

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const ToolForm: React.FC<{
  tool: Tool | null
  onSubmit: (data: ToolInput) => void
  isLoading: boolean
}> = ({ tool, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ToolInput>({
    defaultValues: tool ? {
      name: tool.name,
      category: tool.category,
      price: tool.price,
      supplier: tool.supplier,
      quantity: tool.quantity,
      unassignedQuantity: tool.unassignedQuantity,
      status: tool.status,
    } : undefined,
  })

  const handleFormSubmit = (data: ToolInput) => {
    const validData = parse(toolSchema, {
      ...data,
      price: Number(data.price),
      quantity: Number(data.quantity),
      unassignedQuantity: Number(data.unassignedQuantity),
    })
    onSubmit(validData as ToolInput)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Nombre" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            placeholder="Nombre de la herramienta"
            {...register('name', { 
              required: 'El nombre es requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              pattern: {
                value: /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/,
                message: 'Solo letras, números y espacios',
              },
            })}
          />
        </FormField>

        <FormField label="Categoría" htmlFor="category" error={errors.category?.message}>
          <Select
            id="category"
            {...register('category', { required: 'La categoría es requerida' })}
          >
            <option value="">Seleccionar categoría</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Precio" htmlFor="price" error={errors.price?.message}>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('price', { 
              required: 'El precio es requerido',
              valueAsNumber: true,
              min: { value: 0, message: 'Debe ser positivo' },
            })}
          />
        </FormField>

        <FormField label="Proveedor" htmlFor="supplier">
          <Input
            id="supplier"
            placeholder="Nombre del proveedor"
            {...register('supplier', {
              pattern: {
                value: /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ\-.,]+$/,
                message: 'Caracteres no válidos',
              },
            })}
          />
        </FormField>

        <FormField label="Cantidad" htmlFor="quantity" error={errors.quantity?.message}>
          <Input
            id="quantity"
            type="number"
            min="0"
            placeholder="0"
            {...register('quantity', { 
              required: 'La cantidad es requerida',
              valueAsNumber: true,
              min: { value: 1, message: 'Mínimo 1' },
            })}
          />
        </FormField>

        <FormField label="Cantidad No Asignada" htmlFor="unassignedQuantity" error={errors.unassignedQuantity?.message}>
          <Input
            id="unassignedQuantity"
            type="number"
            min="0"
            placeholder="0"
            {...register('unassignedQuantity', { 
              required: 'La cantidad no asignada es requerida',
              valueAsNumber: true,
              min: { value: 0, message: 'No puede ser negativa' },
            })}
          />
        </FormField>

        {tool && (
          <FormField label="Estado" htmlFor="status" error={errors.status?.message}>
            <Select
              id="status"
              {...register('status')}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormField>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button type="submit" isLoading={isLoading}>
          {tool ? 'Guardar Cambios' : 'Registrar Herramienta'}
        </Button>
      </div>
    </form>
  )
}

export const InventoryPage = () => {
  const [tools, setTools] = useState<Tool[]>(initialTools)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<ToolStatus | ''>('')
  const [filterSupplier, setFilterSupplier] = useState('')

  const suppliers = useMemo(() => {
    const unique = [...new Set(tools.map(t => t.supplier || '').filter(Boolean))]
    return unique.sort()
  }, [tools])

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === '' || tool.status === filterStatus
      const matchesSupplier = filterSupplier === '' || tool.supplier.toLowerCase().includes(filterSupplier.toLowerCase())
      return matchesSearch && matchesStatus && matchesSupplier
    })
  }, [tools, searchTerm, filterStatus, filterSupplier])

  const handleOpenModal = (tool: Tool | null = null) => {
    setEditingTool(tool)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTool(null)
  }

  const handleSubmit = async (data: ToolInput) => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    if (editingTool) {
      setTools(prev => prev.map(t => 
        t.id === editingTool.id 
          ? { ...t, ...data, status: data.status as ToolStatus || 'active' }
          : t
      ))
    } else {
      const newTool: Tool = {
        id: generateId(),
        name: data.name,
        category: data.category,
        price: Number(data.price),
        supplier: data.supplier || '',
        quantity: Number(data.quantity),
        unassignedQuantity: Number(data.unassignedQuantity),
        entryDate: new Date().toISOString(),
        status: 'active',
      }
      setTools(prev => [...prev, newTool])
    }

    setIsSubmitting(false)
    handleCloseModal()
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('¿Estás seguro de eliminar esta herramienta?')
    if (confirmed) {
      setTools(prev => prev.filter(t => t.id !== id))
    }
  }

  const getCategoryLabel = (category: ToolCategory) => {
    return categoryOptions.find(c => c.value === category)?.label || category
  }

  return (
    <div className="admin-module space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-h)]">Gestión de Herramientas</h2>
          <p className="text-sm text-[var(--text)]">{tools.length} herramientas registradas</p>
        </div>
        <Button onClick={() => handleOpenModal(null)} leftIcon={<IconPlus />}>
          Nueva Herramienta
        </Button>
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]">
              <IconSearch />
            </div>
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ToolStatus | '')}
          >
            <option value="">Todos los estados</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          <Select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
          >
            <option value="">Todos los proveedores</option>
            {suppliers.map(sup => (
              <option key={sup} value={sup}>{sup}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Proveedor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Cantidad</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">No Asignada</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--text)]">
                    No se encontraron herramientas
                  </td>
                </tr>
              ) : (
                filteredTools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-[var(--accent-bg)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[var(--text-h)]">{tool.name}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text)]">{getCategoryLabel(tool.category)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text)]">${tool.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text)]">{tool.supplier || '-'}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text)]">{tool.quantity}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text)]">{tool.unassignedQuantity}</td>
                    <td className="px-4 py-3">
                      <span className={[
                        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                        tool.status === 'active' 
                          ? 'bg-success-100 text-success-700' 
                          : 'bg-surface-200 text-surface-600'
                      ]}>
                        {tool.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(tool)}
                          className="p-1.5 rounded-lg text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(tool.id)}
                          className="p-1.5 rounded-lg text-[var(--text)] hover:bg-danger-50 hover:text-danger-600 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTool ? 'Editar Herramienta' : 'Nueva Herramienta'}
        size="md"
      >
        <ToolForm
          tool={editingTool}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  )
}
