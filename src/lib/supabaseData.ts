import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import type {
  DB,
  AdminProfile,
  CustomerProfile,
  WorkerProfile,
  ServiceRequest,
  Review,
} from './types'

type ProfileRow = {
  id: string
  email: string | null
  name: string | null
  role: 'customer' | 'worker' | 'admin'
  active: boolean | null
}

type WorkerProfileRow = {
  id: string
  phone: string | null
  whatsapp: string | null
  viber: string | null
  categories: string[] | null
  skills: string[] | null
  about: string | null
  promo_poster_url: string | null
  rating_avg: number | null
  rating_count: number | null
  jobs_done: number | null
}

type CustomerProfileRow = {
  id: string
  phone: string | null
  location: string | null
}

type ServiceRequestRow = {
  id: string
  created_at: string | null
  status: ServiceRequest['status']
  category: ServiceRequest['category']
  title: string
  description: string | null
  budget: number | null
  urgency: ServiceRequest['urgency'] | null
  location: string | null
  customer_id: string
  accepted_worker_id: string | null
  interested_worker_ids: string[] | null
  inspection: ServiceRequest['inspection'] | null
  quote: ServiceRequest['quote'] | null
  work: ServiceRequest['work'] | null
  payment: ServiceRequest['payment'] | null
}

type ReviewRow = {
  id: string
  created_at: string | null
  request_id: string | null
  customer_id: string | null
  worker_id: string | null
  rating: number | null
  comment: string | null
}

export function useDB() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [workersExtra, setWorkersExtra] = useState<WorkerProfileRow[]>([])
  const [customersExtra, setCustomersExtra] = useState<CustomerProfileRow[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pRes, wRes, cRes, rRes, revRes] = await Promise.all([
        supabase.from('profiles').select('id,email,name,role,active'),
        supabase
          .from('worker_profiles')
          .select('id,phone,whatsapp,viber,categories,skills,about,promo_poster_url,rating_avg,rating_count,jobs_done'),
        supabase.from('customer_profiles').select('id,phone,location'),
        supabase.from('service_requests').select('*'),
        supabase.from('reviews').select('*'),
      ])

      const firstError = pRes.error ?? wRes.error ?? cRes.error ?? rRes.error ?? revRes.error
      if (firstError) {
        setError(firstError.message)
        return
      }

      setProfiles((pRes.data ?? []) as ProfileRow[])
      setWorkersExtra((wRes.data ?? []) as WorkerProfileRow[])
      setCustomersExtra((cRes.data ?? []) as CustomerProfileRow[])

      const requestRows = (rRes.data ?? []) as ServiceRequestRow[]
      setRequests(
        requestRows.map((r) => ({
          id: r.id,
          createdAt: r.created_at ?? new Date().toISOString(),
          status: r.status,
          category: r.category,
          title: r.title,
          description: r.description ?? '',
          budget: r.budget ?? 0,
          urgency: (r.urgency ?? 'medium') as ServiceRequest['urgency'],
          location: r.location ?? '',
          customerId: r.customer_id,
          acceptedWorkerId: r.accepted_worker_id ?? undefined,
          interestedWorkerIds: r.interested_worker_ids ?? [],
          inspection: r.inspection ?? undefined,
          quote: r.quote ?? undefined,
          work: r.work ?? undefined,
          payment: r.payment ?? undefined,
          quoteOffers: [],
        })),
      )

      const reviewRows = (revRes.data ?? []) as ReviewRow[]
      setReviews(
        reviewRows
          .filter((rr) => !!rr.request_id && !!rr.customer_id && !!rr.worker_id && !!rr.created_at && !!rr.rating)
          .map((rr) => ({
            id: rr.id,
            createdAt: rr.created_at as string,
            requestId: rr.request_id as string,
            customerId: rr.customer_id as string,
            workerId: rr.worker_id as string,
            rating: rr.rating as 1 | 2 | 3 | 4 | 5,
            comment: rr.comment ?? undefined,
          })),
      )
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      await fetchAll()
    })()

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        if (!cancelled) void fetchAll()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'worker_profiles' }, () => {
        if (!cancelled) void fetchAll()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_profiles' }, () => {
        if (!cancelled) void fetchAll()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => {
        if (!cancelled) void fetchAll()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        if (!cancelled) void fetchAll()
      })
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [fetchAll])

  const db: DB = useMemo(() => {
    const workerExtraById = new Map(workersExtra.map((w) => [w.id, w]))
    const customerExtraById = new Map(customersExtra.map((c) => [c.id, c]))

    const admins: AdminProfile[] = profiles
      .filter((p) => p.role === 'admin')
      .map((p) => ({
        id: p.id,
        name: p.name ?? '',
        email: p.email ?? '',
        role: 'admin',
        active: p.active ?? true,
      }))

    const customers: CustomerProfile[] = profiles
      .filter((p) => p.role === 'customer')
      .map((p) => {
        const extra = customerExtraById.get(p.id)
        return {
          id: p.id,
          name: p.name ?? '',
          email: p.email ?? '',
          phone: extra?.phone ?? undefined,
          active: p.active ?? true,
        }
      })

    const workers: WorkerProfile[] = profiles
      .filter((p) => p.role === 'worker')
      .map((p) => {
        const extra = workerExtraById.get(p.id)
        return {
          id: p.id,
          name: p.name ?? '',
          email: p.email ?? '',
          phone: extra?.phone ?? undefined,
          whatsapp: extra?.whatsapp ?? undefined,
          viber: extra?.viber ?? undefined,
          categories: (extra?.categories ?? []) as any,
          skills: (extra?.skills ?? []) as any,
          about: extra?.about ?? undefined,
          promoPosterUrl: extra?.promo_poster_url ?? undefined,
          ratingAvg: extra?.rating_avg ?? 0,
          ratingCount: extra?.rating_count ?? 0,
          jobsDone: extra?.jobs_done ?? 0,
          active: p.active ?? true,
        }
      })

    return {
      admins,
      customers,
      workers,
      requests,
      reviews,
    }
  }, [customersExtra, profiles, requests, reviews, workersExtra])

  return { db, loading, error, refetch: fetchAll }
}
