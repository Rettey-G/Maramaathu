import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { User, Briefcase, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'worker'>('customer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateRole } = useAuth()
  const { t, language } = useLanguage()
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

  const roles = [
    {
      id: 'customer' as const,
      icon: User,
      title: t('roles.customer'),
      subtitle: t('roleSelect.customerSubtitle'),
      description: t('roles.customerDesc'),
      benefits: [t('roleSelect.customerBenefit1'), t('roleSelect.customerBenefit2'), t('roleSelect.customerBenefit3')],
      color: 'blue',
    },
    {
      id: 'worker' as const,
      icon: Briefcase,
      title: t('roles.worker'),
      subtitle: t('roleSelect.workerSubtitle'),
      description: t('roles.workerDesc'),
      benefits: [t('roleSelect.workerBenefit1'), t('roleSelect.workerBenefit2'), t('roleSelect.workerBenefit3')],
      color: 'cyan',
    },
  ]

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
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
        <div className="relative z-10 w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">{t('roleSelect.title')}</h1>
            <p className="mx-auto max-w-lg text-white/60">{t('roleSelect.subtitle')}</p>
          </div>

          {/* Role Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => {
              const Icon = role.icon
              const isSelected = selectedRole === role.id
              const gradientClass = role.color === 'blue' 
                ? 'from-blue-500 to-blue-600' 
                : 'from-cyan-500 to-cyan-600'
              const bgClass = role.color === 'blue'
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-cyan-500/10 border-cyan-500/30'

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative rounded-2xl border p-6 text-left transition-all ${
                    isSelected
                      ? `${bgClass} shadow-lg`
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradientClass} shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="mb-1 text-xl font-bold text-white">{role.title}</h3>
                  <p className="mb-4 text-sm text-white/60">{role.subtitle}</p>

                  <p className="mb-4 text-sm text-white/80">{role.description}</p>

                  <ul className="space-y-2">
                    {role.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>

          {/* Continue Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t('roleSelect.settingUp')}
                </>
              ) : (
                <>
                  {t('roleSelect.continue')}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
