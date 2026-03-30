import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUSES = ['applied','test','interview','offer','rejected','withdrawn']
const SOURCES = ['LinkedIn','Naukri','Indeed','Company Website','Referral','Internshala','Other']

export default function EditJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(null)

  useEffect(() => {
    api.get('/jobs').then(res => {
      const job = res.data.find(j => j.id === id)
      if (job) setForm(job)
      else { toast.error('Job not found'); navigate('/dashboard') }
    })
  }, [id])

  const set = (field, val) => setForm(f => ({...f, [field]: val}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/jobs/${id}`, form)
      toast.success('Application updated!')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  if (!form) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="text-center py-20 text-gray-400">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Edit Application</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
              <input required value={form.company_name} onChange={e=>set('company_name',e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Applied For *</label>
              <input required value={form.role_applied} onChange={e=>set('role_applied',e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Applied</label>
              <input type="date" value={form.date_applied?.split('T')[0] || ''} onChange={e=>set('date_applied',e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={e=>set('status',e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white capitalize">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Date</label>
              <input type="date" value={form.test_date?.split('T')[0] || ''} onChange={e=>set('test_date',e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Source</label>
              <select value={form.source || ''} onChange={e=>set('source',e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                <option value="">Select source</option>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Description</label>
            <textarea value={form.job_description || ''} onChange={e=>set('job_description',e.target.value)} rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea value={form.notes || ''} onChange={e=>set('notes',e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/dashboard')}
              className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Update Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}