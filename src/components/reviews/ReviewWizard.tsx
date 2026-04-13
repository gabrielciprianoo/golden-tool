import { useMemo, useState } from 'react'
import type { ReviewAsignation, ReviewGroup, ReviewItemResult, ToolState } from '../../schemas/reviewSchema'
import { ToolInfoCard } from './ToolInfoCard'
import { WizardProgress } from './WizardProgress'
import { WizardQuestion } from './WizardQuestion'
import { WizardStatePicker } from './WizardStatePicker'

interface ReviewWizardProps {
  asignations: ReviewAsignation[]
  onComplete: (results: ReviewItemResult[]) => void
}

type Step = 'question' | 'state'

function toGroups(asignations: ReviewAsignation[]): ReviewGroup[] {
  return asignations.map((a) => ({
    tool_id: a.tool_id,
    tool: a.tool,
    state: a.state,
    asignations: [a],
  }))
}

export const ReviewWizard = ({ asignations, onComplete }: ReviewWizardProps) => {
  const groups = useMemo(() => toGroups(asignations), [asignations])

  const [index, setIndex] = useState(0)
  const [step, setStep] = useState<Step>('question')
  const [selectedState, setSelectedState] = useState<ToolState>(groups[0]?.state ?? 'buen estado')
  const [results, setResults] = useState<ReviewItemResult[]>([])

  const current = groups[index]
  if (!current) return null

  const advance = (result: ReviewItemResult) => {
    const updated = [...results, result]
    setResults(updated)
    const next = index + 1
    if (next >= groups.length) return onComplete(updated)
    setIndex(next)
    setStep('question')
    setSelectedState(groups[next].state)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      <WizardProgress groups={groups} currentIndex={index} />

      <div>
        <ToolInfoCard group={current} />

        {step === 'question' && (
          <WizardQuestion
            onStillHas={() => setStep('state')}
            onLost={() => advance({ group: current, quantityPresent: 0, unitStates: [] })}
            isLoading={false}
          />
        )}

        {step === 'state' && (
          <WizardStatePicker
            previousState={current.state}
            selectedState={selectedState}
            onStateChange={setSelectedState}
            onConfirm={() => advance({ group: current, quantityPresent: 1, unitStates: [selectedState] })}
            onBack={() => setStep('question')}
            isLoading={false}
          />
        )}
      </div>
    </div>
  )
}
