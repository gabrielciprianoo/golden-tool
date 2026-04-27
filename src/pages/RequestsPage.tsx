import { useState, useEffect, useMemo } from 'react'
import { Button, Select, IconSearch, IconUser } from '../components/atoms'
import { ToastContainer } from '../components/organisms'
import { useWorkers } from '../hooks/useWorkers'
import { WORKER_AREAS, type WorkerArea } from '../types/worker'

export const RequestsPage = () => {
  const { data: workers = [], isLoading, error } = useWorkers()
  
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterArea, setFilterArea] = useState<WorkerArea | ''>('')

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
        <h2 className="text-2xl font-bold text-[var(--text-h)] mb-2">Solicitudes</h2>
        <p className="text-[var(--text)] text-sm">Gestiona las solicitudes de herramientas</p>
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
          ) : isLoading ? (
            <>
              <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
                Cargando trabajadores...
              </h3>
            </>
          ) : error ? (
            <>
              <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
                Error al cargar trabajadores
              </h3>
              <p className="text-[var(--text)] text-sm mb-4">
                No se pudieron conectar con el servidor
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
                No hay trabajadores registrados
              </h3>
              <p className="text-[var(--text)] text-sm mb-4">
                No hay trabajadores disponibles para crear solicitudes
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <div key={worker.id} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center shrink-0">
                  <IconUser className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-h)] truncate">{worker.name} {worker.lastname}</p>
                  <p className="text-xs text-[var(--text)] font-mono">{worker.worker_code}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--surface-50)] dark:bg-[var(--surface-700)] text-[var(--text-h)] border border-[var(--border)]">
                  {worker.area === 'montaje/desmontaje' ? 'Montaje/Desmontaje' : 'Armado/Desarmado'}
                </span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {}}>
                  Solicitudes
                </Button>
                <Button size="sm" onClick={() => {}}>
                  Iniciar solicitud
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-50)] dark:bg-[var(--surface-800)]">
        <p className="text-sm text-[var(--text)]">
          Mostrando <span className="font-medium text-[var(--text-h)]">{filteredWorkers.length}</span> de{' '}
          <span className="font-medium text-[var(--text-h)]">{workers.length}</span> trabajadores
        </p>
      </div>
    </div>
  )
}