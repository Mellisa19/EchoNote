import { useState } from 'react'
import { 
  UserIcon, 
  BellIcon, 
  LockClosedIcon, 
  ShieldCheckIcon,
  GlobeAltIcon,
  SparklesIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'preferences', name: 'Preferences', icon: BellIcon },
    { id: 'account', name: 'Account', icon: LockClosedIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Settings</h1>
          <p className="text-gray-400">Manage your account and app preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 shrink-0">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-brand-purple text-white shadow-lg shadow-purple-500/10'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <Card variant="glass" className="p-8 border-white/5">
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                    <div className="w-24 h-24 rounded-3xl bg-brand-purple/10 border-2 border-brand-purple/30 flex items-center justify-center text-4xl text-brand-purple font-bold">
                      {user?.displayName?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Your Profile</h3>
                      <p className="text-gray-400 text-sm mb-4">This will be displayed on your recordings and meeting notes.</p>
                      <button className="text-sm font-bold text-brand-purple hover:text-brand-pink transition-all">Change Photo</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Display Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.displayName}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue={user?.email}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Bio</label>
                    <textarea 
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all"
                      placeholder="Tell us a bit about yourself..."
                    ></textarea>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button className="btn-brand-purple px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/10">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white mb-6">App Preferences</h3>
                  
                  <div className="space-y-4">
                    {[
                      { id: 'emails', name: 'Email Notifications', desc: 'Receive summaries after every meeting.' },
                      { id: 'ai', name: 'Auto-AI Summaries', desc: 'Automatically process transcripts with AI.' },
                      { id: 'calendar', name: 'Calendar Sync', desc: 'Keep your meetings in sync with Google Calendar.' }
                    ].map((pref) => (
                      <div key={pref.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div>
                          <p className="text-white font-bold">{pref.name}</p>
                          <p className="text-gray-500 text-xs">{pref.desc}</p>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-brand-purple relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeTab === 'account' || activeTab === 'billing') && (
                <div className="py-20 text-center">
                  <SparklesIcon className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} coming soon</h3>
                  <p className="text-gray-500">We're still polishing this section for you.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
