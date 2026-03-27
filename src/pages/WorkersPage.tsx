import { useState, useEffect } from 'react'
import { Button, Input, Select } from '../components/atoms'
import { FormField } from '../components/molecules'
import { useWorkersStore } from '../stores/workersStore'
import { WORKER_AREAS, type WorkerArea, type CreateWorkerInput } from '../types/worker'

interface FormErrors {
  name?: string
  lastName?: string
  area?: string
}

export const WorkersPage = () => {
  const { workers, isLoading, addWorker, deleteWorker, getNextCode } = useWorkersStore()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [area, setArea] = useState<WorkerArea | ''>('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    setCode(getNextCode())
  }, [workers, getNextCode])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Los apellidos son requeridos'
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Los apellidos deben tener al menos 2 caracteres'
    }

    if (!area) {
      newErrors.area = 'Selecciona un área'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')

    if (!validateForm()) return

    const input: CreateWorkerInput = {
      name: name.trim(),
      lastName: lastName.trim(),
      area: area as WorkerArea,
    }

    const success = await addWorker(input)

    if (success) {
      setSuccessMessage('Trabajador registrado correctamente')
      setName('')
      setLastName('')
      setArea('')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este trabajador?')) {
      await deleteWorker(id)
    }
  }

  const areaOptions = WORKER_AREAS.map((a) => ({ value: a.value, label: a.label }))

  return (
    <div className="admin-module">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-h)] mb-2">Registrar Trabajador</h2>
        <p className="text-[var(--text)] text-sm">Completa los datos del nuevo trabajador</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Código de Trabajador" htmlFor="code">
            <Input
              id="code"
              value={code}
              readOnly
              className="bg-[var(--surface-50)] dark:bg-[var(--surface-800)] cursor-not-allowed"
            />
          </FormField>

          <FormField label="Área" htmlFor="area" error={errors.area}>
            <Select
              id="area"
              name="area"
              options={areaOptions}
              value={area}
              onChange={(e) => setArea(e.target.value as WorkerArea)}
              required
              error={!!errors.area}
            />
          </FormField>

          <FormField label="Nombre" htmlFor="name" error={errors.name}>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa el nombre"
              required
              error={!!errors.name}
            />
          </FormField>

          <FormField label="Apellidos" htmlFor="lastName" error={errors.lastName}>
            <Input
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ingresa los apellidos"
              required
              error={!!errors.lastName}
            />
          </FormField>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Button type="submit" isLoading={isLoading}>
            Registrar Trabajador
          </Button>
          {successMessage && (
            <span className="text-success-600 text-sm font-medium">{successMessage}</span>
          )}
        </div>
      </form>

      {workers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-h)] mb-4">
            Trabajadores Registrados ({workers.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-[var(--border)] rounded-lg overflow-hidden">
              <thead className="bg-[var(--surface-50)] dark:bg-[var(--surface-800)]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-h)]">Código</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-h)]">Nombre</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-h)]">Apellidos</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-h)]">Área</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-[var(--text-h)]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id} className="border-t border-[var(--border)] hover:bg-[var(--accent-bg)]">
                    <td className="px-4 py-3 text-sm text-[var(--text-h)] font-medium">{worker.code}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text)]">{worker.name}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text)]">{worker.lastName}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text)]">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                        {worker.area === 'montaje/desmontaje' ? 'Montaje/Desmontaje' : 'Armado/Desarmado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(worker.id)}
                        className="text-danger-500 hover:text-danger-600"
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
