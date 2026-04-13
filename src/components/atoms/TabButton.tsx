interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

export const TabButton = ({ active, onClick, children }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
      active
        ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
        : 'border-transparent text-[var(--text)] hover:text-[var(--text-h)] hover:border-[var(--border)]'
    }`}
  >
    {children}
  </button>
)
