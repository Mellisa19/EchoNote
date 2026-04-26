import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signup, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      await signup(formData.name, formData.email, formData.password)
      
      // Send welcome email via backend
      try {
        await fetch('/api/auth/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, name: formData.name })
        });
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr);
        // Don't block navigation if email fails
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async (useRedirect = false) => {
    setIsGoogleLoading(true)
    setError('')
    
    try {
      const result = await signInWithGoogle(useRedirect)
      if (!useRedirect && result) {
        // Send welcome email for Google sign-up
        try {
          await fetch('/api/auth/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: result.user.email, 
              name: result.user.displayName || result.user.email?.split('@')[0] || 'User' 
            })
          });
        } catch (emailErr) {
          console.error('Failed to send welcome email:', emailErr);
          // Don't block navigation if email fails
        }
        
        navigate('/dashboard')
      }
      // For redirect method, the navigation will be handled by the redirect result check
    } catch (err) {
      setError(err.message || 'Failed to sign up with Google')
    } finally {
      if (!useRedirect) {
        setIsGoogleLoading(false)
      }
    }
  }

  const handleGoogleRedirect = () => {
    handleGoogleSignIn(true)
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white overflow-hidden relative flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Decorative background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-purple/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand-purple">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">EchoNote</span>
          </Link>
        </div>
        <h2 className="mt-8 text-center text-4xl font-bold text-white tracking-tight">
          Start for free
        </h2>
        <p className="mt-3 text-center text-gray-400">
          Transform your meetings into intelligent notes
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card variant="glass" className="py-10 px-4 sm:px-10 border-white/5 shadow-2xl">
          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all shadow-lg"
          >
            {isGoogleLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-sm font-medium">
              <span className="px-4 bg-[#1A1128] text-gray-500 rounded-full">Or sign up with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
                {error.includes('popup') && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleGoogleRedirect}
                      className="text-brand-purple hover:underline"
                    >
                      Try Redirect Method Instead
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-400 mb-2">
                Full name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all sm:text-sm font-medium"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-400 mb-2">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all sm:text-sm font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-400 mb-2">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all sm:text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-400 mb-2">
                  Confirm
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all sm:text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-5 w-5 bg-white/5 border-white/10 rounded-lg text-brand-purple focus:ring-brand-purple/50 focus:ring-offset-0"
              />
              <label htmlFor="agree-terms" className="ml-3 block text-sm font-medium text-gray-400">
                I agree to the{' '}
                <a href="#" className="font-bold text-brand-purple hover:text-brand-pink transition-colors">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#" className="font-bold text-brand-purple hover:text-brand-pink transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-brand-purple py-4 rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/20 flex items-center justify-center"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-purple hover:text-brand-pink transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
