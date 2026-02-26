import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../lib/types'

export default function LoginPage() {
  const { user, role } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [signupRole, setSignupRole] = useState<Role>('customer')
  const [signupName, setSignupName] = useState('')

  if (user && role) {
    return <Navigate to="/" replace />
  }

  if (mode === 'signup') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#2d3748] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-6 text-white">
          <h2 className="mb-4 text-xl font-semibold">Sign up</h2>
          <div className="mb-4">
            <label className="mb-2 block text-sm text-white/70">Name</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm text-white/70">Role</label>
            <select
              className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
              value={signupRole}
              onChange={(e) => setSignupRole(e.target.value as Role)}
            >
              <option value="customer">Customer</option>
              <option value="worker">Worker</option>
            </select>
          </div>
          <Auth
            supabaseClient={supabase}
            view="sign_up"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#ffffff',
                    brandAccent: '#e5e7eb',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo="/"
            additionalData={{ name: signupName, role: signupRole }}
          />
          <button
            className="mt-4 w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/5"
            onClick={() => setMode('login')}
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#2d3748] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-6 text-white">
        <div className="mb-4">
          <div className="text-lg font-semibold">Welcome to Maraamathu</div>
          <div className="text-xs text-white/60">Sign in to your account</div>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#ffffff',
                  brandAccent: '#e5e7eb',
                },
              },
            },
          }}
          providers={['google']}
          redirectTo="/"
        />
        <button
          className="mt-4 w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/5"
          onClick={() => setMode('signup')}
        >
          Need an account? Sign up
        </button>
      </div>
    </div>
  )
}
