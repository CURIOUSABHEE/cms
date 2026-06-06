export default function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    'Urgent': 'badge badge-urgent',
    'High':   'badge badge-high',
    'Medium': 'badge badge-medium',
    'Low':    'badge badge-low',
  }
  return <span className={map[priority] ?? 'badge'}>{priority}</span>
}
