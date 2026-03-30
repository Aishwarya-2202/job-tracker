import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Navbar from '../components/Navbar'
import JobCard from '../components/JobCard'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  applied: '#6366f1', test: '#f59e0b', interview: '#8b5cf6',
  offer: '#10b981', rejected: '#ef4444', withdrawn: '#9ca3af'
}

export default function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs')
      setJobs(res.data)
    } catch {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id) => setJobs(jobs.filter(j => j.id !== id))

  const filtered = jobs.filter(j => {
    const matchFilter = filter === 'all' || j.status === filter
    const matchSearch = j.company_name.toLowerCase().includes(search.toLowerCase()) ||
                        j.role_applied.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  // Analytics data for chart
  const statusCounts = ['applied','test','interview','offer','rejected','withdrawn'].map(s => ({
    name: s,
    value: jobs.filter(j => j.status === s).length
  })).filter(s => s.value > 0)

  // Upcoming tests/deadlines
  const upcoming = jobs
    .filter(j => j.test_date && new Date(j.test_date) >= new Date())
    .sort((a, b) => new Date(a.test_date) - new Date(b.test_date))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applied', value: jobs.length, color: 'text-indigo-600' },
            { label: 'Interviews', value: jobs.filter(j=>j.status==='interview').length, color: 'text-purple-600' },
            { label: 'Offers', value: jobs.filter(j=>j.status==='offer').length, color: 'text-green-600' },
            { label: 'Pending Tests', value: upcoming.length, color: 'text-amber-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Pie chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-4">Status breakdown</h2>
            {statusCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusCounts} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name}) => name}>
                    {statusCounts.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">No applications yet</p>
            )}
          </div>

          {/* Upcoming tests */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-4">Upcoming tests / deadlines</h2>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map(j => (
                  <div key={j.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{j.company_name}</p>
                      <p className="text-xs text-gray-500">{j.role_applied}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                      {new Date(j.test_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">No upcoming tests</p>
            )}
          </div>

          {/* Quick add button -->*/}
          <div className="bg-indigo-600 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="font-semibold text-white text-lg mb-2">Track a new application</h2>
              <p className="text-indigo-200 text-sm">Add every job you apply to — never lose track again.</p>
            </div>
            <button
              onClick={() => navigate('/add-job')}
              className="mt-6 bg-white text-indigo-600 font-semibold py-3 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              + Add Application
            </button>
          </div>
        </div>

        {/* Filter + search bar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <input
            type="text"
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-64"
          />
          <div className="flex gap-2 flex-wrap">
            {['all','applied','test','interview','offer','rejected','withdrawn'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  filter === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Job cards grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading your applications...</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(job => (
              <JobCard key={job.id} job={job} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            {search || filter !== 'all' ? 'No applications match your filter.' : 'No applications yet. Add your first one!'}
          </div>
        )}
      </div>
    </div>
  )
}