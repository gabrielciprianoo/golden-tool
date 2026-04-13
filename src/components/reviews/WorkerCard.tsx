import { Button, IconUser } from '../atoms'
import { formatAreaLabel } from '../../utils/toolUtils'
import type { Worker } from '../../types/worker'

interface WorkerCardProps {
  worker: Worker
  onStart: (worker: Worker) => void
}

export const WorkerCard = ({ worker, onStart }: WorkerCardProps) => (
  <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-sm transition-all">
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
        {formatAreaLabel(worker.area)}
      </span>
      <Button size="sm" onClick={() => onStart(worker)}>
        Iniciar
      </Button>
    </div>
  </div>
)
