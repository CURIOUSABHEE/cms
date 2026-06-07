export default function PriorityBadge({ priority }: { priority: string | null | undefined }) {
  if (!priority) return null
  const normalized = priority.toUpperCase()
  const styles: Record<string, string> = {
    'LOW': 'badge badge-low',
    'MEDIUM': 'badge badge-medium',
    'HIGH': 'badge badge-high',
  }

  const labels: Record<string, string> = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
  }

  const className = styles[normalized]
  if (!className) return null

  return (
    <span className={className}>
      {labels[normalized]}
    </span>
  )
}
