import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [jobForm, setJobForm] = useState({ job_title: '', company: '', job_link: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('users')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [usersRes, pendingRes, jobsRes] = await Promise.all([
      api.get('/admin/users'),
      api.get('/auth/pending-users'),
      api.get('/admin/jobs'),
    ])
    setUsers(usersRes.data)
    setPendingUsers(pendingRes.data)
    setJobs(jobsRes.data)
  }

  const approveUser = async (userId) => {
    try {
      await api.patch(`/auth/approve/${userId}`)
      toast.success('User approved!')
      fetchData()
    } catch {
      toast.error('Failed to approve')
    }
  }

  const postJob = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/jobs', jobForm)
      toast.success('Job posted!')
      setJobForm({ job_title: '', company: '', job_link: '', description: '' })
      fetchData()
    } catch {
      toast.error('Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'users', label: `Users (${users.length})` },
            { key: 'pending', label: `Pending Approval (${pendingUsers.length})` },
            { key: 'post', label: 'Post a Job' },
            { key: 'jobs', label: `Posted Jobs (${jobs.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name','Email','Role','Status','Joined'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{u.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{u.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pending tab */}
        {tab === 'pending' && (
          <div className="space-y-3">
            {pendingUsers.length === 0 ? (
              <p className="text-gray-400 text-center py-16">No pending users</p>
            ) : pendingUsers.map(u => (
              <div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Registered {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => approveUser(u.id)}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Post job tab */}
        {tab === 'post' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={postJob} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
                  <input required value={jobForm.job_title} onChange={e=>setJobForm({...jobForm,job_title:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="e.g. Software Engineer Intern" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company *</label>
                  <input required value={jobForm.company} onChange={e=>setJobForm({...jobForm,company:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="e.g. Microsoft" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Link *</label>
                <input required type="url" value={jobForm.job_link} onChange={e=>setJobForm({...jobForm,job_link:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={jobForm.description} onChange={e=>setJobForm({...jobForm,description:e.target.value})} rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  placeholder="Brief description or requirements..." />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
                {loading ? 'Posting...' : 'Post Job to Group'}
              </button>
            </form>
          </div>
        )}

        {/* Posted jobs tab */}
        {tab === 'jobs' && (
          <div className="space-y-3">
            {jobs.map(j => (
              <div key={j.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{j.job_title}</p>
                    <p className="text-sm text-indigo-600">{j.company}</p>
                    {j.description && <p className="text-sm text-gray-500 mt-1">{j.description}</p>}
                  </div>
                  <a href={j.job_link} target="_blank" rel="noreferrer"
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors ml-4 whitespace-nowrap">
                    View Job
                  </a>
                </div>
                <p className="text-xs text-gray-400 mt-2">Posted {new Date(j.posted_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}