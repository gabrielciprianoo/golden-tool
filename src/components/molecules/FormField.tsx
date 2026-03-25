import type { FormFieldProps } from '../../types'

export const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, error, children }) => {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[var(--text-h)]"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-danger-500">{error}</p>
      )}
    </div>
  )
}
