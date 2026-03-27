import { useForm } from 'react-hook-form'
import { parse, object, string, number, optional } from 'valibot'
import { Input } from '../components/atoms/Input'
import { Select } from '../components/atoms/Select'
import { FormField } from '../components/molecules/FormField'
import { Button } from '../components/atoms/Button'
import type { ToolInput, ToolCategory } from '../types/inventory'

const toolSchema = object({
  name: string('El nombre es requerido'),
  category: string('La categoría es requerida'),
  price: number('El precio debe ser un número'),
  supplier: optional(string()),
  quantity: number('La cantidad debe ser un número'),
  unassignedQuantity: number('La cantidad no asignada debe ser un número'),
})

const categoryOptions: { value: ToolCategory; label: string }[] = [
  { value: 'normal', label: 'Herramienta Normal' },
  { value: 'refaccion', label: 'Refacción' },
]

export const InventoryPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ToolInput>()

  const onSubmit = async (data: ToolInput) => {
    try {
      const validData = parse(toolSchema, {
        ...data,
        price: Number(data.price),
        quantity: Number(data.quantity),
        unassignedQuantity: Number(data.unassignedQuantity),
      })

      const toolData = {
        ...validData,
        entryDate: new Date().toISOString(),
      }

      console.log('Herramienta registrada:', toolData)
      alert('Herramienta registrada exitosamente')
      reset()
    } catch (error) {
      console.error('Error al registrar:', error)
    }
  }

  return (
    <div className="admin-module">
      <h2 className="text-xl font-semibold text-[var(--text-h)] mb-6">Registrar Herramienta</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nombre" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="Nombre de la herramienta"
              {...register('name', { required: 'El nombre es requerido' })}
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
              })}
            />
          </FormField>

          <FormField label="Proveedor (opcional)" htmlFor="supplier">
            <Input
              id="supplier"
              placeholder="Nombre del proveedor"
              {...register('supplier')}
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
              })}
            />
          </FormField>

          <FormField label="Fecha de Ingreso" htmlFor="entryDate">
            <Input
              id="entryDate"
              type="text"
              value={new Date().toLocaleDateString('es-MX')}
              disabled
              className="bg-[var(--bg)] opacity-60"
            />
          </FormField>
        </div>

        <div className="pt-4">
          <Button type="submit" isLoading={isSubmitting}>
            Registrar Herramienta
          </Button>
        </div>
      </form>
    </div>
  )
}
