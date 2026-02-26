import { useMemo, useState } from 'react'
import {
  createRequest,
  customerConfirmInspection,
  customerConfirmInspectionCompleted,
  customerConfirmWorkCompleted,
  customerConfirmWorkSchedule,
  selectWorker,
} from '../lib/supabaseMutations'
import { useDB } from '../lib/supabaseData'
import ServiceRequestForm from './ServiceRequestForm'
import WorkerProfileModal from './WorkerProfileModal'
import type { ServiceCategory, ServiceRequest, SessionUser, WorkerProfile } from '../lib/types'
import { useAuth } from '../contexts/AuthContext'

const CATEGORIES: Array<ServiceCategory | 'All'> = [
  'All',
  'AC',
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Cleaning',
  'Painting',
  'Appliance',
  'PestControl',
  'Other',
]

function statusLabel(s: string) {
  return s.replace(/_/g, ' ')
}

function formatIso(iso?: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString()
}

type ReactNode = React.ReactNode

export default function CustomerDashboard({
  activeTab,
  setActiveTab,
  workerCategory,
  setWorkerCategory,
  workerQuery,
  setWorkerQuery,
  profileModalWorkerId,
  setProfileModalWorkerId,
}: {
  activeTab: 'create' | 'my' | 'completed' | 'confirm' | 'workers'
  setActiveTab: (tab: 'create' | 'my' | 'completed' | 'confirm' | 'workers') => void
  workerCategory: ServiceCategory | 'All'
  setWorkerCategory: (cat: ServiceCategory | 'All') => void
  workerQuery: string
  setWorkerQuery: (q: string) => void
  profileModalWorkerId: string | null
  setProfileModalWorkerId: (id: string | null) => void
}) {
  const { user: authUser } = useAuth()
  const user: SessionUser = useMemo(
    () => ({
      id: authUser?.id ?? 'temp',
      role: 'customer',
      name: (authUser?.user_metadata?.name as string | undefined) ?? authUser?.email ?? 'Customer',
    }),
    [authUser?.email, authUser?.id, authUser?.user_metadata],
  )
  const { db, loading, error } = useDB()

  const myRequests = useMemo(() => {
    return db.requests.filter((r: ServiceRequest) => r.customerId === user.id)
  }, [db.requests, user.id])

  const myActiveRequests = useMemo(() => {
    return myRequests.filter((r) => r.status !== 'completed')
  }, [myRequests])

  const myCompletedRequests = useMemo(() => {
    return myRequests.filter((r) => r.status === 'completed')
  }, [myRequests])

  const needsMyAction = useMemo(() => {
    return myRequests.filter((r: ServiceRequest) =>
      [
        'pending_customer_confirmation',
        'inspection_pending_customer_confirmation',
        'inspection_completed_pending_customer_confirm',
        'quote_pending_approval',
        'work_pending_customer_confirmation',
        'work_completed_pending_customer_confirm',
      ].includes(r.status),
    )
  }, [myRequests])

  const reviewsByRequest = useMemo(() => {
    const map = new Map<string, true>()
    for (const r of db.reviews) {
      if (r.customerId === user.id) map.set(r.requestId, true)
    }
    return map
  }, [db.reviews, user.id])

  const workers = useMemo(() => {
    const q = workerQuery.trim().toLowerCase()
    return db.workers
      .filter((w) => (workerCategory === 'All' ? true : w.categories.includes(workerCategory)))
      .filter((w) => {
        if (!q) return true
        return (
          w.name.toLowerCase().includes(q) ||
          w.categories.join(',').toLowerCase().includes(q) ||
          w.skills.join(',').toLowerCase().includes(q) ||
          (w.about ?? '').toLowerCase().includes(q)
        )
      })
      .slice()
      .sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0))
  }, [db.workers, workerCategory, workerQuery])

  if (loading) return <div className="text-white">Loading...</div>
  if (error) return <div className="text-white">{error}</div>

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="text-sm font-semibold">Customer Dashboard</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              activeTab === 'create'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('create')}
          >
            New Request
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              activeTab === 'my'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('my')}
          >
            My Requests
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              activeTab === 'completed'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({myCompletedRequests.length})
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              activeTab === 'confirm'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('confirm')}
          >
            Needs Action ({needsMyAction.length})
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              activeTab === 'workers'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('workers')}
          >
            Find Workers
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <ServiceRequestForm
          onSubmit={(v) => {
            createRequest({ customerId: user.id, ...v })
            setActiveTab('my')
          }}
        />
      ) : null}

      {activeTab === 'workers' ? (
        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-white/70">Category</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white"
                  value={workerCategory}
                  onChange={(e) => setWorkerCategory(e.target.value as ServiceCategory | 'All')}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-white/70">Search</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white"
                  value={workerQuery}
                  onChange={(e) => setWorkerQuery(e.target.value)}
                  placeholder="Name, skill, category"
                />
              </div>
            </div>
          </div>

          {workers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
              No workers found.
            </div>
          ) : (
            workers.map((w) => <WorkerCard key={w.id} worker={w} onShowProfile={setProfileModalWorkerId} />)
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
            Note: all workers can accept any job. Categories/skills are used only for recommendations. Click “View full profile” on any worker to see all details.
          </div>
        </div>
      ) : null}

      {activeTab === 'my' ? (
        <div className="grid gap-3">
          {myActiveRequests.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
              No requests yet.
            </div>
          ) : (
            myActiveRequests.map((r: ServiceRequest) => (
              <CustomerRequestCard
                key={r.id}
                req={r}
                userId={user.id}
                hasReviewed={reviewsByRequest.has(r.id)}
                onShowWorkerProfile={setProfileModalWorkerId}
              />
            ))
          )}
        </div>
      ) : null}

      {activeTab === 'completed' ? (
        <div className="grid gap-3">
          {myCompletedRequests.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
              No completed jobs yet.
            </div>
          ) : (
            myCompletedRequests.map((r: ServiceRequest) => (
              <CustomerRequestCard
                key={r.id}
                req={r}
                userId={user.id}
                hasReviewed={reviewsByRequest.has(r.id)}
                onShowWorkerProfile={setProfileModalWorkerId}
              />
            ))
          )}
        </div>
      ) : null}

      {activeTab === 'confirm' ? (
        <div className="grid gap-3">
          {needsMyAction.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
              Nothing to confirm right now.
            </div>
          ) : (
            needsMyAction.map((r: ServiceRequest) => (
              <CustomerActionCard key={r.id} req={r} customerId={user.id} onShowWorkerProfile={setProfileModalWorkerId} />
            ))
          )}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
        Tip: open a second browser window and sign in as a Worker to progress the workflow.
      </div>

      {profileModalWorkerId && <WorkerProfileModal workerId={profileModalWorkerId} onClose={() => setProfileModalWorkerId(null)} />}
    </div>
  )
}

function CardShell({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">{children}</div>
}

function CustomerRequestCard({
  req,
  userId,
  hasReviewed,
  onShowWorkerProfile,
}: {
  req: ServiceRequest
  userId: string
  hasReviewed: boolean
  onShowWorkerProfile: (id: string) => void
}) {
  const { db } = useDB()
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5)
  const [comment, setComment] = useState('')

  const interestedWorkers = useMemo(() => {
    const ids = req.interestedWorkerIds ?? []
    return ids
      .map((id) => db.workers.find((w: WorkerProfile) => w.id === id))
      .filter(Boolean) as WorkerProfile[]
  }, [db.workers, req.interestedWorkerIds])

  const assignedWorker = useMemo(() => {
    if (!req.acceptedWorkerId) return null
    return db.workers.find((w: WorkerProfile) => w.id === req.acceptedWorkerId)
  }, [db.workers, req.acceptedWorkerId])

  const offers = useMemo(() => {
    const all = req.quoteOffers ?? []
    return all
      .slice()
      .sort((a, b) => a.amount - b.amount)
      .map((o) => ({
        ...o,
        worker: db.workers.find((w: WorkerProfile) => w.id === o.workerId),
      }))
  }, [db.workers, req.quoteOffers])

  return (
    <CardShell>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{req.title}</div>
          <div className="mt-1 text-xs text-white/70">
            {req.category} • MVR {req.budget} • {req.urgency} • {req.location}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
          {statusLabel(req.status)}
        </div>
      </div>

      <div className="mt-3 text-sm text-white/80">{req.description}</div>

      {assignedWorker && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="text-sm font-semibold text-white/80">Assigned Worker</div>
          <div className="mt-1 text-sm">{assignedWorker.name}</div>
          <div className="mt-1 text-xs text-white/60">
            Rating: {assignedWorker.ratingAvg.toFixed(1)} ({assignedWorker.ratingCount}) • Jobs done: {assignedWorker.jobsDone}
          </div>
          <div className="mt-2 grid gap-1 text-xs text-white/70 md:grid-cols-2">
            <div>Phone: {assignedWorker.phone ?? '-'}</div>
            <div>WhatsApp: {assignedWorker.whatsapp ?? '-'}</div>
            <div>Viber: {assignedWorker.viber ?? '-'}</div>
            <div>Email: {assignedWorker.email ?? '-'}</div>
          </div>
          <button
            className="mt-2 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
            onClick={() => onShowWorkerProfile(assignedWorker.id)}
          >
            View full profile
          </button>
        </div>
      )}

      <div className="mt-3 grid gap-2 text-xs text-white/70 md:grid-cols-2">
        <div>Accepted worker: {req.acceptedWorkerId ?? '-'}</div>
        <div>Inspection: {formatIso(req.inspection?.scheduledFor)}</div>
        <div>Quote: {req.quote?.amount ? `MVR ${req.quote.amount}` : '-'}</div>
        <div>Work: {formatIso(req.work?.scheduledFor)}</div>
      </div>

      {req.status === 'open' ? (
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold">Interested workers ({interestedWorkers.length})</div>
            {interestedWorkers.length ? (
              <div className="mt-2 grid gap-2">
                {interestedWorkers.map((w) => (
                  <div key={w.id} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold">{w.name}</div>
                      <div className="mt-1 text-xs text-white/70">
                        {w.categories.join(', ')} • {w.ratingAvg.toFixed(1)} ({w.ratingCount})
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        Phone: {w.phone ?? '-'} • WhatsApp: {w.whatsapp ?? '-'}
                      </div>
                    </div>
                    <button
                      className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
                      onClick={() => selectWorker({ requestId: req.id, customerId: userId, workerId: w.id })}
                    >
                      Select for inspection
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-xs text-white/60">No workers yet. Ask workers to open the app and click “I’m Interested”.</div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold">Quotations ({offers.length})</div>
            {offers.length ? (
              <div className="mt-2 grid gap-2">
                {offers.map((o) => (
                  <div key={o.workerId} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold">{o.worker?.name ?? o.workerId}</div>
                      <div className="mt-1 text-xs text-white/70">MVR {o.amount}</div>
                      {o.notes ? <div className="mt-1 text-xs text-white/60">{o.notes}</div> : null}
                    </div>
                    <button
                      className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
                      onClick={() => console.log('chooseOffer stub', { requestId: req.id, customerId: userId, offerId: o.workerId })}
                    >
                      Choose this quotation
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-xs text-white/60">No quotations yet.</div>
            )}
          </div>
        </div>
      ) : null}

      {req.status === 'pending_customer_confirmation' ? (
        <button
          className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
          onClick={() => selectWorker({ requestId: req.id, customerId: userId, workerId: req.acceptedWorkerId! })}
        >
          Confirm Worker
        </button>
      ) : null}

      {req.status === 'completed' ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
          {hasReviewed ? (
            <div className="text-sm text-white/70">Thanks! You already rated this job.</div>
          ) : (
            <div className="grid gap-2">
              <div className="text-sm font-semibold">Rate this worker</div>
              <div className="grid gap-2 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-white/70">Rating</label>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-white/70">Comment (optional)</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was the service?"
                  />
                </div>
              </div>
              <button
                className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
                onClick={() => console.log('addReview stub', { requestId: req.id, customerId: userId, workerId: req.acceptedWorkerId, rating, comment: comment.trim() || undefined })}
              >
                Submit Rating
              </button>
            </div>
          )}
        </div>
      ) : null}
    </CardShell>
  )
}

function WorkerCard({ worker, onShowProfile }: { worker: WorkerProfile; onShowProfile: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-white">
      {worker.promoPosterUrl ? (
        <img
          src={worker.promoPosterUrl}
          alt=""
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{worker.name}</div>
            <div className="mt-1 text-xs text-white/70">
              {worker.categories.join(', ')}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
            {worker.ratingAvg.toFixed(1)} ({worker.ratingCount})
          </div>
        </div>

        {worker.about ? <div className="mt-3 text-sm text-white/80">{worker.about}</div> : null}

        {worker.skills.length ? (
          <div className="mt-3 text-xs text-white/70">Skills: {worker.skills.join(', ')}</div>
        ) : null}

        <div className="mt-3 grid gap-1 text-xs text-white/70 md:grid-cols-2">
          <div>Phone: {worker.phone ?? '-'}</div>
          <div>WhatsApp: {worker.whatsapp ?? '-'}</div>
          <div>Viber: {worker.viber ?? '-'}</div>
          <div>Email: {worker.email ?? '-'}</div>
        </div>

        <button
          className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
          onClick={() => onShowProfile(worker.id)}
        >
          View full profile
        </button>
      </div>
    </div>
  )
}

function CustomerActionCard({ req, customerId, onShowWorkerProfile }: { req: ServiceRequest; customerId: string; onShowWorkerProfile: (id: string) => void }) {
  const { db } = useDB()
  const assignedWorker = useMemo(() => {
    if (!req.acceptedWorkerId) return null
    return db.workers.find((w: WorkerProfile) => w.id === req.acceptedWorkerId)
  }, [db.workers, req.acceptedWorkerId])

  return (
    <CardShell>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{req.title}</div>
          <div className="mt-1 text-xs text-white/70">{req.category}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
          {statusLabel(req.status)}
        </div>
      </div>

      <div className="mt-3 text-sm text-white/80">{req.description}</div>

      {assignedWorker && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="text-sm font-semibold text-white/80">Assigned Worker</div>
          <div className="mt-1 text-sm">{assignedWorker.name}</div>
          <div className="mt-1 text-xs text-white/60">
            Rating: {assignedWorker.ratingAvg.toFixed(1)} ({assignedWorker.ratingCount}) • Jobs done: {assignedWorker.jobsDone}
          </div>
          <div className="mt-2 grid gap-1 text-xs text-white/70 md:grid-cols-2">
            <div>Phone: {assignedWorker.phone ?? '-'}</div>
            <div>WhatsApp: {assignedWorker.whatsapp ?? '-'}</div>
            <div>Viber: {assignedWorker.viber ?? '-'}</div>
            <div>Email: {assignedWorker.email ?? '-'}</div>
          </div>
          <button
            className="mt-2 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
            onClick={() => onShowWorkerProfile(assignedWorker.id)}
          >
            View full profile
          </button>
        </div>
      )}

      {req.status === 'pending_customer_confirmation' ? (
        <button
          className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
          onClick={() => selectWorker({ requestId: req.id, customerId, workerId: req.acceptedWorkerId! })}
        >
          Confirm Worker
        </button>
      ) : null}

      {req.status === 'inspection_pending_customer_confirmation' ? (
        <button
          className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
          onClick={() => customerConfirmInspection({ requestId: req.id, customerId })}
        >
          Confirm Inspection
        </button>
      ) : null}

      {req.status === 'inspection_completed_pending_customer_confirm' ? (
        <button
          className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
          onClick={() => customerConfirmInspectionCompleted({ requestId: req.id, customerId })}
        >
          Confirm Inspection Completed
        </button>
      ) : null}

      {req.status === 'quote_pending_approval' ? (
        <div className="mt-4 grid gap-2">
          <div className="text-sm text-white/80">
            Quote: <span className="font-semibold">MVR {req.quote?.amount ?? '-'}</span>
          </div>
          {req.quote?.notes ? <div className="text-xs text-white/60">{req.quote.notes}</div> : null}
          <button
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
            onClick={() => customerConfirmWorkSchedule({ requestId: req.id, customerId })}
          >
            Approve Quote
          </button>
        </div>
      ) : null}

      {req.status === 'work_pending_customer_confirmation' ? (
        <button
          className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
          onClick={() => customerConfirmWorkSchedule({ requestId: req.id, customerId })}
        >
          Confirm Work Schedule
        </button>
      ) : null}

      {req.status === 'work_completed_pending_customer_confirm' ? (
        <button
          className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
          onClick={() => customerConfirmWorkCompleted({ requestId: req.id, customerId })}
        >
          Confirm Work Completed
        </button>
      ) : null}
    </CardShell>
  )
}
