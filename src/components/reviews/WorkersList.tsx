import { IconUser, Input } from '../atoms'
import { WorkerCard } from './WorkerCard'
import type { Worker } from '../../types/worker'

interface WorkersListProps {
  workers: Worker[]
  allCount: number
  isLoading: boolean
  search: string
  onSearchChange: (value: string) => void
  onStart: (worker: Worker) => void
}

export const WorkersList = ({ workers, allCount, isLoading, search, onSearchChange, onStart }: WorkersListProps) => (
  <div>
    <div className="mb-4 flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text)] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {search && (
        <p className="text-sm text-[var(--text)] shrink-0">
          {workers.length} de {allCount} trabajadores
        </p>
      )}
    </div>

    {isLoading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 h-40 animate-pulse" />
        ))}
      </div>
    ) : workers.length === 0 && !search ? (
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-12 text-center">
        <IconUser className="w-12 h-12 text-[var(--text)] opacity-30 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-[var(--text-h)] mb-1">Sin trabajadores registrados</h3>
        <p className="text-[var(--text)] text-sm">Registra trabajadores antes de iniciar una revisión.</p>
      </div>
    ) : workers.length === 0 ? (
      <p className="text-[var(--text)] text-sm">No se encontraron trabajadores para "{search}".</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map((worker) => (
          <WorkerCard key={worker.id} worker={worker} onStart={onStart} />
        ))}
      </div>
    )}
  </div>
)
