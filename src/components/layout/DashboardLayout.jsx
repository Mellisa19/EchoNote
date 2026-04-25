import { useState } from 'react'
import Sidebar from './Sidebar'
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="h-screen bg-brand-dark flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-purple/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-blue/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Top Header */}
        <header className="bg-transparent border-b border-white/5 px-8 py-5 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 text-gray-400 hover:text-white lg:hidden"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="relative max-w-xl flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search meetings, notes..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="h-10 w-10 rounded-xl bg-gradient-brand-purple p-[1px]">
                <div className="h-full w-full rounded-[10px] bg-brand-dark flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto relative z-10">
          {children}
        </main>
      </div>
    </div>
  )
}
