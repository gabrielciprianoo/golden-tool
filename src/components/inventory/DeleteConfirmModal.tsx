import { Button } from '../atoms/Button'
import { IconTrash } from './InventoryIcons'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  toolName: string
  isLoading: boolean
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  toolName,
  isLoading,
}) => {
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
