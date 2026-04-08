import { useState, useEffect, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Select, IconSearch, IconEdit, IconTrash, IconUser, IconWrench, IconEye } from '../components/atoms'
import { Modal, ToastContainer } from '../components/organisms'
import { FormField } from '../components/molecules'
import { useToastStore } from '../stores/toastStore'
import { useWorkers, useCreateWorker, useUpdateWorker, useDeleteWorker } from '../hooks/useWorkers'
import { WORKER_AREAS, type WorkerArea, type CreateWorkerInput, type Worker } from '../types/worker'
import { validateField, workerValidationRules } from '../schemas/workerSchema'
import { WorkerDetailsModal } from '../components/workers/WorkerDetailsModal'

type WorkerFormValues = {
  name: string
  lastName: string
  area: WorkerArea | ''
}

export const WorkersPage = () => {
  const navigate = useNavigate()
  const { data: workers = [], isLoading: workersLoading } = useWorkers()
  const createWorkerMutation = useCreateWorker()
  const updateWorkerMutation = useUpdateWorker()
  const deleteWorkerMutation = useDeleteWorker()
  
  const { addToast } = useToastStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
  const [detailsWorker, setDetailsWorker] = useState<Worker | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterArea, setFilterArea] = useState<WorkerArea | ''>('')

  const isLoading = workersLoading || createWorkerMutation.isPending || updateWorkerMutation.isPending || deleteWorkerMutation.isPending

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WorkerFormValues>()

  const filteredWorkers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return workers.filter((worker) => {
      const matchesSearch = !term || 
        worker.name.toLowerCase().includes(term) ||
        worker.lastname.toLowerCase().includes(term) ||
        worker.worker_code.toLowerCase().includes(term)
      const matchesArea = !filterArea || worker.area === filterArea
      return matchesSearch && matchesArea
    })
  }, [workers, searchTerm, filterArea])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const getNextCode = useCallback(() => {
    const count = workers.length
    const num = count + 1
    return `TRB-${num.toString().padStart(3, '0')}`
  }, [workers.length])

  const handleOpenModal = useCallback((worker?: Worker) => {
    if (worker) {
      setEditingWorker(worker)
      setValue('name', worker.name)
      setValue('lastName', worker.lastname)
      setValue('area', worker.area)
    } else {
      setEditingWorker(null)
      reset({ name: '', lastName: '', area: '' as WorkerArea | '' })
    }
    setIsModalOpen(true)
  }, [reset, setValue])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingWorker(null)
    reset()
  }, [reset])

  const onSubmit = async (data: WorkerFormValues) => {
    if (!data.area) {
      addToast('Selecciona un área', 'error')
      return
    }

    const input: CreateWorkerInput = {
      name: data.name.trim(),
      lastName: data.lastName.trim(),
      area: data.area,
    }

    let success = false

    try {
      if (editingWorker) {
        await updateWorkerMutation.mutateAsync({ id: editingWorker.id, data: input })
        addToast('Trabajador actualizado correctamente', 'success')
        success = true
      } else {
        await createWorkerMutation.mutateAsync(input)
        addToast('Trabajador registrado correctamente', 'success')
        reset()
        success = true
      }
    } catch {
      addToast('Error al guardar trabajador', 'error')
    }

    if (success) {
      handleCloseModal()
    }
  }

  const handleDelete = async (id: string) => {
    const worker = workers.find((w) => w.id === id)
    if (confirm(`¿Estás seguro de eliminar al trabajador ${worker?.name} ${worker?.lastname}?`)) {
      try {
        await deleteWorkerMutation.mutateAsync(id)
        addToast('Trabajador eliminado correctamente', 'success')
      } catch {
        addToast('Error al eliminar trabajador', 'error')
      }
    }
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setFilterArea('')
  }

  const hasFilters = searchTerm || filterArea

  const areaOptions = [
    { value: '', label: 'Todas las áreas' },
    ...WORKER_AREAS.map((a) => ({ value: a.value, label: a.label })),
  ]

  return (
    <div className="admin-module">
      <ToastContainer />

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-h)] mb-2">Trabajadores</h2>
        <p className="text-[var(--text)] text-sm">Gestiona los trabajadores registrados</p>
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1.5">
              Buscar trabajador
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]">
                <IconSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-h)] placeholder:text-[var(--text)] focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </div>

          <div className="w-full md:w-64">
            <Select
              label="Filtrar por área"
              options={areaOptions}
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value as WorkerArea | '')}
            />
          </div>

          {(searchTerm || filterArea) && (
            <Button variant="ghost" size="md" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          )}

          <Button onClick={() => handleOpenModal()}>
            + Nuevo Trabajador
          </Button>
        </div>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <IconUser className="w-16 h-16 text-[var(--text)] opacity-40" />
          </div>
          {hasFilters ? (
            <>
              <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-[var(--text)] text-sm mb-4">
                Intenta con otros filtros o términos de búsqueda
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar filtros
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
                No hay trabajadores registrados
              </h3>
              <p className="text-[var(--text)] text-sm mb-4">
                Comienza agregando el primer trabajador
              </p>
              <Button onClick={() => handleOpenModal()}>
                + Registrar Trabajador
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--surface-50)] dark:bg-[var(--surface-800)] border-b border-[var(--border)]">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Código</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Nombre</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Apellidos</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Área</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="border-b border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors">
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-200">
                        {worker.worker_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-h)]">{worker.name}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text)]">{worker.lastname}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text)]">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-200">
                        {worker.area === 'montaje/desmontaje' ? 'Montaje/Desmontaje' : 'Armado/Desarmado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDetailsWorker(worker)}
                          className="p-2 rounded-lg text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors"
                          title="Ver detalles"
                        >
                          <IconEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/workers/manage/${worker.id}`)}
                          className="p-2 rounded-lg text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors"
                          title="Gestionar Herramientas"
                        >
                          <IconWrench className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(worker)}
                          className="p-2 rounded-lg text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors"
                          title="Editar"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(worker.id)}
                          className="p-2 rounded-lg text-[var(--text)] hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-900/20 transition-colors"
                          title="Eliminar"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-50)] dark:bg-[var(--surface-800)]">
            <p className="text-sm text-[var(--text)]">
              Mostrando <span className="font-medium text-[var(--text-h)]">{filteredWorkers.length}</span> de{' '}
              <span className="font-medium text-[var(--text-h)]">{workers.length}</span> trabajadores
            </p>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingWorker ? 'Editar Trabajador' : 'Nuevo Trabajador'}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
              {editingWorker ? 'Guardar cambios' : 'Registrar'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editingWorker && (
            <FormField label="Código de Trabajador" htmlFor="code">
              <Input
                id="code"
                value={getNextCode()}
                readOnly
                className="bg-[var(--surface-50)] dark:bg-[var(--surface-800)] cursor-not-allowed"
              />
            </FormField>
          )}

          <FormField label="Nombre" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="Ingresa el nombre"
              {...register('name', {
                validate: (value) => validateField('name', value),
              })}
            />
          </FormField>

          <FormField label="Apellidos" htmlFor="lastName" error={errors.lastName?.message}>
            <Input
              id="lastName"
              placeholder="Ingresa los apellidos"
              {...register('lastName', {
                validate: (value) => validateField('lastName', value),
              })}
            />
          </FormField>

          <FormField label="Área" htmlFor="area" error={errors.area?.message}>
            <Select
              id="area"
              options={WORKER_AREAS.map((a) => ({ value: a.value, label: a.label }))}
              {...register('area', {
                required: workerValidationRules.area.required,
              })}
            />
          </FormField>
        </form>
      </Modal>

      <WorkerDetailsModal
        isOpen={!!detailsWorker}
        onClose={() => setDetailsWorker(null)}
        worker={detailsWorker}
      />
    </div>
  )
}
