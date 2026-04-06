import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getToken } from '../utils/auth'
import toast from 'react-hot-toast'

const STATUSES = ['applied','test','interview','offer','rejected','withdrawn']
const SOURCES = ['LinkedIn','Naukri','Indeed','Company Website','Referral','Internshala','Other']

export default function AddJob() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [form, setForm] = useState({
    company_name: '', role_applied: '', date_applied: '',
    status: 'applied', job_description: '', test_date: '',
    source: '', notes: ''
  })

  const set = (field, val) => setForm(f => ({...f, [field]: val}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Use FormData instead of JSON so we can send the PDF file
      const formData = new FormData()
      Object.entries(form).forEach(([key, val]) => {
        if (val) formData.append(key, val)
      })
      if (resumeFile) formData.append('resume', resumeFile)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success('Application added!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Add Job Application</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
              <input required value={form.company_name} onChange={e=>set('company_name',e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g. Google" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Applied For *</label>
              <input required value={form.role_applied} onChange={e=>set('role_applied',e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g. Software Engineer Intern" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Applied</label>
              <input type="date" value={form.date_applied} onChange={e=>set('date_applied',e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Date (if any)</label>
              <input type="date" value={form.test_date} onChange={e=>set('test_date',e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Source</label>
              <select value={form.source} onChange={e=>set('source',e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                <option value="">Select source</option>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Description</label>
            <textarea value={form.job_description} onChange={e=>set('job_description',e.target.value)} rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              placeholder="Paste the job description here..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              placeholder="Any personal notes, interview tips, contacts..." />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Resume (PDF only, max 5MB)</label>
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              resumeFile ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
            }`}>
              {resumeFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium">
                    PDF
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{resumeFile.name}</span>
                  <button type="button" onClick={() => setResumeFile(null)}
                    className="text-red-400 hover:text-red-600 text-sm ml-2">
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Drop your resume here or click to browse</p>
                  <p className="text-gray-300 text-xs">PDF files only</p>
                </div>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={e => setResumeFile(e.target.files[0] || null)}
                className={resumeFile ? 'hidden' : 'absolute inset-0 w-full h-full opacity-0 cursor-pointer'}
                style={resumeFile ? {} : {position:'absolute',inset:0,width:'100%',height:'100%',opacity:0,cursor:'pointer'}}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/dashboard')}
              className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}