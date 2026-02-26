import { useMemo, useState } from 'react'
import {
  adminResetPassword,
  createCustomer,
  createWorker,
  deleteCustomer,
  deleteWorker,
  setCustomerActive,
  setWorkerActive,
  updateCustomer,
  updateWorker,
} from '../lib/supabaseMutations'
import { useDB } from '../lib/supabaseData'
import WorkerProfileModal from './WorkerProfileModal'
import type { CustomerProfile, SessionUser, ServiceRequest, WorkerProfile } from '../lib/types'
import { useAuth } from '../contexts/AuthContext'

function statusLabel(s: string) {
  return s.replace(/_/g, ' ')
}

function formatIso(iso?: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString()
}

export default function AdminDashboard() {
  const { user: authUser } = useAuth()
  const user: SessionUser = useMemo(
    () => ({
      id: authUser?.id ?? 'temp',
      role: 'admin',
      name: (authUser?.user_metadata?.name as string | undefined) ?? authUser?.email ?? 'Admin',
    }),
    [authUser?.email, authUser?.id, authUser?.user_metadata],
  )
  const { db, loading, error } = useDB()
  const [tab, setTab] = useState<'customers' | 'workers' | 'works'>('customers')
  const [profileModalWorkerId, setProfileModalWorkerId] = useState<string | null>(null)

  if (loading) return <div className="text-white">Loading...</div>
  if (error) return <div className="text-white">{error}</div>

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="text-sm font-semibold">Administrator Dashboard</div>
        <div className="mt-1 text-xs text-white/60">Signed in as {user.name}</div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              tab === 'customers' ? 'border-white/20 bg-white/10' : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setTab('customers')}
          >
            Customers ({db.customers.length})
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              tab === 'workers' ? 'border-white/20 bg-white/10' : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setTab('workers')}
          >
            Workers ({db.workers.length})
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              tab === 'works' ? 'border-white/20 bg-white/10' : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setTab('works')}
          >
            Works ({db.requests.length})
          </button>
        </div>
      </div>

      {tab === 'customers' ? <CustomersAdmin /> : null}
      {tab === 'workers' ? <WorkersAdmin onShowProfile={setProfileModalWorkerId} /> : null}
      {tab === 'works' ? <WorksAdmin /> : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
        Tip: Deactivated users will disappear from the sign-in list.
      </div>

      {profileModalWorkerId && <WorkerProfileModal workerId={profileModalWorkerId} onClose={() => setProfileModalWorkerId(null)} />}
    </div>
  )
}

function WorksAdmin() {
  const { db } = useDB()
  const [subTab, setSubTab] = useState<'pending' | 'completed'>('pending')
  const [query, setQuery] = useState('')

  const customerById = useMemo(() => {
    return new Map(db.customers.map((c) => [c.id, c]))
  }, [db.customers])

  const workerById = useMemo(() => {
    return new Map(db.workers.map((w) => [w.id, w]))
  }, [db.workers])

  const pending = useMemo(() => {
    return db.requests.filter((r) => r.status !== 'completed')
  }, [db.requests])

  const completed = useMemo(() => {
    return db.requests.filter((r) => r.status === 'completed')
  }, [db.requests])

  const items = subTab === 'pending' ? pending : completed

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((r) => {
      const customer = customerById.get(r.customerId)
      const worker = r.acceptedWorkerId ? workerById.get(r.acceptedWorkerId) : undefined
      return (
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        (customer?.name ?? '').toLowerCase().includes(q) ||
        (customer?.email ?? '').toLowerCase().includes(q) ||
        (worker?.name ?? '').toLowerCase().includes(q) ||
        (worker?.email ?? '').toLowerCase().includes(q)
      )
    })
  }, [customerById, items, query, workerById])

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold">Works</div>
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm sm:w-72"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by job/customer/worker"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              subTab === 'pending' ? 'border-white/20 bg-white/10' : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setSubTab('pending')}
          >
            Pending ({pending.length})
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              subTab === 'completed' ? 'border-white/20 bg-white/10' : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => setSubTab('completed')}
          >
            Completed ({completed.length})
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">No works found.</div>
        ) : (
          filtered.map((r) => (
            <WorkRow key={r.id} r={r} customer={customerById.get(r.customerId)} worker={r.acceptedWorkerId ? workerById.get(r.acceptedWorkerId) : undefined} />
          ))
        )}
      </div>
    </div>
  )
}

function WorkRow({
  r,
  customer,
  worker,
}: {
  r: ServiceRequest
  customer?: CustomerProfile
  worker?: WorkerProfile
}) {
  const interestedCount = Array.isArray(r.interestedWorkerIds) ? r.interestedWorkerIds.length : 0
  const offersCount = Array.isArray(r.quoteOffers) ? r.quoteOffers.length : 0

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {r.title}{' '}
            <span className="text-xs font-normal text-white/60">({r.id})</span>
          </div>
          <div className="mt-1 text-xs text-white/60">
            {r.category} • {statusLabel(r.status)} • Created {formatIso(r.createdAt)}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-xs text-white/70">
          Interested: {interestedCount} • Offers: {offersCount}
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="text-xs text-white/60">Customer</div>
          <div className="mt-1 text-sm">{customer ? customer.name : 'Unknown customer'}</div>
          <div className="mt-1 text-xs text-white/60">{customer ? customer.email : r.customerId}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="text-xs text-white/60">Worker</div>
          <div className="mt-1 text-sm">{worker ? worker.name : r.acceptedWorkerId ? 'Unknown worker' : 'Not selected yet'}</div>
          <div className="mt-1 text-xs text-white/60">{worker ? worker.email ?? '—' : r.acceptedWorkerId ?? '—'}</div>
        </div>
      </div>
    </div>
  )
}

function CustomersAdmin() {
  const { db } = useDB()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return db.customers
    return db.customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? '').toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      )
    })
  }, [db.customers, query])

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="text-sm font-semibold">Create Customer</div>
        <form
          className="mt-3 grid gap-3 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault()
            createCustomer({
              name: name.trim() || 'New Customer',
              email: email.trim() || 'customer@example.com',
              password: password || 'ChangeMe@123',
              phone: phone.trim() || undefined,
            })
            setName('')
            setEmail('')
            setPassword('')
            setPhone('')
          }}
        >
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temp Password"
            type="password"
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
          />
          <button className="md:col-span-3 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto">
            Create
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold">Customers</div>
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm sm:w-72"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
          />
        </div>

        <div className="mt-3 grid gap-2">
          {filtered.map((c) => (
            <CustomerRow key={c.id} c={c} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CustomerRow({ c }: { c: CustomerProfile }) {
  const [name, setName] = useState(c.name)
  const [email, setEmail] = useState(c.email)
  const [phone, setPhone] = useState(c.phone ?? '')

  return (
    <div className="grid gap-2 rounded-xl border border-white/10 bg-black/10 p-3 md:grid-cols-12 md:items-center">
      <div className="md:col-span-3">
        <div className="text-xs text-white/60">ID</div>
        <div className="text-sm">{c.id}</div>
      </div>

      <div className="md:col-span-3">
        <div className="text-xs text-white/60">Name</div>
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="md:col-span-3">
        <div className="text-xs text-white/60">Email</div>
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <div className="text-xs text-white/60">Phone</div>
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="md:col-span-1 flex flex-col gap-2">
        <button
          className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
          onClick={() => updateCustomer({ customerId: c.id, patch: { name: name.trim() || c.name, email: email.trim() || c.email, phone: phone.trim() || undefined } })}
        >
          Save
        </button>
        <button
          className={`w-full rounded-xl border px-3 py-2 text-sm ${
            c.active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          }`}
          onClick={() => setCustomerActive({ customerId: c.id, active: !c.active })}
        >
          {c.active ? 'Active' : 'Inactive'}
        </button>
        <button
          className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20"
          onClick={() => deleteCustomer({ customerId: c.id })}
        >
          Delete
        </button>
        <button
          className="w-full rounded-xl border border-white/10 bg-white/20 px-3 py-2 text-sm text-white hover:bg-white/30"
          onClick={() => {
            const next = window.prompt('Set new password for this customer')
            if (!next) return
            void adminResetPassword({ userId: c.id, password: next })
          }}
        >
          Reset Password
        </button>
      </div>
    </div>
  )
}

function WorkersAdmin({ onShowProfile }: { onShowProfile: (id: string) => void }) {
  const { db } = useDB()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return db.workers
    return db.workers.filter((w) => {
      return (
        w.name.toLowerCase().includes(q) ||
        (w.email ?? '').toLowerCase().includes(q) ||
        (w.phone ?? '').toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q)
      )
    })
  }, [db.workers, query])

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="text-sm font-semibold">Create Worker</div>
        <form
          className="mt-3 grid gap-3 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault()
            createWorker({
              name: name.trim() || 'New Worker',
              email: email.trim() || 'worker@example.com',
              password: password || 'ChangeMe@123',
              phone: phone.trim() || undefined,
            })
            setName('')
            setEmail('')
            setPassword('')
            setPhone('')
          }}
        >
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temp Password"
            type="password"
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
          />
          <button className="md:col-span-3 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto">
            Create
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold">Workers</div>
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm sm:w-72"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
          />
        </div>

        <div className="mt-3 grid gap-2">
          {filtered.map((w) => (
            <WorkerRow key={w.id} w={w} onShowProfile={onShowProfile} />
          ))}
        </div>
      </div>
    </div>
  )
}

function WorkerRow({ w, onShowProfile }: { w: WorkerProfile; onShowProfile: (id: string) => void }) {
  const [name, setName] = useState(w.name)
  const [email, setEmail] = useState(w.email ?? '')
  const [phone, setPhone] = useState(w.phone ?? '')

  return (
    <div className="grid gap-2 rounded-xl border border-white/10 bg-black/10 p-3 md:grid-cols-12 md:items-center">
      <div className="md:col-span-3">
        <div className="text-xs text-white/60">ID</div>
        <div className="text-sm">{w.id}</div>
        <div className="mt-1 text-xs text-white/60">Rating: {w.ratingAvg.toFixed(1)} ({w.ratingCount})</div>
      </div>

      <div className="md:col-span-3">
        <div className="text-xs text-white/60">Name</div>
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="md:col-span-3">
        <div className="text-xs text-white/60">Email</div>
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <div className="text-xs text-white/60">Phone</div>
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="md:col-span-1 flex flex-col gap-2">
        <button
          className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
          onClick={() => updateWorker({ workerId: w.id, patch: { name: name.trim() || w.name, email: email.trim() || undefined, phone: phone.trim() || undefined } })}
        >
          Save
        </button>
        <button
          className={`w-full rounded-xl border px-3 py-2 text-sm ${
            w.active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          }`}
          onClick={() => setWorkerActive({ workerId: w.id, active: !w.active })}
        >
          {w.active ? 'Active' : 'Inactive'}
        </button>
        <button
          className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
          onClick={() => onShowProfile(w.id)}
        >
          View full profile
        </button>
        <button
          className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20"
          onClick={() => deleteWorker({ workerId: w.id })}
        >
          Delete
        </button>
        <button
          className="w-full rounded-xl border border-white/10 bg-white/20 px-3 py-2 text-sm text-white hover:bg-white/30"
          onClick={() => {
            const next = window.prompt('Set new password for this worker')
            if (!next) return
            void adminResetPassword({ userId: w.id, password: next })
          }}
        >
          Reset Password
        </button>
      </div>
    </div>
  )
}
