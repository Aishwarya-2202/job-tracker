import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function JobCard({ job, onDelete }) {
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (!window.confirm(`Delete application to ${job.company_name}?`)) return
    try {
      await api.delete(`/jobs/${job.id}`)
      toast.success('Application deleted')
      onDelete(job.id)
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-lg leading-tight">{job.company_name}</h3>
          <p className="text-indigo-600 font-medium text-sm mt-0.5">{job.role_applied}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="space-y-1.5 text-sm text-gray-500 mb-4">
        {job.date_applied && (
          <p>Applied: <span className="text-gray-700">{new Date(job.date_applied).toLocaleDateString()}</span></p>
        )}
        {job.test_date && (
          <p>Test date: <span className="text-amber-600 font-medium">{new Date(job.test_date).toLocaleDateString()}</span></p>
        )}
        {job.source && (
          <p>Source: <span className="text-gray-700">{job.source}</span></p>
        )}
        {job.resume_filename && (
          <p>Resume: <span className="text-gray-700">{job.resume_filename}</span></p>
        )}
      </div>

      {job.notes && (
        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2 mb-4 line-clamp-2">{job.notes}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/edit-job/${job.id}`)}
          className="flex-1 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg transition-colors font-medium"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg transition-colors font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  )
}