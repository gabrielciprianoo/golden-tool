import clsx from 'clsx'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[]
  label?: string
  error?: boolean
  required?: boolean
}

export const Select: React.FC<SelectProps> = ({ 
  options, 
  label, 
  error, 
  required,
  className,
  id,
  ...props 
}) => {
  const selectId = id || props.name

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
        <option value="" disabled>
          Selecciona una opción
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
