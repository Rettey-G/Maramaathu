import { useMemo } from 'react'
import { useDB } from '../lib/supabaseData'

export default function WorkerProfileModal({ workerId, onClose }: { workerId: string; onClose: () => void }) {
  const { db, loading, error } = useDB()
  const worker = useMemo(() => db.workers.find((w) => w.id === workerId), [db.workers, workerId])
  const reviews = useMemo(() => db.reviews.filter((r) => r.workerId === workerId), [db.reviews, workerId])

  if (loading) return null
  if (error) return null

  if (!worker) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-white max-w-md w-full">
          <div className="text-sm font-semibold">Worker not found</div>
          <button className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-4 overflow-y-auto">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-white max-w-2xl w-full">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {worker.promoPosterUrl && (
              <img src={worker.promoPosterUrl} alt="Promo" className="h-20 w-20 rounded-xl border border-white/10 object-cover" />
            )}
            <div>
              <div className="text-lg font-semibold">{worker.name}</div>
              <div className="mt-1 text-xs text-white/60">
                Rating: {worker.ratingAvg.toFixed(1)} ({worker.ratingCount} reviews) • Jobs done: {worker.jobsDone}
              </div>
              <div className={`mt-1 text-xs ${worker.active ? 'text-emerald-300' : 'text-amber-300'}`}>
                {worker.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
          <button className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
            <div className="text-sm font-semibold text-white/80">Contact</div>
            <div className="mt-2 space-y-1 text-sm">
              <div>Email: {worker.email || '—'}</div>
              <div>Phone: {worker.phone || '—'}</div>
              <div>WhatsApp: {worker.whatsapp || '—'}</div>
              <div>Viber: {worker.viber || '—'}</div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
            <div className="text-sm font-semibold text-white/80">Categories</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {worker.categories.map((cat) => (
                <span key={cat} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border border-white/10 bg-black/10 p-4">
            <div className="text-sm font-semibold text-white/80">Skills</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {worker.skills.map((skill) => (
                <span key={skill} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {worker.about && (
            <div className="md:col-span-2 rounded-xl border border-white/10 bg-black/10 p-4">
              <div className="text-sm font-semibold text-white/80">About</div>
              <div className="mt-2 text-sm whitespace-pre-wrap">{worker.about}</div>
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4">
            <div className="text-sm font-semibold text-white/80">Recent reviews</div>
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {reviews.slice(0, 5).map((rev) => (
                <div key={rev.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/60">Customer {rev.customerId}</div>
                    <div className="text-xs text-yellow-300">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
                  </div>
                  {rev.comment && <div className="mt-1 text-xs">{rev.comment}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
