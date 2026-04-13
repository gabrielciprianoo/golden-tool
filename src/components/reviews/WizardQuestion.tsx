import { Button } from '../atoms'

interface WizardQuestionProps {
  onStillHas: () => void
  onLost: () => void
  isLoading: boolean
}

export const WizardQuestion = ({ onStillHas, onLost, isLoading }: WizardQuestionProps) => (
  <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6">
    <p className="text-lg font-semibold text-[var(--text-h)] mb-6 text-center">
      ¿El trabajador aún cuenta con esta herramienta?
    </p>
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant="outline"
        size="lg"
        onClick={onStillHas}
        disabled={isLoading}
        className="flex flex-col items-center gap-2 h-auto py-5"
      >
        <span className="text-2xl">✓</span>
        <span>Sí, la tiene</span>
      </Button>
      <Button
        variant="danger"
        size="lg"
        onClick={onLost}
        isLoading={isLoading}
        className="flex flex-col items-center gap-2 h-auto py-5"
      >
        <span className="text-2xl">✗</span>
        <span>No, se perdió</span>
      </Button>
    </div>
  </div>
)
