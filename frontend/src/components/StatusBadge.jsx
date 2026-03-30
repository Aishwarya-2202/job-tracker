const colors = {
  applied:    'bg-blue-100 text-blue-700',
  test:       'bg-yellow-100 text-yellow-700',
  interview:  'bg-purple-100 text-purple-700',
  offer:      'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-700',
  withdrawn:  'bg-gray-100 text-gray-600',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${colors[status] || colors.applied}`}>
      {status}
    </span>
  )
}