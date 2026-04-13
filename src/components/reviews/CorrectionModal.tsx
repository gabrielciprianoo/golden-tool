import { useState } from 'react'
import { Modal } from '../organisms'
import { ToolInfoCard } from './ToolInfoCard'
import { WizardQuestion } from './WizardQuestion'
import { WizardStatePicker } from './WizardStatePicker'
import type { ReviewItemResult, ToolState } from '../../schemas/reviewSchema'

interface CorrectionModalProps {
  result: ReviewItemResult
  onConfirm: (corrected: ReviewItemResult) => void
  onClose: () => void
}

type Step = 'question' | 'state'

export const CorrectionModal = ({ result, onConfirm, onClose }: CorrectionModalProps) => {
  const [step, setStep] = useState<Step>('question')
  const [selectedState, setSelectedState] = useState<ToolState>(result.group.asignations[0].state)

  const { group } = result

  return (
    <Modal isOpen onClose={onClose} title={`Corregir — ${group.tool?.name ?? `#${group.tool_id}`}`}>
      <ToolInfoCard group={group} />

      {step === 'question' && (
        <WizardQuestion
          onStillHas={() => setStep('state')}
          onLost={() => onConfirm({ ...result, quantityPresent: 0, unitStates: [] })}
          isLoading={false}
        />
      )}

      {step === 'state' && (
        <WizardStatePicker
          previousState={group.asignations[0].state}
          selectedState={selectedState}
          onStateChange={setSelectedState}
          onConfirm={() => onConfirm({ ...result, quantityPresent: 1, unitStates: [selectedState] })}
          onBack={() => setStep('question')}
          isLoading={false}
        />
      )}
    </Modal>
  )
}
