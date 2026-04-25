import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import {
  HomeIcon,
  DocumentTextIcon,
  SparklesIcon,
  UserGroupIcon,
  CogIcon,
  ChevronLeftIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  FolderIcon,
  VideoCameraIcon,
  CalendarIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
  { name: 'Meetings', href: '/records', icon: DocumentTextIcon, current: false },
  { name: 'Recordings', href: '/recordings', icon: VideoCameraIcon, current: false },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon, current: false },
  { name: 'Integrations', href: '/integrations', icon: CogIcon, current: false },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: CogIcon },
  { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
]

export default function Sidebar({ open, onClose }) {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar content */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-brand-dark px-6 pb-2 ring-1 ring-white/10">
                  {/* Logo */}
                  <div className="flex h-16 shrink-0 items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand-purple">
                        <SparklesIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xl font-bold text-white tracking-tight">EchoNote</span>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive 
                                      ? 'bg-white/10 text-white shadow-lg shadow-purple-500/10' 
                                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                  }`}
                                  onClick={onClose}
                                >
                                  <item.icon
                                    className={`h-5 w-5 shrink-0 ${isActive ? 'text-brand-purple' : 'text-gray-500 group-hover:text-gray-300'}`}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:h-full lg:shrink-0">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-brand-dark px-6 border-r border-white/5">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand-purple">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">EchoNote</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col pb-8">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isActive 
                              ? 'bg-white/10 text-white shadow-lg shadow-purple-500/10' 
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <item.icon
                            className={`h-5 w-5 shrink-0 ${isActive ? 'text-brand-purple' : 'text-gray-500 group-hover:text-gray-300'}`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>

              {/* Upgrade Plan Card */}
              <li className="mt-4">
                <div className="bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                  <div className="relative z-10">
                    <h4 className="text-white font-bold text-sm mb-1">Upgrade to Pro</h4>
                    <p className="text-gray-400 text-xs mb-4 leading-relaxed">Get unlimited AI transcriptions and custom summaries.</p>
                    <button className="w-full bg-white text-brand-dark py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">
                      Upgrade Now
                    </button>
                  </div>
                  <SparklesIcon className="absolute -right-4 -bottom-4 w-20 h-20 text-brand-purple/10 group-hover:scale-110 transition-transform" />
                </div>
              </li>

              <li className="mt-auto">
                <ul role="list" className="-mx-2 space-y-1">
                  {secondaryNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <item.icon
                          className="h-5 w-5 shrink-0 text-gray-600 group-hover:text-gray-400"
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
