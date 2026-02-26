import type {
  AdminProfile,
  CustomerProfile,
  DB,
  Review,
  ServiceCategory,
  ServiceRequest,
  ServiceRequestStatus,
  WorkerProfile,
} from './types'

const STORAGE_KEY = 'maraamathu_db_v1'

type Listener = () => void
const listeners = new Set<Listener>()

function nowIso() {
  return new Date().toISOString()
}

export function createCustomer(input: { name: string; email: string; phone?: string }) {
  const db = load()
  const c: CustomerProfile = {
    id: `c_${Math.random().toString(16).slice(2)}`,
    name: input.name,
    email: input.email,
    phone: input.phone,
    active: true,
  }
  db.customers.unshift(c)
  save(db)
  return c
}

export function updateCustomer(params: { customerId: string; patch: Partial<Pick<CustomerProfile, 'name' | 'email' | 'phone'>> }) {
  const db = load()
  const c = db.customers.find((x) => x.id === params.customerId)
  if (!c) throw new Error('Customer not found')
  Object.assign(c, params.patch)
  save(db)
}

export function setCustomerActive(params: { customerId: string; active: boolean }) {
  const db = load()
  const c = db.customers.find((x) => x.id === params.customerId)
  if (!c) throw new Error('Customer not found')
  c.active = params.active
  save(db)
}

export function deleteCustomer(params: { customerId: string }) {
  const db = load()
  db.customers = db.customers.filter((c) => c.id !== params.customerId)
  save(db)
}

export function createWorker(input: { name: string; email?: string; phone?: string }) {
  const db = load()
  const w: WorkerProfile = {
    id: `w_${Math.random().toString(16).slice(2)}`,
    name: input.name,
    email: input.email,
    phone: input.phone,
    whatsapp: undefined,
    viber: undefined,
    categories: ['Other'],
    skills: [],
    about: undefined,
    promoPosterUrl: undefined,
    ratingAvg: 0,
    ratingCount: 0,
    jobsDone: 0,
    active: true,
  }
  db.workers.unshift(w)
  save(db)
  return w
}

export function updateWorker(params: {
  workerId: string
  patch: Partial<Pick<WorkerProfile, 'name' | 'email' | 'phone' | 'whatsapp' | 'viber' | 'categories' | 'skills' | 'about' | 'promoPosterUrl'>>
}) {
  const db = load()
  const w = db.workers.find((x) => x.id === params.workerId)
  if (!w) throw new Error('Worker not found')
  Object.assign(w, params.patch)
  if (!Array.isArray(w.categories)) w.categories = ['Other']
  if (!Array.isArray(w.skills)) w.skills = []
  save(db)
}

export function setWorkerActive(params: { workerId: string; active: boolean }) {
  const db = load()
  const w = db.workers.find((x) => x.id === params.workerId)
  if (!w) throw new Error('Worker not found')
  w.active = params.active
  save(db)
}

export function deleteWorker(params: { workerId: string }) {
  const db = load()
  db.workers = db.workers.filter((w) => w.id !== params.workerId)
  save(db)
}

function load(): DB {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { admins: [], customers: [], workers: [], requests: [], reviews: [] }
  }

  // Migrate older stored shapes to current DB.
  const parsed = JSON.parse(raw) as Partial<DB> & {
    workers?: Array<WorkerProfile & { rating?: number }>
  }
  const db: DB = {
    admins: (parsed.admins ?? []).map((a) => ({
      ...a,
      active: typeof a.active === 'boolean' ? a.active : true,
    })),
    customers: parsed.customers ?? [],
    workers: (parsed.workers ?? []).map((w) => {
      const anyW = w as WorkerProfile & { rating?: number }
      const ratingAvg = typeof anyW.ratingAvg === 'number' ? anyW.ratingAvg : (anyW.rating ?? 0)
      const ratingCount = typeof anyW.ratingCount === 'number' ? anyW.ratingCount : (anyW.rating ? 1 : 0)
      return {
        ...anyW,
        email: anyW.email,
        categories: anyW.categories ?? ['Other'],
        skills: Array.isArray(anyW.skills) ? anyW.skills : [],
        about: anyW.about,
        promoPosterUrl: anyW.promoPosterUrl,
        phone: anyW.phone,
        whatsapp: anyW.whatsapp,
        viber: anyW.viber,
        ratingAvg,
        ratingCount,
        jobsDone: typeof anyW.jobsDone === 'number' ? anyW.jobsDone : 0,
        active: typeof anyW.active === 'boolean' ? anyW.active : true,
      }
    }),
    requests: (parsed.requests ?? []).map((r) => {
      return {
        ...r,
        interestedWorkerIds: Array.isArray(r.interestedWorkerIds) ? r.interestedWorkerIds : [],
        quoteOffers: Array.isArray(r.quoteOffers) ? r.quoteOffers : [],
      }
    }),
    reviews: parsed.reviews ?? [],
  }

  db.customers = (db.customers ?? []).map((c) => ({
    ...c,
    active: typeof c.active === 'boolean' ? c.active : true,
  }))

  return db
}

function save(db: DB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  for (const l of listeners) l()
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getDB(): DB {
  return load()
}

export function resetDB() {
  localStorage.removeItem(STORAGE_KEY)
  for (const l of listeners) l()
}

export function seedIfEmpty() {
  const db = load()
  if (
    db.admins.length ||
    db.customers.length ||
    db.workers.length ||
    db.requests.length ||
    db.reviews.length
  )
    return

  const admins: AdminProfile[] = [
    {
      id: 'a_1',
      name: 'Admin',
      email: 'admin@demo.com',
      role: 'admin',
      active: true,
    },
  ]

  const customers: CustomerProfile[] = [
    {
      id: 'c_1',
      name: 'Aisha',
      email: 'customer@demo.com',
      phone: '+91 90000 00001',
      active: true,
    },
    {
      id: 'c_2',
      name: 'Rahul',
      email: 'customer@demo.com',
      phone: '+91 90000 00002',
      active: true,
    },
  ]

  const workers: WorkerProfile[] = [
    {
      id: 'w_1',
      name: 'Suresh',
      email: 'worker@demo.com',
      phone: '+91 80000 00001',
      whatsapp: '+91 80000 00001',
      categories: ['AC', 'Electrical'],
      skills: ['Split AC service', 'Wiring', 'Fan repair', 'Switchboard'],
      about: '10+ years experience. Fast same-day service in city limits.',
      promoPosterUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80&auto=format&fit=crop',
      ratingAvg: 4.6,
      ratingCount: 92,
      jobsDone: 92,
      active: true,
    },
    {
      id: 'w_2',
      name: 'Meena',
      email: 'worker@demo.com',
      phone: '+91 80000 00002',
      viber: '+91 80000 00002',
      categories: ['Plumbing', 'Carpentry'],
      skills: ['Leak fixing', 'Tap replacement', 'Door hinges', 'Furniture repair'],
      about: 'Trusted technician. Transparent pricing and neat work.',
      promoPosterUrl: 'https://images.unsplash.com/photo-1581092919535-7146c7d31c28?w=1200&q=80&auto=format&fit=crop',
      ratingAvg: 4.8,
      ratingCount: 120,
      jobsDone: 120,
      active: true,
    },
  ]

  const requests: ServiceRequest[] = [
    {
      id: 'r_1',
      createdAt: nowIso(),
      status: 'open',
      category: 'Plumbing',
      title: 'Bathroom tap leaking',
      description: 'Continuous leak from tap. Need repair or replacement.',
      budget: 800,
      urgency: 'medium',
      location: 'Chennai',
      customerId: 'c_1',
    },
  ]

  save({ admins, customers, workers, requests, reviews: [] })
}

export function listWorkers(category?: ServiceCategory) {
  const db = load()
  if (!category) return db.workers
  return db.workers.filter((w) => w.categories.includes(category))
}

export function listRequests() {
  return load().requests
}

export function listAdmins() {
  return load().admins
}

export function getWorker(workerId: string) {
  const db = load()
  return db.workers.find((w) => w.id === workerId)
}

export function updateWorkerProfile(params: {
  workerId: string
  patch: Partial<Pick<WorkerProfile, 'name' | 'email' | 'phone' | 'whatsapp' | 'viber' | 'categories' | 'skills' | 'about' | 'promoPosterUrl'>>
}) {
  const db = load()
  const w = db.workers.find((x) => x.id === params.workerId)
  if (!w) throw new Error('Worker not found')
  if (!w.active) throw new Error('Worker is deactivated')

  Object.assign(w, params.patch)

  if (!Array.isArray(w.categories)) w.categories = ['Other']
  if (!Array.isArray(w.skills)) w.skills = []
  save(db)
}

export function createRequest(input: {
  customerId: string
  category: ServiceCategory
  title: string
  description: string
  budget: number
  urgency: 'low' | 'medium' | 'high'
  location: string
}) {
  const db = load()
  const customer = db.customers.find((c) => c.id === input.customerId)
  if (!customer) throw new Error('Customer not found')
  if (!customer.active) throw new Error('Customer is deactivated')
  const req: ServiceRequest = {
    id: `r_${Math.random().toString(16).slice(2)}`,
    createdAt: nowIso(),
    status: 'open',
    interestedWorkerIds: [],
    quoteOffers: [],
    ...input,
  }
  db.requests.unshift(req)
  save(db)
  return req
}

function setStatus(req: ServiceRequest, next: ServiceRequestStatus) {
  req.status = next
}

function findReqOrThrow(db: DB, requestId: string) {
  const req = db.requests.find((r) => r.id === requestId)
  if (!req) throw new Error('Request not found')
  return req
}

export function acceptRequest(params: { requestId: string; workerId: string }) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.status !== 'open') throw new Error('Request is not open')

  const worker = db.workers.find((w) => w.id === params.workerId)
  if (!worker) throw new Error('Worker not found')
  if (!worker.active) throw new Error('Worker is deactivated')

  req.interestedWorkerIds = Array.isArray(req.interestedWorkerIds) ? req.interestedWorkerIds : []
  if (!req.interestedWorkerIds.includes(params.workerId)) {
    req.interestedWorkerIds.push(params.workerId)
  }
  save(db)
}

export function selectWorker(params: { requestId: string; customerId: string; workerId: string }) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.customerId !== params.customerId) throw new Error('Not your request')
  if (req.status !== 'open') throw new Error('Request is not open')

  const worker = db.workers.find((w) => w.id === params.workerId)
  if (!worker) throw new Error('Worker not found')
  if (!worker.active) throw new Error('Worker is deactivated')

  req.acceptedWorkerId = params.workerId
  req.interestedWorkerIds = Array.isArray(req.interestedWorkerIds) ? req.interestedWorkerIds : []
  if (!req.interestedWorkerIds.includes(params.workerId)) {
    req.interestedWorkerIds.push(params.workerId)
  }
  setStatus(req, 'inspection_pending_worker_proposal')
  save(db)
}

export function submitQuoteOffer(params: {
  requestId: string
  workerId: string
  amount: number
  notes?: string
}) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.status !== 'open') throw new Error('Request is not open')
  if (!Number.isFinite(params.amount) || params.amount < 0) throw new Error('Invalid amount')

  const worker = db.workers.find((w) => w.id === params.workerId)
  if (!worker) throw new Error('Worker not found')
  if (!worker.active) throw new Error('Worker is deactivated')

  req.interestedWorkerIds = Array.isArray(req.interestedWorkerIds) ? req.interestedWorkerIds : []
  if (!req.interestedWorkerIds.includes(params.workerId)) {
    req.interestedWorkerIds.push(params.workerId)
  }

  req.quoteOffers = Array.isArray(req.quoteOffers) ? req.quoteOffers : []
  const idx = req.quoteOffers.findIndex((o) => o.workerId === params.workerId)
  const offer = {
    workerId: params.workerId,
    amount: params.amount,
    notes: params.notes,
    submittedAt: nowIso(),
  }
  if (idx >= 0) req.quoteOffers[idx] = offer
  else req.quoteOffers.push(offer)

  save(db)
}

export function chooseOffer(params: { requestId: string; customerId: string; workerId: string }) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.customerId !== params.customerId) throw new Error('Not your request')
  if (req.status !== 'open') throw new Error('Request is not open')

  const offers = Array.isArray(req.quoteOffers) ? req.quoteOffers : []
  const offer = offers.find((o) => o.workerId === params.workerId)
  if (!offer) throw new Error('Quote offer not found')

  req.acceptedWorkerId = params.workerId
  setStatus(req, 'quote_pending_approval')
  req.quote = {
    amount: offer.amount,
    notes: offer.notes,
    submittedAt: offer.submittedAt,
  }
  save(db)
}

export function addReview(params: {
  requestId: string
  customerId: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
}) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.customerId !== params.customerId) throw new Error('Not your request')
  if (req.status !== 'completed') throw new Error('Request is not completed')
  if (!req.acceptedWorkerId) throw new Error('No worker assigned')

  const exists = db.reviews.find(
    (r) => r.requestId === params.requestId && r.customerId === params.customerId,
  )
  if (exists) throw new Error('Already reviewed')

  const review: Review = {
    id: `rev_${Math.random().toString(16).slice(2)}`,
    createdAt: nowIso(),
    requestId: params.requestId,
    customerId: params.customerId,
    workerId: req.acceptedWorkerId,
    rating: params.rating,
    comment: params.comment,
  }
  db.reviews.unshift(review)

  const worker = db.workers.find((w) => w.id === req.acceptedWorkerId)
  if (worker) {
    const nextCount = (worker.ratingCount ?? 0) + 1
    const nextAvg = ((worker.ratingAvg ?? 0) * (worker.ratingCount ?? 0) + params.rating) / nextCount
    worker.ratingAvg = Math.round(nextAvg * 10) / 10
    worker.ratingCount = nextCount
  }

  save(db)
  return review
}

export function listReviewsForWorker(workerId: string) {
  const db = load()
  return db.reviews.filter((r) => r.workerId === workerId)
}

export function customerConfirmWorker(params: { requestId: string; customerId: string }) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.customerId !== params.customerId) throw new Error('Not your request')
  if (req.status !== 'pending_customer_confirmation') {
    throw new Error('Request is not awaiting customer confirmation')
  }
  setStatus(req, 'inspection_pending_worker_proposal')
  save(db)
}

export function proposeInspection(params: {
  requestId: string
  workerId: string
  whenIso: string
}) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.acceptedWorkerId !== params.workerId) throw new Error('Not assigned worker')
  if (req.status !== 'inspection_pending_worker_proposal') {
    throw new Error('Not awaiting inspection proposal')
  }
  req.inspection = {
    ...(req.inspection ?? {}),
    proposedAt: nowIso(),
    scheduledFor: params.whenIso,
  }
  setStatus(req, 'inspection_pending_customer_confirmation')
  save(db)
}

export function customerConfirmInspection(params: { requestId: string; customerId: string }) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.customerId !== params.customerId) throw new Error('Not your request')
  if (req.status !== 'inspection_pending_customer_confirmation') {
    throw new Error('Not awaiting customer inspection confirmation')
  }
  req.inspection = { ...(req.inspection ?? {}), customerConfirmedAt: nowIso() }
  setStatus(req, 'inspection_scheduled')
  save(db)
}

export function workerCompleteInspection(params: { requestId: string; workerId: string }) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.acceptedWorkerId !== params.workerId) throw new Error('Not assigned worker')
  if (req.status !== 'inspection_scheduled') throw new Error('Inspection not scheduled')
  req.inspection = { ...(req.inspection ?? {}), completedByWorkerAt: nowIso() }
  setStatus(req, 'inspection_completed_pending_customer_confirm')
  save(db)
}

export function customerConfirmInspectionCompleted(params: {
  requestId: string
  customerId: string
}) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.customerId !== params.customerId) throw new Error('Not your request')
  if (req.status !== 'inspection_completed_pending_customer_confirm') {
    throw new Error('Not awaiting inspection completion confirmation')
  }
  req.inspection = { ...(req.inspection ?? {}), completedConfirmedByCustomerAt: nowIso() }
  setStatus(req, 'awaiting_quote')
  save(db)
}

export function submitQuote(params: {
  requestId: string
  workerId: string
  amount: number
  notes?: string
}) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.acceptedWorkerId !== params.workerId) throw new Error('Not assigned worker')
  if (req.status !== 'awaiting_quote') throw new Error('Not awaiting quote')

  req.quote = {
    amount: params.amount,
    notes: params.notes,
    submittedAt: nowIso(),
  }
  setStatus(req, 'quote_pending_approval')
  save(db)
}

export function approveQuote(params: { requestId: string; customerId: string }) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.customerId !== params.customerId) throw new Error('Not your request')
  if (req.status !== 'quote_pending_approval') throw new Error('Not awaiting quote approval')

  req.quote = { ...(req.quote ?? {}), approvedAt: nowIso() }
  setStatus(req, 'work_pending_worker_schedule')
  save(db)
}

export function scheduleWork(params: {
  requestId: string
  workerId: string
  whenIso: string
}) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.acceptedWorkerId !== params.workerId) throw new Error('Not assigned worker')
  if (req.status !== 'work_pending_worker_schedule') throw new Error('Not awaiting work schedule')

  req.work = {
    ...(req.work ?? {}),
    scheduledFor: params.whenIso,
    scheduledByWorkerAt: nowIso(),
  }
  setStatus(req, 'work_pending_customer_confirmation')
  save(db)
}

export function customerConfirmWorkSchedule(params: { requestId: string; customerId: string }) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.customerId !== params.customerId) throw new Error('Not your request')
  if (req.status !== 'work_pending_customer_confirmation') {
    throw new Error('Not awaiting work schedule confirmation')
  }
  req.work = { ...(req.work ?? {}), confirmedByCustomerAt: nowIso() }
  setStatus(req, 'work_scheduled')
  save(db)
}

export function workerCompleteWork(params: { requestId: string; workerId: string }) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.acceptedWorkerId !== params.workerId) throw new Error('Not assigned worker')
  if (req.status !== 'work_scheduled') throw new Error('Work is not scheduled')

  req.work = { ...(req.work ?? {}), completedByWorkerAt: nowIso() }
  setStatus(req, 'work_completed_pending_customer_confirm')
  save(db)
}

export function customerConfirmWorkCompleted(params: { requestId: string; customerId: string }) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.customerId !== params.customerId) throw new Error('Not your request')
  if (req.status !== 'work_completed_pending_customer_confirm') {
    throw new Error('Not awaiting work completion confirmation')
  }

  req.work = { ...(req.work ?? {}), completedConfirmedByCustomerAt: nowIso() }
  req.payment = { status: 'pending', markedAt: nowIso() }
  setStatus(req, 'payment_pending')
  save(db)
}

export function markPayment(params: { requestId: string; workerId: string; status: 'pending' | 'paid' }) {
  const db = load()
  const req = findReqOrThrow(db, params.requestId)
  if (req.acceptedWorkerId !== params.workerId) throw new Error('Not assigned worker')
  if (req.status !== 'payment_pending') throw new Error('Payment is not pending')

  req.payment = { status: params.status, markedAt: nowIso() }
  if (params.status === 'paid') {
    setStatus(req, 'completed')
  }
  save(db)
}
