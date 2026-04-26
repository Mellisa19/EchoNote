import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Calendar from './pages/Calendar'
import Integrations from './pages/Integrations'
import Recordings from './pages/Recordings'
import Settings from './pages/Settings'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Placeholder pages - will create these next
const AIChat = () => <div className="p-6"><h1>AI Chat</h1><p>Coming soon...</p></div>
const Profile = () => <div className="p-6"><h1>Profile</h1><p>Coming soon...</p></div>

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-brand-dark">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/records" 
            element={
              <ProtectedRoute>
                <Recordings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recordings" 
            element={
              <ProtectedRoute>
                <Recordings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/integrations" 
            element={
              <ProtectedRoute>
                <Integrations />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
