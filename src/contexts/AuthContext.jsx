import { createContext, useContext, useState, useEffect } from 'react'
import { 
  auth, 
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  onAuthStateChanged,
  getRedirectResult,
  sendPasswordResetEmail
} from '../firebase/config'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for redirect result from Google OAuth
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result && result.user) {
          console.log('Google redirect sign-in successful:', result.user)
          // Ensure displayName is set for Google redirect users
          if (!result.user.displayName) {
            await updateProfile(result.user, { 
              displayName: result.user.email?.split('@')[0] || 'User' 
            })
            await auth.currentUser.reload()
            setUser({ ...auth.currentUser })
          } else {
            setUser(result.user)
          }
          
          // Send welcome email for Google redirect sign-up
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
            // Don't block sign-in if email fails
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error)
        // Don't throw error here as it might be a normal navigation
      }
    }

    checkRedirectResult()

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password)
  }

  const signup = async (name, email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: name })
    await auth.currentUser.reload()
    setUser({ ...auth.currentUser }) // Trigger state update with new display name
    return result
  }

  const signInWithGoogle = async (useRedirect = false) => {
    try {
      if (useRedirect) {
        // Use redirect method as fallback
        await signInWithRedirect(auth, googleProvider)
        return null // Will be handled by redirect result
      } else {
        // Try popup method first
        const result = await signInWithPopup(auth, googleProvider)
        // Ensure displayName is set for Google users
        if (result.user && !result.user.displayName) {
          await updateProfile(result.user, { 
            displayName: result.user.email?.split('@')[0] || 'User' 
          })
        }
        return result
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      
      // If popup fails due to being blocked, try redirect
      if (error.code === 'auth/popup-blocked' && !useRedirect) {
        console.log('Popup blocked, trying redirect method...')
        try {
          await signInWithRedirect(auth, googleProvider)
          return null // Will be handled by redirect result
        } catch (redirectError) {
          console.error('Redirect method also failed:', redirectError)
          throw new Error('Both popup and redirect methods failed. Please check your browser settings and Firebase configuration.')
        }
      }
      
      // Provide more specific error messages
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed before completion')
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by the browser. Please allow popups for this site.')
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled')
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google sign-in. Please add localhost:3000 to Firebase console authorized domains.')
      } else if (error.code === 'auth/api-key-not-allowed') {
        throw new Error('API key is not allowed for this operation. Please check Firebase configuration.')
      } else {
        throw new Error(`Google sign-in failed: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const logout = async () => {
    return await signOut(auth)
  }

  const resetPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email)
  }

  const value = {
    user,
    loading,
    login,
    signup,
    signInWithGoogle,
    logout,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
