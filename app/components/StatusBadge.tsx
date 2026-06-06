export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Open':        'badge badge-open',
    'In Progress': 'badge badge-progress',
    'Closed':      'badge badge-closed',
  }
  return <span className={map[status] ?? 'badge'}>{status}</span>
}
