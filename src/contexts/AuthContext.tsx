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

        // Fetch DB role first (source of truth)
        console.log('[Auth] Fetching DB role first...')
        const dbRole = await fetchRole(session.user.id)
        console.log('[Auth] DB role:', dbRole)

        if (cancelled) return

        const metaRole = session.user.user_metadata?.role
        const roleFromMeta: Role | null = metaRole === 'customer' || metaRole === 'worker' || metaRole === 'admin' ? metaRole : null

        // Use DB role as source of truth, fallback to metadata
        const effectiveRole: Role | null = dbRole || roleFromMeta

        console.log('[Auth] effectiveRole:', effectiveRole, '(DB:', dbRole, ', meta:', roleFromMeta + ')')

        // Sync metadata if it differs from DB
        if (dbRole && metaRole !== dbRole) {
          console.log('[Auth] Syncing metadata to match DB role:', dbRole)
          await supabase.auth.updateUser({ data: { role: dbRole } })
        }

        // Start ensureProfile in background
        void ensureProfile(session.user).catch((e) => console.error('[Auth] ensureProfile error:', e))

        if (effectiveRole) {
          setState({ session, user: session.user, role: effectiveRole, loading: false, needsRoleSelection: false })
        } else {
          setState({ session, user: session.user, role: null, loading: false, needsRoleSelection: true })
        }

        console.log('[Auth] Init complete, role set to:', effectiveRole)
      } catch (e) {
        if (cancelled) return
        console.error('[Auth] Init error:', e)

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

        // Fetch DB role first
        console.log('[Auth] onAuthStateChange: fetching DB role first...')
        const dbRole = await fetchRole(session.user.id)
        console.log('[Auth] onAuthStateChange: DB role:', dbRole)

        if (cancelled) return

        const metaRole = session.user.user_metadata?.role
        const roleFromMeta: Role | null = metaRole === 'customer' || metaRole === 'worker' || metaRole === 'admin' ? metaRole : null
        const effectiveRole: Role | null = dbRole || roleFromMeta

        // Sync metadata if differs from DB
        if (dbRole && metaRole !== dbRole) {
          console.log('[Auth] onAuthStateChange: syncing metadata to DB role:', dbRole)
          await supabase.auth.updateUser({ data: { role: dbRole } })
        }

        // Start ensureProfile in background
        void ensureProfile(session.user).catch((e) => console.error('[Auth] ensureProfile error:', e))

        if (!cancelled) {
          if (effectiveRole) {
            setState({ session, user: session.user, role: effectiveRole, loading: false, needsRoleSelection: false })
          } else {
            setState({ session, user: session.user, role: null, loading: false, needsRoleSelection: true })
          }
        }

        console.log('[Auth] onAuthStateChange: complete, role:', effectiveRole)
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
    const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single()
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
      const nameRaw = meta.name ?? meta.full_name ?? meta.display_name
      const name = typeof nameRaw === 'string' && nameRaw.trim() ? nameRaw.trim() : user.email ?? 'User'

      // First, fetch existing profile to check current role
      console.log('[Auth] ensureProfile: checking existing profile...')
      const { data: existingProfile, error: fetchError } = await withTimeout(
        supabase.from('profiles').select('role').eq('id', user.id).single(),
        10000,
        'ensureProfile fetch existing',
      )

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = not found, other errors are real issues
        console.error('[Auth] ensureProfile: fetch error:', fetchError)
      }

      // Determine role: preserve DB role if exists, otherwise use metadata
      const dbRole = existingProfile?.role as Role | null
      let role: Role

      if (dbRole === 'admin' || dbRole === 'worker' || dbRole === 'customer') {
        // Preserve existing DB role - don't overwrite!
        role = dbRole
        console.log('[Auth] ensureProfile: preserving existing DB role:', role)
      } else {
        // No existing role - use metadata or default
        role = metaRole === 'customer' || metaRole === 'worker' || metaRole === 'admin'
          ? metaRole
          : 'customer'
        console.log('[Auth] ensureProfile: using metadata/default role:', role)
      }

      // Sync metadata if it differs from what we're about to set
      if (metaRole !== role) {
        console.log('[Auth] ensureProfile: syncing metadata to match role:', role)
        await supabase.auth.updateUser({ data: { role } })
      }

      console.log('[Auth] ensureProfile: upserting profile with role:', role)
      const { error: profileUpsertError } = await withTimeout(
        supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              email: user.email ?? null,
              name,
              role,
              active: true,
            },
            { onConflict: 'id' },
          ),
        30000,
        'ensureProfile upsert profile',
      )
      if (profileUpsertError) console.error('[Auth] ensureProfile: upsert profile error:', profileUpsertError)

      if (role === 'worker') {
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
