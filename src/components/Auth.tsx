import { useMemo, useState } from 'react'
import type { SessionUser } from '../lib/types'
import { useDBSnapshot } from '../lib/hooks'

export default function Auth({ onLogin }: { onLogin: (u: SessionUser) => void }) {
  const db = useDBSnapshot()
  const [role, setRole] = useState<'customer' | 'worker' | 'admin'>('customer')

  const options = useMemo(() => {
    if (role === 'customer') return db.customers.filter((c) => c.active)
    if (role === 'worker') return db.workers.filter((w) => w.active)
    return db.admins.filter((a) => a.active)
  }, [db.admins, db.customers, db.workers, role])

  const [selectedId, setSelectedId] = useState<string>(() => options[0]?.id ?? '')

  const selected = options.find((o) => o.id === selectedId)

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="rounded-2xl border border-white/10 bg-white/20 p-5 text-white shadow">
        <div className="mb-4">
          <div className="text-lg font-semibold">Sign in (demo)</div>
          <div className="mt-1 text-xs text-white/60">
            Choose a role and profile. Data is stored in your browser LocalStorage.
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              role === 'customer'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 bg-transparent hover:bg-white/5'
            }`}
            onClick={() => {
              setRole('customer')
              const first = db.customers[0]
              setSelectedId(first?.id ?? '')
            }}
          >
            Customer
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              role === 'worker'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 bg-transparent hover:bg-white/5'
            }`}
            onClick={() => {
              setRole('worker')
              const first = db.workers[0]
              setSelectedId(first?.id ?? '')
            }}
          >
            Worker
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              role === 'admin'
                ? 'border-white/20 bg-white/10'
                : 'border-white/10 bg-transparent hover:bg-white/5'
            }`}
            onClick={() => {
              setRole('admin')
              const first = db.admins[0]
              setSelectedId(first?.id ?? '')
            }}
          >
            Admin
          </button>
        </div>

        <label className="mb-2 block text-xs text-white/70">Profile</label>
        <select
          className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>

        <button
          className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
          disabled={!selected}
          onClick={() => {
            if (!selected) return
            onLogin({
              id: selected.id,
              role,
              name: selected.name,
            })
          }}
        >
          Continue
        </button>

        <div className="mt-4 text-xs text-white/60">
          Demo emails:
          <div className="mt-1">customer@demo.com</div>
          <div>worker@demo.com</div>
          <div>admin@demo.com</div>
        </div>
      </div>
    </div>
  )
}
