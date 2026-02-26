import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'worker'>('customer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateRole } = useAuth()
  const navigate = useNavigate()

  const handleContinue = async () => {
    setIsSubmitting(true)
    try {
      await updateRole(selectedRole)
      navigate(`/${selectedRole}`)
    } catch (error) {
      console.error('Error:', error)
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      alert(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="rounded-2xl border border-white/10 bg-white/20 p-5 text-white shadow">
        <div className="mb-4">
          <div className="text-lg font-semibold">Choose your role</div>
          <div className="mt-1 text-xs text-white/60">
            Tell us how you'll be using Maraamathu
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              selectedRole === 'customer'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 bg-transparent hover:bg-white/5'
            }`}
            onClick={() => setSelectedRole('customer')}
          >
            Customer
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              selectedRole === 'worker'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 bg-transparent hover:bg-white/5'
            }`}
            onClick={() => setSelectedRole('worker')}
          >
            Worker
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="text-xs font-semibold text-white/80">
            {selectedRole === 'customer' ? 'Customer' : 'Worker'}
          </div>
          <div className="mt-1 text-xs text-white/60">
            {selectedRole === 'customer'
              ? 'Post service requests and hire workers for your needs'
              : 'Browse jobs, submit quotes, and get hired for your skills'}
          </div>
        </div>

        <button
          className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
          disabled={isSubmitting}
          onClick={handleContinue}
        >
          {isSubmitting ? 'Setting up your account...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
