import { corsHeaders } from '../_shared/cors.ts'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type Role = 'customer' | 'worker' | 'admin'

type AdminUsersRequest =
  | {
      action: 'create_user'
      email: string
      password: string
      role: Role
      name: string
      active?: boolean
      phone?: string
      whatsapp?: string
      viber?: string
      categories?: string[]
      skills?: string[]
      about?: string
      promoPosterUrl?: string
    }
  | {
      action: 'update_user'
      userId: string
      email?: string
      password?: string
      role?: Role
      name?: string
      active?: boolean
      phone?: string
      whatsapp?: string
      viber?: string
      categories?: string[]
      skills?: string[]
      about?: string
      promoPosterUrl?: string
    }
  | {
      action: 'delete_user'
      userId: string
    }
  | {
      action: 'reset_password'
      userId: string
      password: string
    }

function buildCors(req: Request) {
  const origin = req.headers.get('Origin')
  const allowedOrigins = ['https://maramaathu.vercel.app', 'http://localhost:5173', 'http://localhost:4173']
  const allowed = allowedOrigins.includes(origin) || !origin
  const requestHeaders = req.headers.get('Access-Control-Request-Headers')
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': allowed ? (origin ?? '*') : 'null',
    'Access-Control-Allow-Headers': requestHeaders ?? corsHeaders['Access-Control-Allow-Headers'],
  }
}

function jsonResponse(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...buildCors(req), 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCors(req) })
  }

  if (req.method !== 'POST') {
    return jsonResponse(req, 405, { error: 'Method not allowed' })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse(req, 500, { error: 'Missing server environment variables' })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return jsonResponse(req, 401, { error: 'Missing Authorization header' })
  }

  const token = authHeader.slice('bearer '.length)

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  })

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser()

  if (userError || !user) {
    return jsonResponse(req, 401, { error: 'Invalid session' })
  }

  const { data: callerProfile, error: callerProfileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (callerProfileError) {
    return jsonResponse(req, 500, { error: callerProfileError.message })
  }

  if (callerProfile?.role !== 'admin') {
    return jsonResponse(req, 403, { error: 'Admin access required' })
  }

  let payload: AdminUsersRequest
  try {
    payload = (await req.json()) as AdminUsersRequest
  } catch {
    return jsonResponse(req, 400, { error: 'Invalid JSON body' })
  }

  try {
    if (payload.action === 'create_user') {
      const active = payload.active ?? true

      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
        user_metadata: { name: payload.name, role: payload.role },
      })

      if (createError || !created.user) {
        return jsonResponse(req, 400, { error: createError?.message ?? 'Failed to create user' })
      }

      const userId = created.user.id

      const { error: profileError } = await adminClient.from('profiles').upsert(
        {
          id: userId,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          active,
        },
        { onConflict: 'id' },
      )

      if (profileError) {
        return jsonResponse(req, 500, { error: profileError.message })
      }

      if (payload.role === 'customer') {
        const { error: customerProfileError } = await adminClient.from('customer_profiles').upsert(
          {
            id: userId,
            phone: payload.phone ?? null,
          },
          { onConflict: 'id' },
        )
        if (customerProfileError) {
          return jsonResponse(req, 500, { error: customerProfileError.message })
        }
      }

      if (payload.role === 'worker') {
        const { error: workerProfileError } = await adminClient.from('worker_profiles').upsert(
          {
            id: userId,
            phone: payload.phone ?? null,
            whatsapp: payload.whatsapp ?? null,
            viber: payload.viber ?? null,
            categories: [],
            skills: [],
            about: payload.about ?? null,
            promo_poster_url: payload.promoPosterUrl ?? null,
          },
          { onConflict: 'id' },
        )
        if (workerProfileError) {
          return jsonResponse(req, 500, { error: workerProfileError.message })
        }
      }

      return jsonResponse(req, 200, { ok: true, userId })
    }

    if (payload.action === 'update_user') {
      const patchAuth: Record<string, unknown> = {}
      if (typeof payload.email === 'string' && payload.email.trim()) patchAuth.email = payload.email.trim()
      if (typeof payload.password === 'string' && payload.password) patchAuth.password = payload.password
      if (payload.name || payload.role) {
        patchAuth.user_metadata = {
          ...(payload.name ? { name: payload.name } : {}),
          ...(payload.role ? { role: payload.role } : {}),
        }
      }

      if (Object.keys(patchAuth).length) {
        const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(payload.userId, patchAuth)
        if (updateAuthError) {
          return jsonResponse(req, 400, { error: updateAuthError.message })
        }
      }

      const patchProfile: Record<string, unknown> = {}
      if (typeof payload.email === 'string') patchProfile.email = payload.email
      if (typeof payload.name === 'string') patchProfile.name = payload.name
      if (typeof payload.role === 'string') patchProfile.role = payload.role
      if (typeof payload.active === 'boolean') patchProfile.active = payload.active

      if (Object.keys(patchProfile).length) {
        const { error: updateProfileError } = await adminClient.from('profiles').update(patchProfile).eq('id', payload.userId)
        if (updateProfileError) {
          return jsonResponse(req, 500, { error: updateProfileError.message })
        }
      }

      if (payload.role === 'customer') {
        const { error: customerProfileError } = await adminClient.from('customer_profiles').upsert(
          {
            id: payload.userId,
            phone: payload.phone ?? null,
          },
          { onConflict: 'id' },
        )
        if (customerProfileError) {
          return jsonResponse(req, 500, { error: customerProfileError.message })
        }
      }

      if (payload.role === 'worker') {
        const { error: workerProfileError } = await adminClient.from('worker_profiles').upsert(
          {
            id: payload.userId,
            phone: payload.phone ?? null,
            whatsapp: payload.whatsapp ?? null,
            viber: payload.viber ?? null,
            categories: payload.categories ?? [],
            skills: payload.skills ?? [],
            about: payload.about ?? null,
            promo_poster_url: payload.promoPosterUrl ?? null,
          },
          { onConflict: 'id' },
        )
        if (workerProfileError) {
          return jsonResponse(req, 500, { error: workerProfileError.message })
        }
      }

      return jsonResponse(req, 200, { ok: true })
    }

    if (payload.action === 'reset_password') {
      const { error } = await adminClient.auth.admin.updateUserById(payload.userId, { password: payload.password })
      if (error) return jsonResponse(req, 400, { error: error.message })
      return jsonResponse(req, 200, { ok: true })
    }

    if (payload.action === 'delete_user') {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(payload.userId)
      if (deleteError) return jsonResponse(req, 400, { error: deleteError.message })

      await adminClient.from('profiles').delete().eq('id', payload.userId)
      await adminClient.from('worker_profiles').delete().eq('id', payload.userId)
      await adminClient.from('customer_profiles').delete().eq('id', payload.userId)

      return jsonResponse(req, 200, { ok: true })
    }

    return jsonResponse(req, 400, { error: 'Unknown action' })
  } catch (e) {
    return jsonResponse(req, 500, { error: e instanceof Error ? e.message : 'Unexpected error' })
  }
})
