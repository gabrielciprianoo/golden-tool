import { TabButton } from '../components/atoms'
import { ToastContainer } from '../components/organisms'
import { ReviewWizard } from '../components/reviews/ReviewWizard'
import { ReviewSummary } from '../components/reviews/ReviewSummary'
import { ReviewHistoryList } from '../components/reviews/ReviewHistoryList'
import { WorkersList } from '../components/reviews/WorkersList'
import { useReviewFlow } from '../hooks/useReviewFlow'

export const ReviewsPage = () => {
  const {
    tab, setTab,
    view, workerName, isInFlow, loadingMessage,
    asignations, wizardResults, setWizardResults,
    reviewName, setReviewName,
    workerSearch, setWorkerSearch,
    filteredWorkers, allWorkersCount, workersLoading,
    isSaving,
    startReview, cancelReview, completeWizard, saveReview,
  } = useReviewFlow()

  return (
    <div className="admin-module">
      <ToastContainer />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-h)] mb-4">Revisiones</h2>

        {!isInFlow && (
          <div className="flex gap-1 border-b border-[var(--border)]">
            <TabButton active={tab === 'nueva'} onClick={() => setTab('nueva')}>Nueva revisión</TabButton>
            <TabButton active={tab === 'historial'} onClick={() => setTab('historial')}>Historial</TabButton>
          </div>
        )}

        {isInFlow && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text)]">
              {view === 'loading' && (loadingMessage ?? `Cargando herramientas de ${workerName}...`)}
              {view === 'wizard' && `Revisando herramientas de ${workerName}`}
              {view === 'summary' && `Resumen — ${workerName}`}
            </p>
            <button
              onClick={cancelReview}
              className="flex items-center gap-1.5 text-sm text-[var(--text)] hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar revisión
            </button>
          </div>
        )}
      </div>

      {tab === 'nueva' && !isInFlow && (
        <WorkersList
          workers={filteredWorkers}
          allCount={allWorkersCount}
          isLoading={workersLoading || view === 'loading'}
          search={workerSearch}
          onSearchChange={setWorkerSearch}
          onStart={startReview}
        />
      )}

      {view === 'wizard' && (
        <ReviewWizard asignations={asignations} onComplete={completeWizard} />
      )}

      {view === 'summary' && (
        <ReviewSummary
          results={wizardResults}
          onResultsChange={setWizardResults}
          reviewName={reviewName}
          onNameChange={setReviewName}
          onConfirm={saveReview}
          isLoading={isSaving}
        />
      )}

      {tab === 'historial' && !isInFlow && <ReviewHistoryList />}
    </div>
  )
}
