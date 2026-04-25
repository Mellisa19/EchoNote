import { Bars3Icon } from '@heroicons/react/24/outline'

export default function MobileMenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <Bars3Icon className="h-6 w-6 text-gray-600" />
    </button>
  )
}
