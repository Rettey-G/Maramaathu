export type Role = 'customer' | 'worker' | 'admin'

export type ServiceCategory =
  | 'AC'
  | 'Plumbing'
  | 'Electrical'
  | 'Carpentry'
  | 'Cleaning'
  | 'Painting'
  | 'Appliance'
  | 'PestControl'
  | 'Other'

export type ServiceRequestStatus =
  | 'open'
  | 'pending_customer_confirmation'
  | 'inspection_pending_worker_proposal'
  | 'inspection_pending_customer_confirmation'
  | 'inspection_scheduled'
  | 'inspection_completed_pending_customer_confirm'
  | 'awaiting_quote'
  | 'quote_pending_approval'
  | 'work_pending_worker_schedule'
  | 'work_pending_customer_confirmation'
  | 'work_scheduled'
  | 'work_completed_pending_customer_confirm'
  | 'payment_pending'
  | 'completed'

export type SessionUser = {
  id: string
  role: Role
  name: string
}

export type AdminProfile = {
  id: string
  name: string
  email: string
  role: 'admin'
  active: boolean
}

export type CustomerProfile = {
  id: string
  name: string
  email: string
  phone?: string
  active: boolean
}

export type WorkerProfile = {
  id: string
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  viber?: string
  categories: ServiceCategory[]
  skills: string[]
  about?: string
  promoPosterUrl?: string
  ratingAvg: number
  ratingCount: number
  jobsDone: number
  active: boolean
}

export type Review = {
  id: string
  createdAt: string
  requestId: string
  customerId: string
  workerId: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
}

export type InspectionInfo = {
  proposedAt?: string
  scheduledFor?: string
  customerConfirmedAt?: string
  workerConfirmedAt?: string
  completedAt?: string
  completedByWorkerAt?: string
  completedConfirmedByCustomerAt?: string
}

export type QuoteInfo = {
  amount?: number
  notes?: string
  submittedAt?: string
  approvedAt?: string
}

export type QuoteOffer = {
  workerId: string
  amount: number
  notes?: string
  submittedAt: string
}

export type WorkInfo = {
  scheduledFor?: string
  scheduledByWorkerAt?: string
  confirmedByCustomerAt?: string
  completedByWorkerAt?: string
  completedConfirmedByCustomerAt?: string
}

export type PaymentInfo = {
  status?: 'pending' | 'paid'
  markedAt?: string
}

export type ServiceRequest = {
  id: string
  createdAt: string
  status: ServiceRequestStatus
  category: ServiceCategory
  title: string
  description: string
  budget: number
  urgency: 'low' | 'medium' | 'high'
  location: string

  customerId: string
  interestedWorkerIds?: string[]
  acceptedWorkerId?: string

  quoteOffers?: QuoteOffer[]

  inspection?: InspectionInfo
  quote?: QuoteInfo
  work?: WorkInfo
  payment?: PaymentInfo
}

export type DB = {
  admins: AdminProfile[]
  customers: CustomerProfile[]
  workers: WorkerProfile[]
  requests: ServiceRequest[]
  reviews: Review[]
}
