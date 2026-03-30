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

const generateId = () => Math.random().toString(36).substring(2, 15)

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
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
    reset,
    formState: { errors },
  } = useForm<ToolInput>({
    defaultValues: tool || undefined,
  })

  // 🔥 actualizar valores cuando se edita
  useEffect(() => {
    if (tool) {
      reset({
        name: tool.name,
        category: tool.category,
        price: tool.price,
        supplier: tool.supplier,
        quantity: tool.quantity,
        unassignedQuantity: tool.unassignedQuantity,
        status: tool.status,
      })
    }
  }, [tool])

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
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Input {...register('name')} placeholder="Nombre" />
      <Input {...register('category')} placeholder="Categoría" />
      <Input type="number" {...register('price', { valueAsNumber: true })} placeholder="Precio" />
      <Input {...register('supplier')} placeholder="Proveedor" />
      <Input type="number" {...register('quantity', { valueAsNumber: true })} placeholder="Cantidad" />
      <Input type="number" {...register('unassignedQuantity', { valueAsNumber: true })} placeholder="No asignada" />

      <Button type="submit" isLoading={isLoading}>
        Guardar
      </Button>
    </form>
  )
}

export const InventoryPage = () => {
  const [tools, setTools] = useState<Tool[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<ToolStatus | ''>('')

  const [filterSupplier, setFilterSupplier] = useState('')

  // 🔹 CARGAR DESDE BACKEND
  useEffect(() => {
    const cargarHerramientas = async () => {
      try {
        const res = await herramientaService.getAll()
        const data = res?.data ?? res

        const mapped = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.nombre,
          category: item.categoria,
          price: Number(item.precio),
          supplier: item.proveedor,
          quantity: item.cantidad,
          unassignedQuantity: item.cantidad_no_asignada,
          entryDate: item.fecha_ingreso,
          status: 'active',
        }))

        setTools(mapped)
      } catch (error) {
        console.error(error)
      }
    }

    cargarHerramientas()
  }, [])

  // 🔥 CREAR / EDITAR
  const handleSubmit = async (data: ToolInput) => {
    setIsSubmitting(true)

    try {
      const payload = {
        nombre: data.name,
        categoria: data.category,
        precio: data.price,
        proveedor: data.supplier,
        fecha_ingreso: new Date().toISOString().split('T')[0],
        cantidad: data.quantity,
        cantidad_no_asignada: data.unassignedQuantity,
      }

      if (editingTool) {
        // 🔥 EDITAR
        await herramientaService.update(Number(editingTool.id), payload)

        setTools(prev =>
          prev.map(t =>
            t.id === editingTool.id
              ? { ...t, ...data }
              : t
          )
        )
      } else {
        // 🔥 CREAR
        const res = await herramientaService.create(payload)

        const newTool = {
          id: res.data.data.id.toString(),
          name: res.data.data.nombre,
          category: res.data.data.categoria,
          price: Number(res.data.data.precio),
          supplier: res.data.data.proveedor,
          quantity: res.data.data.cantidad,
          unassignedQuantity: res.data.data.cantidad_no_asignada,
          entryDate: res.data.data.fecha_ingreso,
          status: 'active',
        }

        setTools(prev => [...prev, newTool])
      }

    } catch (error) {
      console.error(error)
    }

    setIsSubmitting(false)
    setIsModalOpen(false)
    setEditingTool(null)
  }

  // 🔥 ELIMINAR
  const handleDelete = async (id: string) => {
    const confirm = window.confirm('¿Eliminar herramienta?')

    if (!confirm) return

    try {
      await herramientaService.delete(Number(id))
      setTools(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  // 🔥 EDITAR
  const handleEdit = (tool: Tool) => {
    setEditingTool(tool)
    setIsModalOpen(true)
  }

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === '' || tool.status === filterStatus

      const matchesSupplier =
        filterSupplier === '' ||
        (tool.supplier || '').toLowerCase().includes(filterSupplier.toLowerCase())

      return matchesSearch && matchesStatus && matchesSupplier
    })
  }, [tools, searchTerm, filterStatus, filterSupplier])

  return (
    <div>
      <Button onClick={() => {
        setEditingTool(null)
        setIsModalOpen(true)
      }}>
        <IconPlus /> Nueva herramienta
      </Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ToolForm tool={editingTool} onSubmit={handleSubmit} isLoading={isSubmitting} />
      </Modal>

      {filteredTools.map(tool => (
        <div key={tool.id}>
          {tool.name} - ${tool.price}

          <button onClick={() => handleEdit(tool)}>Editar</button>

          <button onClick={() => handleDelete(tool.id)}>Eliminar</button>
        </div>
      ))}
    </div>
  )
}