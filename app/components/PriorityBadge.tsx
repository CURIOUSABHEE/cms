export default function PriorityBadge({ priority }: { priority: string }) {
  const normalized = priority.toUpperCase()
  const styles: Record<string, string> = {
    'LOW': 'badge badge-low',
    'MEDIUM': 'badge badge-medium',
    'HIGH': 'badge badge-high',
    'CRITICAL': 'badge badge-urgent',
    'URGENT': 'badge badge-urgent', // Fallback for old seed data if any
  }

  const labels: Record<string, string> = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'CRITICAL': 'Critical',
    'URGENT': 'Critical',
  }

  return (
    <span className={styles[normalized] ?? 'badge'}>
      {labels[normalized] ?? priority}
    </span>
  )
}
