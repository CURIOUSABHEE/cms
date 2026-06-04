'use client'

import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const formatted = data.map((d) => ({ ...d, date: d.date.slice(5) }))
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RechartsBar data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip />
        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </RechartsBar>
    </ResponsiveContainer>
  )
}
