export default function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase().replace(/\s+/g, '_')
  const styles: Record<string, string> = {
    'OPEN': 'badge badge-open',
    'IN_PROGRESS': 'badge badge-progress',
    'WAITING_FOR_CUSTOMER': 'badge badge-progress',
    'RESOLVED': 'badge badge-closed',
    'CLOSED': 'badge badge-closed',
  }

  const labels: Record<string, string> = {
    'OPEN': 'Open',
    'IN_PROGRESS': 'In Progress',
    'WAITING_FOR_CUSTOMER': 'Awaiting Customer',
    'RESOLVED': 'Resolved',
    'CLOSED': 'Closed',
  }

  return (
    <span className={styles[normalized] ?? 'badge'}>
      {labels[normalized] ?? status}
    </span>
  )
}
