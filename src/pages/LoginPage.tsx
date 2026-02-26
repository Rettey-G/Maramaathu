import { useState } from 'react'
import { Navigate, Link, useSearchParams } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { Role } from '../lib/types'
import { ArrowLeft, User, Briefcase, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const { user, role } = useAuth()
  const { t, language } = useLanguage()
  const [searchParams] = useSearchParams()
  const isSignup = searchParams.get('signup') === 'true'
  const redirectTo = `${window.location.origin}/`
  
  const [mode, setMode] = useState<'login' | 'signup'>(isSignup ? 'signup' : 'login')
  const [signupRole, setSignupRole] = useState<Role>('customer')
  const [signupName, setSignupName] = useState('')

  if (user && role) {
    return <Navigate to="/" replace />
  }

  if (mode === 'signup') {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 ${language === 'dv' ? 'dhivehi-font' : ''}`}>
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Maraamathu" className="h-10 w-10 rounded-xl border border-white/20 bg-white/10 object-contain" />
              <span className="text-xl font-bold text-white">Maraamathu</span>
            </Link>
            <button
              onClick={() => setMode('login')}
              className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm text-white transition-all hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToLogin')}
            </button>
          </div>
        </nav>

        {/* Signup Form */}
        <div className="flex min-h-screen items-center justify-center px-4 pt-20">
          <div className="relative z-10 w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">{t('auth.createAccount')}</h1>
                <p className="mt-2 text-sm text-white/60">{t('auth.signupSubtitle')}</p>
              </div>

              {/* Name Input */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-white/80">{t('auth.fullName')}</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-blue-500 focus:bg-white/10 focus:outline-none"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder={t('auth.namePlaceholder')}
                />
              </div>

              {/* Role Selection */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-white/80">{t('auth.selectRole')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSignupRole('customer')}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      signupRole === 'customer'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <User className={`h-6 w-6 ${signupRole === 'customer' ? 'text-blue-400' : 'text-white/60'}`} />
                    <span className={`text-sm font-medium ${signupRole === 'customer' ? 'text-white' : 'text-white/60'}`}>
                      {t('roles.customer')}
                    </span>
                  </button>
                  <button
                    onClick={() => setSignupRole('worker')}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      signupRole === 'worker'
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Briefcase className={`h-6 w-6 ${signupRole === 'worker' ? 'text-cyan-400' : 'text-white/60'}`} />
                    <span className={`text-sm font-medium ${signupRole === 'worker' ? 'text-white' : 'text-white/60'}`}>
                      {t('roles.worker')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Role Description */}
              <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-400" />
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {signupRole === 'customer' ? t('roles.customer') : t('roles.worker')}
                    </h3>
                    <p className="mt-1 text-xs text-white/60">
                      {signupRole === 'customer'
                        ? t('roles.customerDesc')
                        : t('roles.workerDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <Auth
                supabaseClient={supabase}
                view="sign_up"
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#3b82f6',
                        brandAccent: '#06b6d4',
                        defaultButtonBackground: 'rgba(255,255,255,0.1)',
                        defaultButtonBackgroundHover: 'rgba(255,255,255,0.2)',
                        defaultButtonBorder: 'rgba(255,255,255,0.2)',
                        defaultButtonText: 'white',
                        inputBackground: 'rgba(255,255,255,0.05)',
                        inputBorder: 'rgba(255,255,255,0.1)',
                        inputText: 'white',
                        inputPlaceholder: 'rgba(255,255,255,0.4)',
                      },
                      space: {
                        buttonPadding: '12px 24px',
                        inputPadding: '12px 16px',
                      },
                      borderWidths: {
                        buttonBorderWidth: '1px',
                        inputBorderWidth: '1px',
                      },
                      radii: {
                        borderRadiusButton: '12px',
                        buttonBorderRadius: '12px',
                        inputBorderRadius: '12px',
                      },
                    },
                  },
                }}
                providers={['google']}
                redirectTo={redirectTo}
                additionalData={{ name: signupName, role: signupRole }}
              />

              <div className="mt-6 text-center">
                <p className="text-sm text-white/60">
                  {t('auth.alreadyHaveAccount')}{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-medium text-blue-400 hover:text-blue-300"
                  >
                    {t('auth.signIn')}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 ${language === 'dv' ? 'dhivehi-font' : ''}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Maraamathu" className="h-10 w-10 rounded-xl border border-white/20 bg-white/10 object-contain" />
            <span className="text-xl font-bold text-white">Maraamathu</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">{t('auth.noAccount')}</span>
            <button
              onClick={() => setMode('signup')}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
            >
              {t('auth.signUp')}
            </button>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex min-h-screen items-center justify-center px-4 pt-20">
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                <img src="/logo.png" alt="Maraamathu" className="h-10 w-10 rounded-lg" />
              </div>
              <h1 className="text-2xl font-bold text-white">{t('auth.welcomeBack')}</h1>
              <p className="mt-2 text-sm text-white/60">{t('auth.signInSubtitle')}</p>
            </div>

            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#3b82f6',
                      brandAccent: '#06b6d4',
                      defaultButtonBackground: 'rgba(255,255,255,0.1)',
                      defaultButtonBackgroundHover: 'rgba(255,255,255,0.2)',
                      defaultButtonBorder: 'rgba(255,255,255,0.2)',
                      defaultButtonText: 'white',
                      inputBackground: 'rgba(255,255,255,0.05)',
                      inputBorder: 'rgba(255,255,255,0.1)',
                      inputText: 'white',
                      inputPlaceholder: 'rgba(255,255,255,0.4)',
                    },
                    space: {
                      buttonPadding: '12px 24px',
                      inputPadding: '12px 16px',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '12px',
                      buttonBorderRadius: '12px',
                      inputBorderRadius: '12px',
                    },
                  },
                },
              }}
              providers={['google']}
              redirectTo={redirectTo}
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-white/60">
                {t('auth.noAccount')}{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  {t('auth.signUp')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
