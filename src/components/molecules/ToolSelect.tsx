import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

export interface ToolOption {
  value: string
  name: string
  category: string
  price: number
  supplier: string
  warranty?: string
}

export interface ToolSelectProps {
  label?: string
  options: ToolOption[]
  value: string
  onChange: (value: string) => void
  error?: boolean
  required?: boolean
  searchPlaceholder?: string
}

export const ToolSelect: React.FC<ToolSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  required,
  searchPlaceholder = 'Buscar herramienta...',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  const filteredOptions = searchTerm
    ? options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelectOption = (optValue: string) => {
    onChange(optValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleOpenDropdown = () => {
    setIsOpen(true)
    setSearchTerm('')
  }

  return (
    <div className="w-full" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-h)] mb-1.5">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={handleOpenDropdown}
          className={clsx(
            'w-full rounded-lg border px-4 py-3 text-sm text-left transition-all duration-200',
            'bg-[var(--input-bg)] text-[var(--text-h)]',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-[var(--input-border)] focus:border-primary-500 focus:ring-primary-500/20',
            !value && 'text-[var(--text-muted)]'
          )}
        >
          {selectedOption ? (
            <div>
              <div className="font-medium text-base">{selectedOption.name}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1 space-y-0.5">
                <div>▸ Categoría: {selectedOption.category}</div>
                <div>▸ Precio: ${selectedOption.price}</div>
                <div>▸ Proveedor: {selectedOption.supplier}</div>
              </div>
            </div>
          ) : (
            <span>Selecciona una opción</span>
          )}
        </button>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={clsx(
              'w-4 h-4 text-[var(--text-muted)] transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-[var(--input-border)] shadow-lg max-h-80 overflow-hidden">
            <div className="p-2 border-b border-[var(--input-border)]">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-[var(--input-bg)] text-[var(--text-h)] border-[var(--input-border)] focus:outline-none focus:ring-2 focus:border-primary-500"
              />
            </div>

            <div className="overflow-y-auto max-h-60">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-6 text-center text-[var(--text-muted)] text-sm">
                  No se encontraron herramientas
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={clsx(
                      'w-full px-4 py-3 text-left hover:bg-[var(--bg-hover)] transition-colors',
                      opt.value === value && 'bg-primary-50 hover:bg-primary-50'
                    )}
                  >
                    <div className="font-medium text-base text-[var(--text-h)]">{opt.name}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 space-y-0.5">
                      <div>▸ Categoría: {opt.category}</div>
                      <div>▸ Precio: ${opt.price}</div>
                      <div>▸ Proveedor: {opt.supplier}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}