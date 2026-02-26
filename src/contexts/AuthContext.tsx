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

        const metaRole = session.user.user_metadata?.role
        const roleFromMeta: Role | null = metaRole === 'customer' || metaRole === 'worker' || metaRole === 'admin' ? metaRole : null

        // Set a role immediately from metadata to avoid blocking on slow DB queries.
        // We'll still attempt to fetch the DB role in the background (dashboard role changes).
        let role: Role | null = roleFromMeta
        if (roleFromMeta) {
          setState({ session, user: session.user, role: roleFromMeta, loading: false, needsRoleSelection: false })
        }

        console.log('[Auth] Calling fetchRole (background)...')
        void fetchRole(session.user.id)
          .then((dbRole) => {
            if (cancelled) return
            // Only sync DB to metadata if DB is empty; trust user_metadata as source of truth
            const metaRole = session.user.user_metadata?.role
            if (!metaRole && dbRole) {
              setState({ session, user: session.user, role: dbRole, loading: false, needsRoleSelection: false })
            }
            // If metadata has role but DB differs, log for debugging but don't override
            if (metaRole && dbRole && metaRole !== dbRole) {
              console.warn('[Auth] Role mismatch: metadata=' + metaRole + ', db=' + dbRole + '. Trusting metadata.')
            }
          })
          .catch((e) => console.error('[Auth] fetchRole error:', e))

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

        const metaRole = session.user.user_metadata?.role
        const roleFromMeta: Role | null = metaRole === 'customer' || metaRole === 'worker' || metaRole === 'admin' ? metaRole : null

        if (!cancelled) {
          setState({ session, user: session.user, role: roleFromMeta, loading: false, needsRoleSelection: false })
        }

        console.log('[Auth] onAuthStateChange: calling fetchRole (background)...')
        void fetchRole(session.user.id)
          .then((dbRole) => {
            if (cancelled) return
            // Only sync DB to metadata if DB is empty; trust user_metadata as source of truth
            const metaRole = session.user.user_metadata?.role
            if (!metaRole && dbRole) {
              setState({ session, user: session.user, role: dbRole, loading: false, needsRoleSelection: false })
            }
            if (metaRole && dbRole && metaRole !== dbRole) {
              console.warn('[Auth] Role mismatch: metadata=' + metaRole + ', db=' + dbRole + '. Trusting metadata.')
            }
          })
          .catch((e) => console.error('[Auth] fetchRole error:', e))

        const role: Role | null = roleFromMeta

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
