import { Button, Select } from '../atoms'
import { TOOL_STATE_OPTIONS } from './constants'
import { getStateLabel } from '../../utils/toolUtils'
import type { ToolState } from '../../schemas/reviewSchema'

interface WizardStatePickerProps {
  previousState: ToolState
  selectedState: ToolState
  onStateChange: (state: ToolState) => void
  onConfirm: () => void
  onBack: () => void
  isLoading: boolean
  subtitle?: string
}

export const WizardStatePicker = ({
  previousState,
  selectedState,
  onStateChange,
  onConfirm,
  onBack,
  isLoading,
  subtitle,
}: WizardStatePickerProps) => (
  <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6">
    <p className="text-lg font-semibold text-[var(--text-h)] mb-1 text-center">
      ¿En qué estado se encuentra?
    </p>
    {subtitle && (
      <p className="text-sm text-[var(--accent)] font-medium text-center mb-1">{subtitle}</p>
    )}
    <p className="text-sm text-[var(--text)] text-center mb-6" style={{ marginTop: subtitle ? undefined : '0.5rem' }}>
      Estado anterior:{' '}
      <span className="font-medium">{getStateLabel(previousState)}</span>
    </p>

    <div className="mb-6">
      <Select
        options={TOOL_STATE_OPTIONS}
        value={selectedState}
        onChange={(e) => onStateChange(e.target.value as ToolState)}
      />
    </div>

    <div className="flex gap-3">
      <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex-1">
        Atrás
      </Button>
      <Button onClick={onConfirm} isLoading={isLoading} className="flex-1">
        Confirmar estado
      </Button>
    </div>
  </div>
)
