import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Percent, Gift, Wallet, CheckCircle2, Loader2 } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-md shadow-sm border border-white/40">
      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-600">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function CouponRow({ item }) {
  const statusColor = {
    active: 'text-green-600 bg-green-50 border-green-200',
    expired: 'text-red-600 bg-red-50 border-red-200',
    exhausted: 'text-amber-600 bg-amber-50 border-amber-200',
    inactive: 'text-gray-600 bg-gray-50 border-gray-200',
  }[item.status] || 'text-gray-700 bg-gray-50 border-gray-200'

  return (
    <div className="grid grid-cols-12 items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm">
      <div className="col-span-3 font-mono text-sm">{item.code}</div>
      <div className="col-span-2 text-xs"><span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">{item.type}</span></div>
      <div className="col-span-2 font-semibold">{item.type === 'percent' ? `${item.value}%` : `$${item.value}`}</div>
      <div className="col-span-2 text-sm">{item.uses}{item.max_uses ? ` / ${item.max_uses}` : ''}</div>
      <div className="col-span-3">
        <span className={`inline-block text-xs px-2 py-1 rounded border ${statusColor}`}>{item.status}</span>
      </div>
    </div>
  )
}

export default function App() {
  const [list, setList] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [creating, setCreating] = useState(false)
  const [applyState, setApplyState] = useState({ loading: false, result: null, error: null })

  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent',
    value: 10,
    max_uses: '',
    expires_at: '',
    min_order_amount: 0,
    is_active: true,
    notes: ''
  })

  const [applyForm, setApplyForm] = useState({ code: '', amount: 100, user_id: '' })

  const fetchList = async () => {
    try {
      setLoadingList(true)
      const res = await fetch(`${API_BASE}/api/coupons`)
      const data = await res.json()
      setList(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => { fetchList() }, [])

  const createCoupon = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const payload = {
        ...form,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        value: Number(form.value),
        min_order_amount: Number(form.min_order_amount),
      }
      const res = await fetch(`${API_BASE}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(await res.text())
      await fetchList()
      setForm({ code: '', discount_type: 'percent', value: 10, max_uses: '', expires_at: '', min_order_amount: 0, is_active: true, notes: '' })
    } catch (e) {
      alert(`Failed to create coupon: ${e.message}`)
    } finally {
      setCreating(false)
    }
  }

  const applyCoupon = async (e) => {
    e.preventDefault()
    setApplyState({ loading: true, result: null, error: null })
    try {
      const res = await fetch(`${API_BASE}/api/coupons/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: applyForm.code, order_amount: Number(applyForm.amount), user_id: applyForm.user_id || null })
      })
      const data = await res.json()
      if (!res.ok || !data.valid) {
        throw new Error(data.reason || 'Invalid code')
      }
      setApplyState({ loading: false, result: data, error: null })
    } catch (e) {
      setApplyState({ loading: false, result: null, error: e.message })
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#0f172a] via-[#0b1533] to-[#020617] text-white overflow-hidden">
      {/* Hero with Spline */}
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      {/* Gradient overlay to improve contrast, pointer-events-none to keep Spline interactive */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0b1533]/40 to-[#020617]" />

      {/* Content */}
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 sm:px-10 py-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 grid place-items-center">
              <Sparkles className="w-5 h-5 text-blue-300" />
            </div>
            <p className="text-sm sm:text-base text-white/80">Fintech-grade Coupons</p>
          </div>
          <a href="/test" className="text-sm text-white/70 hover:text-white transition">System Check</a>
        </nav>

        {/* Hero */}
        <header className="px-6 sm:px-10 pt-8 pb-16 sm:pb-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Create and Apply Coupons with a Glassmorphic Flair
              </motion.h1>
              <motion.p
                className="text-white/70 text-base sm:text-lg max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                Design promo codes in seconds, track usage, and let your customers enjoy instant savings.
              </motion.p>

              <div className="grid grid-cols-3 gap-4 max-w-lg">
                <Stat icon={Percent} label="Avg. Discount" value="18%" />
                <Stat icon={Gift} label="Coupons" value={list.length} />
                <Stat icon={Wallet} label="Redemptions" value={list.reduce((a,c)=>a+(c.uses||0),0)} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Panels */}
        <main className="px-6 sm:px-10 pb-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create coupon */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Percent className="w-5 h-5 text-blue-300"/>Create a coupon</h2>
              <form onSubmit={createCoupon} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 text-white/80">Code</label>
                  <input value={form.code} onChange={e=>setForm(f=>({...f, code: e.target.value}))} required placeholder="SUMMER25" className="w-full px-3 py-2 rounded-lg bg-white/70 text-gray-900 placeholder:text-gray-500 border border-white/50"/>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-white/80">Type</label>
                  <select value={form.discount_type} onChange={e=>setForm(f=>({...f, discount_type: e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/70 text-gray-900 border border-white/50">
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-white/80">Value</label>
                  <input type="number" step="0.01" value={form.value} onChange={e=>setForm(f=>({...f, value: e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/70 text-gray-900 border border-white/50"/>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-white/80">Max uses</label>
                  <input type="number" value={form.max_uses} onChange={e=>setForm(f=>({...f, max_uses: e.target.value}))} placeholder="Unlimited" className="w-full px-3 py-2 rounded-lg bg-white/70 text-gray-900 border border-white/50"/>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-white/80">Expires at</label>
                  <input type="datetime-local" value={form.expires_at} onChange={e=>setForm(f=>({...f, expires_at: e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/70 text-gray-900 border border-white/50"/>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-white/80">Min order</label>
                  <input type="number" step="0.01" value={form.min_order_amount} onChange={e=>setForm(f=>({...f, min_order_amount: e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/70 text-gray-900 border border-white/50"/>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-white/80">Active</label>
                  <select value={form.is_active ? 'true':'false'} onChange={e=>setForm(f=>({...f, is_active: e.target.value === 'true'}))} className="w-full px-3 py-2 rounded-lg bg-white/70 text-gray-900 border border-white/50">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 text-white/80">Notes</label>
                  <input value={form.notes} onChange={e=>setForm(f=>({...f, notes: e.target.value}))} placeholder="Internal note" className="w-full px-3 py-2 rounded-lg bg-white/70 text-gray-900 border border-white/50"/>
                </div>
                <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                  <button disabled={creating} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600 transition flex items-center gap-2">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
                    {creating ? 'Creating...' : 'Create coupon'}
                  </button>
                </div>
              </form>
            </motion.section>

            {/* Apply coupon */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="rounded-2xl p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-blue-300"/>Try a coupon</h2>
              <form onSubmit={applyCoupon} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 text-white/80">Coupon code</label>
                  <input value={applyForm.code} onChange={e=>setApplyForm(f=>({...f, code: e.target.value}))} placeholder="SUMMER25" className="w-full px-3 py-2 rounded-lg bg-white/70 text-gray-900 border border-white/50"/>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-white/80">Order amount</label>
                  <input type="number" step="0.01" value={applyForm.amount} onChange={e=>setApplyForm(f=>({...f, amount: e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/70 text-gray-900 border border-white/50"/>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-white/80">User ID (optional)</label>
                  <input value={applyForm.user_id} onChange={e=>setApplyForm(f=>({...f, user_id: e.target.value}))} placeholder="user_123" className="w-full px-3 py-2 rounded-lg bg-white/70 text-gray-900 border border-white/50"/>
                </div>
                <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                  <button disabled={applyState.loading} className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:from-emerald-600 hover:to-teal-600 transition flex items-center gap-2">
                    {applyState.loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
                    {applyState.loading ? 'Applying...' : 'Apply coupon'}
                  </button>
                </div>
              </form>

              <AnimatePresence>
                {applyState.result && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 p-4 rounded-xl bg-white/70 border border-white/50 text-gray-900">
                    <p className="font-semibold">Success!</p>
                    <p className="text-sm">Code {applyState.result.code} applied. Discount ${'{'}applyState.result.discount_amount{'}'} → Final ${'{'}applyState.result.final_amount{'}'}</p>
                  </motion.div>
                )}
                {applyState.error && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                    <p className="font-semibold">{applyState.error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* List */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2 rounded-2xl p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2"><Gift className="w-5 h-5 text-blue-300"/>Coupons</h2>
                <button onClick={fetchList} className="text-sm px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition">Refresh</button>
              </div>
              <div className="grid grid-cols-12 text-xs text-white/70 px-4 pb-2">
                <div className="col-span-3">Code</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Value</div>
                <div className="col-span-2">Uses</div>
                <div className="col-span-3">Status</div>
              </div>
              <div className="space-y-2">
                {loadingList ? (
                  <div className="flex items-center gap-2 text-white/80"><Loader2 className="w-4 h-4 animate-spin"/> Loading...</div>
                ) : list.length === 0 ? (
                  <div className="p-6 rounded-xl bg-white/10 border border-white/20 text-white/80">No coupons yet. Create your first one above.</div>
                ) : (
                  list.map(item => <CouponRow key={item.id} item={item} />)
                )}
              </div>
            </motion.section>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 sm:px-10 pb-12 text-white/60 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <p>© {new Date().getFullYear()} Coupon Studio</p>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
