import { motion } from 'framer-motion'

const cardVariants = {
  default: 'bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 transition-colors',
  elevated: 'bg-white/10 border border-white/20 shadow-xl',
  minimal: 'bg-transparent border border-white/10 hover:border-white/20',
  glass: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all',
  purple: 'bg-gradient-brand-purple border-none text-white',
  blue: 'bg-gradient-brand-blue border-none text-white',
  orange: 'bg-gradient-brand-orange border-none text-white'
}

export default function Card({ 
  children, 
  variant = 'default', 
  className = '', 
  padding = 'md',
  hover = true,
  ...props 
}) {
  const paddingVariants = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  const baseClasses = 'rounded-2xl transition-all duration-200'
  const classes = `${baseClasses} ${cardVariants[variant]} ${paddingVariants[padding]} ${className}`

  const MotionComponent = hover ? motion.div : 'div'

  return (
    <MotionComponent
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={classes}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}
