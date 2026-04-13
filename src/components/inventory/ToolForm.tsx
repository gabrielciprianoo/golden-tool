import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { object, string, number, optional, parse } from 'valibot'
import { Input } from '../atoms/Input'
import { Select } from '../atoms/Select'
import { FormField } from '../molecules/FormField'
import { Button } from '../atoms/Button'
import type { Tool, ToolInput, ToolCategory, ToolStatus } from '../../types/inventory'
import { categoryOptions, statusOptions } from './constants'

const toolSchema = object({
  name: string('El nombre es requerido'),
  category: string('La categoría es requerida'),
  price: number('El precio debe ser un número'),
  supplier: optional(string()),
  quantity: number('La cantidad debe ser un número'),
  unassignedQuantity: number('La cantidad disponible debe ser un número'),
  status: optional(string()),
})

interface ToolFormData {
  name: string
  category: ToolCategory
  price: number
  supplier: string
  quantity: number
  unassignedQuantity: number
  status: ToolStatus
}

interface ToolFormProps {
  tool: Tool | null
  onSubmit: (data: ToolInput) => void
  isLoading: boolean
  onClose: () => void
}

const defaultValues: ToolFormData = {
  name: '',
  category: 'normal',
  price: 0,
  supplier: '',
  quantity: 0,
  unassignedQuantity: 0,
  status: 'active',
}

export const ToolForm: React.FC<ToolFormProps> = ({ tool, onSubmit, isLoading, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ToolFormData>({
    defaultValues,
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
      reset(defaultValues)
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

        <FormField label="Garantía" htmlFor="status">
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
