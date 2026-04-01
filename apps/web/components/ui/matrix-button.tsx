import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-green focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-matrix-green text-matrix-bg hover:bg-matrix-green-dim hover:shadow-[0_0_15px_rgba(0,255,65,0.4)]',
        secondary:
          'border border-matrix-green text-matrix-green bg-transparent hover:bg-matrix-green/10 hover:shadow-[0_0_10px_rgba(0,255,65,0.2)]',
        danger:
          'border border-matrix-accent text-matrix-accent bg-transparent hover:bg-matrix-accent/10 hover:shadow-[0_0_10px_rgba(233,69,96,0.2)]',
        ghost:
          'text-matrix-green-dim hover:text-matrix-green hover:bg-matrix-green/5',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

interface MatrixButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export function MatrixButton({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: MatrixButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
