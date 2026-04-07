import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../utils/api'
import { getToken } from '../utils/auth'
import toast from 'react-hot-toast'

const STATUSES = ['applied','test','interview','offer','rejected','withdrawn']
const SOURCES = ['LinkedIn','Naukri','Indeed','Company Website','Referral','Internshala','Other']

export default function EditJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)

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
      const formData = new FormData()
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== '') {
          formData.append(key, val)
        }
      })
      if (resumeFile) formData.append('resume', resumeFile)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success('Application updated!')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  if (!form) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-400">Loading...</div>
    </div>
  )

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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Test Date <span className="text-gray-400 font-normal">(optional)</span>
              </label>
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

          {/* Resume upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Resume <span className="text-gray-400 font-normal">(upload new to replace existing)</span>
            </label>
            {form.resume_filename && !resumeFile && (
              <div className="flex items-center gap-2 mb-2 p-3 bg-indigo-50 rounded-xl">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">PDF</span>
                <span className="text-sm text-gray-700">{form.resume_filename}</span>
                <a href={form.resume_url} target="_blank" rel="noreferrer"
                  className="text-indigo-600 text-sm underline ml-auto">View</a>
              </div>
            )}
            <div className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
              resumeFile ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
            }`}>
              {resumeFile ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium">PDF</span>
                  <span className="text-sm text-gray-700">{resumeFile.name}</span>
                  <button type="button" onClick={() => setResumeFile(null)}
                    className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Click to upload a new resume PDF</p>
              )}
              <input type="file" accept=".pdf"
                onChange={e => setResumeFile(e.target.files[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={resumeFile ? {display:'none'} : {position:'absolute',inset:0,width:'100%',height:'100%',opacity:0,cursor:'pointer'}} />
            </div>
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