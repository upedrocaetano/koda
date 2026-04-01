import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface MatrixInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const MatrixInput = forwardRef<HTMLInputElement, MatrixInputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm text-matrix-green-dim"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-md border bg-matrix-input px-3 py-2 text-sm text-matrix-green placeholder:text-matrix-green-dim/40 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-matrix-bg',
            error
              ? 'border-matrix-accent focus:ring-matrix-accent'
              : 'border-matrix-green-dim/30 focus:ring-matrix-green',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-matrix-accent" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

MatrixInput.displayName = 'MatrixInput'
