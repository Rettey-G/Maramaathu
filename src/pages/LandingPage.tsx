import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { ArrowRight, Users, Briefcase, Shield, Star, CheckCircle, Hammer, Wrench, Paintbrush, Car, Home, Zap } from 'lucide-react'

export default function LandingPage() {
  const { t, language } = useLanguage()

  const features = [
    { icon: Users, title: t('landing.feature1.title'), desc: t('landing.feature1.desc') },
    { icon: Briefcase, title: t('landing.feature2.title'), desc: t('landing.feature2.desc') },
    { icon: Shield, title: t('landing.feature3.title'), desc: t('landing.feature3.desc') },
    { icon: Star, title: t('landing.feature4.title'), desc: t('landing.feature4.desc') },
  ]

  const sampleWorks = [
    { icon: Hammer, title: t('landing.work.carpentry'), gradient: 'from-amber-600 to-orange-600' },
    { icon: Wrench, title: t('landing.work.plumbing'), gradient: 'from-blue-600 to-cyan-600' },
    { icon: Paintbrush, title: t('landing.work.painting'), gradient: 'from-pink-600 to-rose-600' },
    { icon: Car, title: t('landing.work.mechanic'), gradient: 'from-red-600 to-orange-600' },
    { icon: Home, title: t('landing.work.cleaning'), gradient: 'from-emerald-600 to-teal-600' },
    { icon: Zap, title: t('landing.work.electrical'), gradient: 'from-yellow-500 to-amber-500' },
  ]

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 ${language === 'dv' ? 'dhivehi-font' : ''}`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Maraamathu" className="h-12 w-12 rounded-xl border border-white/20 bg-white/10 object-contain" />
            <span className="text-2xl font-bold text-white">Maraamathu</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="rounded-xl border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              {t('auth.signIn')}
            </Link>
            <Link
              to="/login?signup=true"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
            >
              {t('auth.signUp')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-white/80">{t('landing.nowLive')}</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl">
            {t('landing.hero.title')}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('landing.hero.highlight')}
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70 md:text-xl">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/login?signup=true"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50"
            >
              {t('landing.cta.primary')}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              {t('landing.cta.secondary')}
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
            <div>
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-sm text-white/60">{t('landing.stats.users')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-white/60">{t('landing.stats.jobs')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-sm text-white/60">{t('landing.stats.satisfaction')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">{t('landing.features.title')}</h2>
            <p className="mx-auto max-w-2xl text-white/60">{t('landing.features.subtitle')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-white/10 bg-white/5 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">{t('landing.howItWorks.title')}</h2>
            <p className="mx-auto max-w-2xl text-white/60">{t('landing.howItWorks.subtitle')}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: t('landing.step1.title'), desc: t('landing.step1.desc') },
              { step: '2', title: t('landing.step2.title'), desc: t('landing.step2.desc') },
              { step: '3', title: t('landing.step3.title'), desc: t('landing.step3.desc') },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl font-bold text-white shadow-lg shadow-blue-500/30">
                  {item.step}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works Gallery */}
      <section className="border-t border-white/10 bg-white/5 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">{t('landing.works.title')}</h2>
            <p className="mx-auto max-w-2xl text-white/60">{t('landing.works.subtitle')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleWorks.map((work, idx) => (
              <div
                key={idx}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${work.gradient}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <work.icon className="h-16 w-16 text-white/40" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <work.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-white">{work.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-600 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">{t('landing.ctaSection.title')}</h2>
          <p className="mb-8 text-lg text-white/80">{t('landing.ctaSection.subtitle')}</p>
          <Link
            to="/login?signup=true"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:bg-white/90"
          >
            {t('landing.ctaSection.button')}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Maraamathu" className="h-10 w-10 rounded-xl" />
              <span className="text-xl font-bold text-white">Maraamathu</span>
            </div>
            <p className="text-sm text-white/60">© 2025 Maraamathu. {t('landing.footer.rights')}</p>
            <div className="flex gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm text-white/60">{t('landing.footer.madeIn')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
