// Temporary stubs to keep the UI working while we migrate to Supabase
// These will be replaced with real Supabase mutations in the next step

import { supabase } from './supabase'

async function invokeAdminUsers<TResponse = unknown>(body: unknown): Promise<TResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(error.message)

  const accessToken = data.session?.access_token
  if (!accessToken) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/admin-users`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Edge Function returned a non-2xx status code | status=${res.status} | body=${text || '{}'}`)
  }

  if (!text) return {} as TResponse

  try {
    return JSON.parse(text) as TResponse
  } catch {
    return { raw: text } as TResponse
  }
}

export async function createRequest(_params: {
  customerId: string
  category: string
  title: string
  description: string
  budget: number
  urgency: string
  location: string
}) {
  const { error } = await supabase.from('service_requests').insert({
    customer_id: _params.customerId,
    category: _params.category,
    title: _params.title,
    description: _params.description,
    budget: _params.budget,
    urgency: _params.urgency,
    location: _params.location,
    status: 'open',
  })
  if (error) throw new Error(error.message)
}

export async function acceptRequest(_params: { requestId: string; workerId: string }) {
  console.log('acceptRequest (stub):', _params)
}

export async function selectWorker(_params: { requestId: string; customerId: string; workerId: string }) {
  console.log('selectWorker (stub):', _params)
}

export async function proposeInspection(_params: { requestId: string; workerId: string; whenIso: string }) {
  console.log('proposeInspection (stub):', _params)
}

export async function customerConfirmInspection(_params: { requestId: string; customerId: string }) {
  console.log('customerConfirmInspection (stub):', _params)
}

export async function workerCompleteInspection(_params: { requestId: string; workerId: string }) {
  console.log('workerCompleteInspection (stub):', _params)
}

export async function customerConfirmInspectionCompleted(_params: { requestId: string; customerId: string }) {
  console.log('customerConfirmInspectionCompleted (stub):', _params)
}

export async function submitQuote(_params: { requestId: string; workerId: string; amount: number; notes?: string }) {
  console.log('submitQuote (stub):', _params)
}

export async function customerConfirmWorkSchedule(_params: { requestId: string; customerId: string }) {
  console.log('customerConfirmWorkSchedule (stub):', _params)
}

export async function scheduleWork(_params: { requestId: string; workerId: string; whenIso: string }) {
  console.log('scheduleWork (stub):', _params)
}

export async function workerCompleteWork(_params: { requestId: string; workerId: string }) {
  console.log('workerCompleteWork (stub):', _params)
}

export async function customerConfirmWorkCompleted(_params: { requestId: string; customerId: string }) {
  console.log('customerConfirmWorkCompleted (stub):', _params)
}

export async function markPayment(_params: { requestId: string; workerId: string; status: string }) {
  console.log('markPayment (stub):', _params)
}

export async function addReview(_params: { requestId: string; customerId: string; workerId: string; rating: number; comment?: string }) {
  console.log('addReview (stub):', _params)
}

export async function chooseOffer(_params: { requestId: string; customerId: string; offerId: string }) {
  console.log('chooseOffer (stub):', _params)
}

export async function submitQuoteOffer(_params: { requestId: string; workerId: string; amount: number; notes?: string }) {
  console.log('submitQuoteOffer (stub):', _params)
}

// Admin CRUD stubs
export async function createCustomer(_params: { name: string; email: string; password: string; phone?: string }) {
  await invokeAdminUsers({
    action: 'create_user',
    email: _params.email,
    password: _params.password,
    role: 'customer',
    name: _params.name,
    active: true,
    phone: _params.phone,
  })
}

export async function updateCustomer(_params: { customerId: string; patch: { name?: string; email?: string; phone?: string } }) {
  await invokeAdminUsers({
    action: 'update_user',
    userId: _params.customerId,
    name: _params.patch.name,
    email: _params.patch.email,
    phone: _params.patch.phone,
    role: 'customer',
  })
}

export async function setCustomerActive(_params: { customerId: string; active: boolean }) {
  await invokeAdminUsers({
    action: 'update_user',
    userId: _params.customerId,
    active: _params.active,
  })
}

export async function deleteCustomer(_params: { customerId: string }) {
  await invokeAdminUsers({
    action: 'delete_user',
    userId: _params.customerId,
  })
}

export async function createWorker(_params: { name: string; email: string; password: string; phone?: string }) {
  await invokeAdminUsers({
    action: 'create_user',
    email: _params.email,
    password: _params.password,
    role: 'worker',
    name: _params.name,
    active: true,
    phone: _params.phone,
  })
}

export async function updateWorker(_params: {
  workerId: string
  patch: {
    name?: string
    email?: string
    phone?: string
    whatsapp?: string
    viber?: string
    categories?: string[]
    skills?: string[]
    about?: string
    promoPosterUrl?: string
  }
}) {
  await invokeAdminUsers({
    action: 'update_user',
    userId: _params.workerId,
    name: _params.patch.name,
    email: _params.patch.email,
    phone: _params.patch.phone,
    role: 'worker',
    whatsapp: _params.patch.whatsapp,
    viber: _params.patch.viber,
    categories: _params.patch.categories,
    skills: _params.patch.skills,
    about: _params.patch.about,
    promoPosterUrl: _params.patch.promoPosterUrl,
  })
}

export async function setWorkerActive(_params: { workerId: string; active: boolean }) {
  await invokeAdminUsers({
    action: 'update_user',
    userId: _params.workerId,
    active: _params.active,
  })
}

export async function deleteWorker(_params: { workerId: string }) {
  await invokeAdminUsers({
    action: 'delete_user',
    userId: _params.workerId,
  })
}

export async function adminResetPassword(_params: { userId: string; password: string }) {
  await invokeAdminUsers({
    action: 'reset_password',
    userId: _params.userId,
    password: _params.password,
  })
}

export async function updateWorkerProfile(_params: {
  workerId: string
  name?: string
  email?: string
  phone?: string
  whatsapp?: string
  viber?: string
  categories?: string[]
  skills?: string[]
  about?: string
  promoPosterUrl?: string
}) {
  if (_params.name || _params.email) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        ...(typeof _params.name === 'string' ? { name: _params.name } : {}),
        ...(typeof _params.email === 'string' ? { email: _params.email } : {}),
      })
      .eq('id', _params.workerId)
    if (profileError) throw new Error(profileError.message)
  }

  const { error: workerError } = await supabase
    .from('worker_profiles')
    .upsert(
      {
        id: _params.workerId,
        phone: _params.phone ?? null,
        whatsapp: _params.whatsapp ?? null,
        viber: _params.viber ?? null,
        categories: _params.categories ?? [],
        skills: _params.skills ?? [],
        about: _params.about ?? null,
        promo_poster_url: _params.promoPosterUrl ?? null,
      },
      { onConflict: 'id' },
    )
  if (workerError) throw new Error(workerError.message)
}
