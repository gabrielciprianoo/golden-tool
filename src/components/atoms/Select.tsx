import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[]
  label?: string
  error?: boolean
  required?: boolean
  showSearch?: boolean
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  searchValue?: string
}

export const Select: React.FC<SelectProps> = ({
  options,
  label,
  error,
  required,
  showSearch,
  searchPlaceholder = 'Buscar...',
  onSearchChange,
  searchValue,
  className,
  id,
  children,
  ...props
}) => {
  const selectId = id || props.name
  const [localSearch, setLocalSearch] = useState(searchValue || '')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchValue !== undefined && searchValue !== localSearch) {
      setLocalSearch(searchValue)
    }
  }, [searchValue])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)
    onSearchChange?.(value)
  }

  const filteredOptions = showSearch && localSearch && options
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(localSearch.toLowerCase())
      )
    : options

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[var(--text-h)] mb-1.5"
        >
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      {showSearch && (
        <input
          ref={searchInputRef}
          type="text"
          value={localSearch}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className={clsx(
            'w-full rounded-lg border px-4 py-2 text-sm mb-2',
            'bg-[var(--input-bg)] text-[var(--text-h)]',
            'border-[var(--input-border)] focus:outline-none focus:ring-2',
            'focus:border-primary-500 focus:ring-primary-500/20'
          )}
        />
      )}
      <select
        id={selectId}
        className={clsx(
          'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200',
          'bg-[var(--input-bg)] text-[var(--text-h)]',
          'focus:outline-none focus:ring-2',
          error
            ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20'
            : 'border-[var(--input-border)] focus:border-primary-500 focus:ring-primary-500/20',
          className
        )}
        {...props}
      >
        {filteredOptions
          ? (
            <>
              <option value="" disabled>Selecciona una opción</option>
              {filteredOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </>
          )
          : children}
      </select>
    </div>
  )
}
