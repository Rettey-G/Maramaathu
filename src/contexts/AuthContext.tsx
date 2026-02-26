import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Role } from '../lib/types'

interface AuthState {
  session: Session | null
  user: User | null
  role: Role | null
  loading: boolean
  needsRoleSelection: boolean
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, role: Role, name: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateRole: (role: Role) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    role: null,
    loading: true,
    needsRoleSelection: false,
  })

  function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
      }),
    ])
  }

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (cancelled) return

        if (!session) {
          setState({ session: null, user: null, role: null, loading: false, needsRoleSelection: false })
          return
        }

        await withTimeout(ensureProfile(session.user), 15000, 'ensureProfile')
        const role = await withTimeout(fetchRole(session.user.id), 15000, 'fetchRole')

        const isGoogleUser = session.user.app_metadata.provider === 'google'
        const hasExplicitRole = !!session.user.user_metadata?.role
        const wasDefaulted = isGoogleUser && !hasExplicitRole && role === 'customer'

        if (wasDefaulted) {
          setState({ session, user: session.user, role: null, loading: false, needsRoleSelection: true })
        } else {
          setState({ session, user: session.user, role, loading: false, needsRoleSelection: false })
        }
      } catch (e) {
        if (cancelled) return
        console.error('Auth init error:', e)
        setState({ session: null, user: null, role: null, loading: false, needsRoleSelection: false })
      }
    }

    init()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!session) {
          if (!cancelled) setState({ session: null, user: null, role: null, loading: false, needsRoleSelection: false })
          return
        }

        await withTimeout(ensureProfile(session.user), 15000, 'ensureProfile')
        const role = await withTimeout(fetchRole(session.user.id), 15000, 'fetchRole')

        const isGoogleUser = session.user.app_metadata.provider === 'google'
        const hasExplicitRole = !!session.user.user_metadata?.role
        const wasDefaulted = isGoogleUser && !hasExplicitRole && role === 'customer'

        if (!cancelled) {
          if (wasDefaulted) {
            setState({ session, user: session.user, role: null, loading: false, needsRoleSelection: true })
          } else {
            setState({ session, user: session.user, role, loading: false, needsRoleSelection: false })
          }
        }
      } catch (e) {
        console.error('Auth state change error:', e)
        if (!cancelled) setState({ session: null, user: null, role: null, loading: false, needsRoleSelection: false })
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  async function fetchRole(userId: string): Promise<Role | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    if (error) {
      console.error('fetchRole error:', error)
      return null
    }
    return (data?.role as Role | null) ?? null
  }

  async function ensureProfile(user: User) {
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>
    const metaRole = meta.role
    const role: Role = metaRole === 'customer' || metaRole === 'worker' || metaRole === 'admin' ? metaRole : 'customer'
    const nameRaw = meta.name ?? meta.full_name ?? meta.display_name
    const name = typeof nameRaw === 'string' && nameRaw.trim() ? nameRaw.trim() : user.email ?? 'User'

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    // Preserve role set in DB (e.g. changed from Supabase dashboard)
    const existingRole = (existingProfile?.role ?? null) as Role | null

    // For Google OAuth, set 'customer' as default to satisfy NOT NULL constraint
    // User will be prompted to change this if needed
    const defaultRole: Role = user.app_metadata.provider === 'google' && !metaRole ? 'customer' : role
    const finalRole: Role = existingRole ?? defaultRole

    await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email ?? null,
          name,
          role: finalRole,
          active: true,
        },
        { onConflict: 'id' },
      )

    if (finalRole === 'worker') {
      const { error: workerProfileError } = await supabase
        .from('worker_profiles')
        .upsert(
          {
            id: user.id,
            categories: [],
            skills: [],
          },
          { onConflict: 'id' },
        )
      if (workerProfileError) console.error('Worker profile upsert error:', workerProfileError)
    }
  }

  async function signUp(email: string, password: string, role: Role, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    })

    if (error) return { error }

    if (data.user) {
      // Create profile row
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            email: data.user.email ?? null,
            name,
            role,
            active: true,
          },
          { onConflict: 'id' },
        )
      if (profileError) console.error('Profile upsert error:', profileError)
    }

    return { error: null }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateRole(role: Role) {
    if (!state.user) return

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', state.user.id)
      .select('id, role')
      .single()
    if (profileError) throw new Error(profileError.message)

    if (role === 'worker') {
      const { error: workerProfileError } = await supabase
        .from('worker_profiles')
        .upsert(
          {
            id: state.user.id,
            categories: [],
            skills: [],
          },
          { onConflict: 'id' },
        )
      if (workerProfileError) throw new Error(workerProfileError.message)
    }

    // Update user metadata
    const { error: metaError } = await supabase.auth.updateUser({
      data: { role },
    })
    if (metaError) throw new Error(metaError.message)

    // Update local state
    setState((prev) => ({ ...prev, role, needsRoleSelection: false }))
  }

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    updateRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
