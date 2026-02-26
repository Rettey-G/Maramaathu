import { createContext, useContext, useEffect, useRef, useState } from 'react'
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

  const ensureProfileInFlightRef = useRef<string | null>(null)

  function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const timeoutPromise = new Promise<T>((_resolve, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    })

    return Promise.race([Promise.resolve(promise), timeoutPromise]).finally(() => {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    })
  }

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      console.log('[Auth] Starting init...')
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        console.log('[Auth] Session:', session ? 'exists' : 'none')

        if (cancelled) return

        if (!session) {
          console.log('[Auth] No session, clearing loading')
          setState({ session: null, user: null, role: null, loading: false, needsRoleSelection: false })
          return
        }

        console.log('[Auth] Calling ensureProfile...')
        void ensureProfile(session.user).catch((e) => console.error('[Auth] ensureProfile error:', e))
        console.log('[Auth] ensureProfile started (non-blocking)')
        
        console.log('[Auth] Calling fetchRole...')
        let role: Role | null = null
        try {
          role = await withTimeout(fetchRole(session.user.id), 30000, 'fetchRole')
        } catch (e) {
          console.error('[Auth] fetchRole error:', e)
        }
        console.log('[Auth] fetchRole done:', role)

        const isGoogleUser = session.user.app_metadata.provider === 'google'
        const hasExplicitRole = !!session.user.user_metadata?.role
        const wasDefaulted = isGoogleUser && !hasExplicitRole && role === 'customer'

        if (wasDefaulted) {
          setState({ session, user: session.user, role: null, loading: false, needsRoleSelection: true })
        } else {
          setState({ session, user: session.user, role, loading: false, needsRoleSelection: false })
        }
        console.log('[Auth] Init complete, loading=false')
      } catch (e) {
        if (cancelled) return
        console.error('[Auth] Init error:', e)

        // Do not hard-clear session on transient timeouts/network issues.
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setState({ session: session ?? null, user: session?.user ?? null, role: null, loading: false, needsRoleSelection: false })
      }
    }

    init()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[Auth] onAuthStateChange triggered, session:', session ? 'exists' : 'none')
      try {
        if (!session) {
          console.log('[Auth] onAuthStateChange: no session, clearing state')
          if (!cancelled) setState({ session: null, user: null, role: null, loading: false, needsRoleSelection: false })
          return
        }

        console.log('[Auth] onAuthStateChange: calling ensureProfile...')
        void ensureProfile(session.user).catch((e) => console.error('[Auth] ensureProfile error:', e))
        console.log('[Auth] onAuthStateChange: ensureProfile started (non-blocking)')
        
        console.log('[Auth] onAuthStateChange: calling fetchRole...')
        let role: Role | null = null
        try {
          role = await withTimeout(fetchRole(session.user.id), 30000, 'fetchRole')
        } catch (e) {
          console.error('[Auth] fetchRole error:', e)
        }
        console.log('[Auth] onAuthStateChange: fetchRole done:', role)

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
        console.log('[Auth] onAuthStateChange: complete, loading=false')
      } catch (e) {
        console.error('[Auth] onAuthStateChange error:', e)
        if (!cancelled) {
          const currentSession = session ?? null
          setState({ session: currentSession, user: currentSession?.user ?? null, role: null, loading: false, needsRoleSelection: false })
        }
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  async function fetchRole(userId: string): Promise<Role | null> {
    const { data, error } = await withTimeout(
      supabase.from('profiles').select('role').eq('id', userId).single(),
      10000,
      'fetchRole query',
    )
    if (error) {
      console.error('fetchRole error:', error)
      return null
    }
    return (data?.role as Role | null) ?? null
  }

  async function ensureProfile(user: User) {
    if (ensureProfileInFlightRef.current === user.id) {
      console.log('[Auth] ensureProfile: already running, skipping')
      return
    }
    ensureProfileInFlightRef.current = user.id
    try {
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>
      const metaRole = meta.role
      const role: Role = metaRole === 'customer' || metaRole === 'worker' || metaRole === 'admin' ? metaRole : 'customer'
      const nameRaw = meta.name ?? meta.full_name ?? meta.display_name
      const name = typeof nameRaw === 'string' && nameRaw.trim() ? nameRaw.trim() : user.email ?? 'User'

      console.log('[Auth] ensureProfile: reading existing profile...')
      const { data: existingProfile, error: existingProfileError } = await withTimeout(
        supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
        30000,
        'ensureProfile read profile',
      )
      if (existingProfileError) console.error('[Auth] ensureProfile: read profile error:', existingProfileError)

      // Preserve role set in DB (e.g. changed from Supabase dashboard)
      const existingRole = (existingProfile?.role ?? null) as Role | null

      // For Google OAuth, set 'customer' as default to satisfy NOT NULL constraint
      // User will be prompted to change this if needed
      const defaultRole: Role = user.app_metadata.provider === 'google' && !metaRole ? 'customer' : role
      const finalRole: Role = existingRole ?? defaultRole

      console.log('[Auth] ensureProfile: upserting profiles...')
      const { error: profileUpsertError } = await withTimeout(
        supabase
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
          ),
        30000,
        'ensureProfile upsert profile',
      )
      if (profileUpsertError) console.error('[Auth] ensureProfile: upsert profile error:', profileUpsertError)

      if (finalRole === 'worker') {
        console.log('[Auth] ensureProfile: upserting worker_profiles...')
        const { error: workerProfileError } = await withTimeout(
          supabase
            .from('worker_profiles')
            .upsert(
              {
                id: user.id,
                categories: [],
                skills: [],
              },
              { onConflict: 'id' },
            ),
          30000,
          'ensureProfile upsert worker_profiles',
        )
        if (workerProfileError) console.error('Worker profile upsert error:', workerProfileError)
      }

      console.log('[Auth] ensureProfile: done')
    } finally {
      ensureProfileInFlightRef.current = null
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
