import { useMemo, useState, type ReactNode } from 'react'
import {
  acceptRequest,
  markPayment,
  proposeInspection,
  scheduleWork,
  submitQuoteOffer,
  submitQuote,
  workerCompleteInspection,
  workerCompleteWork,
} from '../lib/supabaseMutations'
import { useDB } from '../lib/supabaseData'
import { useAuth } from '../contexts/AuthContext'
import type { ServiceCategory, ServiceRequest, SessionUser } from '../lib/types'
import WorkerProfileForm from './WorkerProfileForm'

function statusLabel(s: ServiceRequest['status']) {
  return s.replace(/_/g, ' ')
}

function OpenRequestCard({
  req,
  workerId,
  recommended,
}: {
  req: ServiceRequest
  workerId: string
  recommended: boolean
}) {
  const alreadyInterested = (req.interestedWorkerIds ?? []).includes(workerId)
  const myOffer = (req.quoteOffers ?? []).find((o) => o.workerId === workerId)
  const [offerAmount, setOfferAmount] = useState<number>(myOffer?.amount ?? 0)
  const [offerNotes, setOfferNotes] = useState<string>(myOffer?.notes ?? '')

  return (
    <CardShell>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{req.title}</div>
          <div className="mt-1 text-xs text-white/70">
            {req.category} • MVR {req.budget} • {req.urgency} • {req.location}
          </div>
          {recommended ? <div className="mt-1 text-xs text-white/60">Recommended (matches your categories)</div> : null}
          {alreadyInterested ? <div className="mt-1 text-xs text-white/60">You are interested</div> : null}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
          {statusLabel(req.status)}
        </div>
      </div>

      <div className="mt-3 text-sm text-white/80">{req.description}</div>

      <div className="mt-4 grid gap-2">
        <button
          className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
          onClick={() => acceptRequest({ requestId: req.id, workerId })}
        >
          {alreadyInterested ? 'Interested (Saved)' : "I'm Interested"}
        </button>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-sm font-semibold">Send quotation (MVR)</div>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-white/70">Amount (MVR)</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white"
                value={offerAmount}
                onChange={(e) => setOfferAmount(Number(e.target.value))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-white/70">Notes (optional)</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white"
                value={offerNotes}
                onChange={(e) => setOfferNotes(e.target.value)}
                placeholder="Inspection included, spare parts extra..."
              />
            </div>
          </div>
          <button
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 sm:w-auto"
            onClick={() =>
              submitQuoteOffer({
                requestId: req.id,
                workerId,
                amount: offerAmount,
                notes: offerNotes.trim() || undefined,
              })
            }
          >
            Submit Quotation
          </button>
        </div>
      </div>
    </CardShell>
  )
}

function formatIso(iso?: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString()
}

export default function WorkerDashboard() {
  const { user: authUser } = useAuth()
  const user: SessionUser = useMemo(
    () => ({
      id: authUser?.id ?? 'temp',
      role: 'worker',
      name: (authUser?.user_metadata?.name as string | undefined) ?? authUser?.email ?? 'Worker',
    }),
    [authUser?.email, authUser?.id, authUser?.user_metadata],
  )
  const { db, loading, error } = useDB()
  const [activeTab, setActiveTab] = useState<'browse' | 'assigned' | 'completed' | 'actions' | 'profile'>('browse')
  const [browseCategory, setBrowseCategory] = useState<ServiceCategory | 'All'>('All')
  const [browseQuery, setBrowseQuery] = useState('')

  const myAssigned = useMemo(() => {
    return db.requests.filter((r) => r.acceptedWorkerId === user.id)
  }, [db.requests, user.id])

  const myActiveAssigned = useMemo(() => {
    return myAssigned.filter((r) => r.status !== 'completed')
  }, [myAssigned])

  const myCompletedAssigned = useMemo(() => {
    return myAssigned.filter((r) => r.status === 'completed')
  }, [myAssigned])

  const needsMyAction = useMemo(() => {
    return myAssigned.filter((r) =>
      [
        'inspection_pending_worker_proposal',
        'inspection_scheduled',
        'awaiting_quote',
        'work_pending_worker_schedule',
        'work_scheduled',
        'payment_pending',
      ].includes(r.status),
    )
  }, [myAssigned])

  const openRequests = useMemo(() => {
    const q = browseQuery.trim().toLowerCase()
    return db.requests
      .filter((r) => r.status === 'open')
      .filter((r) => (browseCategory === 'All' ? true : r.category === browseCategory))
      .filter((r) => {
        if (!q) return true
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
        )
      })
      .slice()
      .sort((a, b) => {
        const bIso = (b.createdAt ?? (b as any).created_at) as string | undefined
        const aIso = (a.createdAt ?? (a as any).created_at) as string | undefined
        return new Date(bIso ?? 0).getTime() - new Date(aIso ?? 0).getTime()
      })
  }, [db.requests, browseCategory, browseQuery])

  const worker = useMemo(() => db.workers.find((w) => w.id === user.id), [db.workers, user.id])

  if (loading) return <div className="text-white">Loading...</div>
  if (error) return <div className="text-white">{error}</div>

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="text-sm font-semibold">Worker Dashboard</div>
        {worker ? (
          <div className="mt-1 text-xs text-white/60">
            Your categories: {worker.categories.join(', ')} • Rating: {worker.ratingAvg.toFixed(1)} ({worker.ratingCount})
          </div>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              activeTab === 'browse'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Requests ({openRequests.length})
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              activeTab === 'assigned'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('assigned')}
          >
            My Jobs ({myActiveAssigned.length})
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              activeTab === 'completed'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({myCompletedAssigned.length})
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              activeTab === 'actions'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('actions')}
          >
            Needs Action ({needsMyAction.length})
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              activeTab === 'profile'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-white/70">Category</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white"
                  value={browseCategory}
                  onChange={(e) => setBrowseCategory(e.target.value as ServiceCategory | 'All')}
                >
                  {(
                    [
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
                    ] as const
                  ).map((c) => (
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
                  value={browseQuery}
                  onChange={(e) => setBrowseQuery(e.target.value)}
                  placeholder="Title, description, location"
                />
              </div>
            </div>

            <div className="mt-3 text-xs text-white/60">
              Note: you can accept any job. Categories/skills are used only for recommendations.
            </div>
          </div>

          {openRequests.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
              No open requests.
            </div>
          ) : (
            openRequests.map((r) => (
              <OpenRequestCard key={r.id} req={r} workerId={user.id} recommended={!!worker?.categories.includes(r.category)} />
            ))
          )}
        </div>
      ) : null}

      {activeTab === 'assigned' ? (
        <div className="grid gap-3">
          {myActiveAssigned.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
              No assigned jobs yet.
            </div>
          ) : (
            myActiveAssigned.map((r) => <WorkerJobCard key={r.id} req={r} />)
          )}
        </div>
      ) : null}

      {activeTab === 'completed' ? (
        <div className="grid gap-3">
          {myCompletedAssigned.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
              No completed jobs yet.
            </div>
          ) : (
            myCompletedAssigned.map((r) => <WorkerJobCard key={r.id} req={r} />)
          )}
        </div>
      ) : null}

      {activeTab === 'actions' ? (
        <div className="grid gap-3">
          {needsMyAction.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
              Nothing pending right now.
            </div>
          ) : (
            needsMyAction.map((r) => (
              <WorkerActionCard key={r.id} req={r} workerId={user.id} />
            ))
          )}
        </div>
      ) : null}

      {activeTab === 'profile' ? <WorkerProfileForm user={user} /> : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
        Tip: after you accept, ask the Customer to confirm to continue.
      </div>
    </div>
  )
}

function CardShell({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">{children}</div>
}

function WorkerJobCard({ req }: { req: ServiceRequest }) {
  const { db } = useDB()
  const customer = useMemo(() => db.customers.find((c) => c.id === req.customerId), [db.customers, req.customerId])

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

      {customer && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="text-sm font-semibold text-white/80">Customer</div>
          <div className="mt-1 text-sm">{customer.name}</div>
          <div className="mt-2 grid gap-1 text-xs text-white/70 md:grid-cols-2">
            <div>Phone: {customer.phone ?? '-'}</div>
            <div>Email: {customer.email ?? '-'}</div>
          </div>
        </div>
      )}

      <div className="mt-3 grid gap-2 text-xs text-white/70 md:grid-cols-2">
        <div>Inspection: {formatIso(req.inspection?.scheduledFor)}</div>
        <div>Quote: {req.quote?.amount ? `MVR ${req.quote.amount}` : '-'}</div>
        <div>Work: {formatIso(req.work?.scheduledFor)}</div>
        <div>Payment: {req.payment?.status ?? '-'}</div>
      </div>
    </CardShell>
  )
}

function WorkerActionCard({ req, workerId }: { req: ServiceRequest; workerId: string }) {
  const [when, setWhen] = useState(() => new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16))
  const [amount, setAmount] = useState(1500)
  const [notes, setNotes] = useState('')
  const { db } = useDB()
  const customer = useMemo(() => db.customers.find((c) => c.id === req.customerId), [db.customers, req.customerId])

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

      {customer && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="text-sm font-semibold text-white/80">Customer</div>
          <div className="mt-1 text-sm">{customer.name}</div>
          <div className="mt-2 grid gap-1 text-xs text-white/70 md:grid-cols-2">
            <div>Phone: {customer.phone ?? '-'}</div>
            <div>Email: {customer.email ?? '-'}</div>
          </div>
        </div>
      )}

      {req.status === 'inspection_pending_worker_proposal' ? (
        <div className="mt-4 grid gap-2">
          <label className="text-xs text-white/70">Propose inspection date/time</label>
          <input
            type="datetime-local"
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
          <button
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
            onClick={() => proposeInspection({ requestId: req.id, workerId, whenIso: new Date(when).toISOString() })}
          >
            Propose Inspection
          </button>
        </div>
      ) : null}

      {req.status === 'inspection_scheduled' ? (
        <button
          className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
          onClick={() => workerCompleteInspection({ requestId: req.id, workerId })}
        >
          Mark Inspection Completed
        </button>
      ) : null}

      {req.status === 'awaiting_quote' ? (
        <div className="mt-4 grid gap-2">
          <label className="text-xs text-white/70">Quote amount (MVR)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={0}
          />
          <label className="text-xs text-white/70">Notes (optional)</label>
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
            onClick={() => submitQuote({ requestId: req.id, workerId, amount, notes })}
          >
            Submit Quote
          </button>
        </div>
      ) : null}

      {req.status === 'work_pending_worker_schedule' ? (
        <div className="mt-4 grid gap-2">
          <label className="text-xs text-white/70">Schedule work date/time</label>
          <input
            type="datetime-local"
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
          <button
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
            onClick={() => scheduleWork({ requestId: req.id, workerId, whenIso: new Date(when).toISOString() })}
          >
            Schedule Work
          </button>
        </div>
      ) : null}

      {req.status === 'work_scheduled' ? (
        <button
          className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto"
          onClick={() => workerCompleteWork({ requestId: req.id, workerId })}
        >
          Mark Work Completed
        </button>
      ) : null}

      {req.status === 'payment_pending' ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            onClick={() => markPayment({ requestId: req.id, workerId, status: 'pending' })}
          >
            Keep Pending
          </button>
          <button
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
            onClick={() => markPayment({ requestId: req.id, workerId, status: 'paid' })}
          >
            Mark Paid (Complete)
          </button>
        </div>
      ) : null}
    </CardShell>
  )
}
