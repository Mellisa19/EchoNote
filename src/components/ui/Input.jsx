import { forwardRef } from 'react'

const inputVariants = {
  default: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
}

const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
  xl: 'px-6 py-4 text-lg'
}

export const Input = forwardRef(function Input({
  type = 'text',
  variant = 'default',
  size = 'md',
  className = '',
  placeholder,
  disabled = false,
  error,
  leftIcon,
  ...props
}, ref) {
  const baseClasses = 'block w-full rounded-xl border transition-colors duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed'
  const classes = `${baseClasses} ${inputVariants[error ? 'error' : variant]} ${sizeVariants[size]} ${className}`

  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        ref={ref}
        className={`${classes} ${leftIcon ? 'pl-10' : ''}`}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({
  rows = 4,
  variant = 'default',
  size = 'md',
  className = '',
  placeholder,
  disabled = false,
  error,
  ...props
}, ref) {
  const baseClasses = 'block w-full rounded-xl border transition-colors duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed resize-none'
  const classes = `${baseClasses} ${inputVariants[error ? 'error' : variant]} ${sizeVariants[size]} ${className}`

  return (
    <textarea
      ref={ref}
      rows={rows}
      className={classes}
      placeholder={placeholder}
      disabled={disabled}
      {...props}
    />
  )
})
