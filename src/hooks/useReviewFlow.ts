import { useMemo, useState } from 'react'
import { useWorkers } from './useWorkers'
import { useWorkerAsignationsForReview, useCreateReview } from './useReviews'
import { useToastStore } from '../stores/toastStore'
import type { ReviewItemResult } from '../schemas/reviewSchema'
import type { Worker } from '../types/worker'

export type ReviewTab = 'nueva' | 'historial'
export type ReviewView = 'workers' | 'loading' | 'wizard' | 'summary'

export const useReviewFlow = () => {
  const { data: workers = [], isLoading: workersLoading } = useWorkers()
  const createReview = useCreateReview()
  const { addToast } = useToastStore()

  const [tab, setTab] = useState<ReviewTab>('nueva')
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [inSummary, setInSummary] = useState(false)
  const [wizardResults, setWizardResults] = useState<ReviewItemResult[]>([])
  const [reviewName, setReviewName] = useState('')
  const [workerSearch, setWorkerSearch] = useState('')

  const workerAsignationsQuery = useWorkerAsignationsForReview(
    selectedWorker !== null && !inSummary ? Number(selectedWorker.id) : null
  )
  const asignations = workerAsignationsQuery.data ?? []

  // Derive view from state — no useEffect / setState needed
  const view: ReviewView = useMemo(() => {
    if (selectedWorker === null) return 'workers'
    if (inSummary) return 'summary'
    if (workerAsignationsQuery.isSuccess && asignations.length > 0) return 'wizard'
    return 'loading'
  }, [selectedWorker, inSummary, workerAsignationsQuery.isSuccess, asignations.length])

  // Message shown in the loading screen when query settles with nothing to review
  const loadingMessage =
    workerAsignationsQuery.isError ? 'Error al cargar las herramientas del trabajador' :
    workerAsignationsQuery.isSuccess && asignations.length === 0 ? 'Este trabajador no tiene herramientas asignadas' :
    null

  const startReview = (worker: Worker) => {
    setSelectedWorker(worker)
    setInSummary(false)
  }

  const cancelReview = () => {
    setSelectedWorker(null)
    setInSummary(false)
    setWizardResults([])
  }

  const completeWizard = (results: ReviewItemResult[]) => {
    setWizardResults(results)
    setReviewName('')
    setInSummary(true)
  }

  const saveReview = async () => {
    if (!selectedWorker || !reviewName.trim()) return

    const res = await createReview.mutateAsync({
      worker_id: Number(selectedWorker.id),
      name: reviewName.trim(),
      items: wizardResults.flatMap((r) =>
        r.group.asignations.map((a, i) => ({
          asignation_id: a.id,
          quantity_present: i < r.quantityPresent ? 1 : 0,
          new_state: i < r.quantityPresent ? r.unitStates[i] : undefined,
        }))
      ),
    })

    if ('error' in res) {
      addToast(res.error ?? 'Error al guardar la revisión', 'error')
      return
    }

    addToast('Revisión guardada correctamente', 'success')
    setSelectedWorker(null)
    setInSummary(false)
    setWizardResults([])
    setWorkerSearch('')
    setTab('historial')
  }

  const filteredWorkers = useMemo(() => {
    const q = workerSearch.toLowerCase().trim()
    if (!q) return workers
    return workers.filter(
      (w) =>
        `${w.name} ${w.lastname}`.toLowerCase().includes(q) ||
        w.worker_code.toLowerCase().includes(q)
    )
  }, [workers, workerSearch])

  const workerName = selectedWorker
    ? `${selectedWorker.name} ${selectedWorker.lastname}`
    : ''

  const isInFlow = view === 'wizard' || view === 'summary' || view === 'loading'

  return {
    // state
    tab,
    setTab,
    view,
    workerName,
    isInFlow,
    loadingMessage,
    asignations,
    wizardResults,
    setWizardResults,
    reviewName,
    setReviewName,
    workerSearch,
    setWorkerSearch,
    filteredWorkers,
    allWorkersCount: workers.length,
    workersLoading,
    isSaving: createReview.isPending,
    // actions
    startReview,
    cancelReview,
    completeWizard,
    saveReview,
  }
}
