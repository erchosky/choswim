import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardChartProps {
  data: Array<{ date: string; meters: number; xp: number }>;
}

export function DashboardChart({ data }: DashboardChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-line))" />
        <XAxis dataKey="date" stroke="rgb(var(--color-muted))" tick={{ fontSize: 12 }} />
        <YAxis stroke="rgb(var(--color-muted))" tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-line))', borderRadius: 8, color: 'rgb(var(--color-text))' }} />
        <Area type="monotone" dataKey="meters" stroke="#22d3ee" fill="#22d3ee33" />
        <Area type="monotone" dataKey="xp" stroke="#34d399" fill="#34d39922" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
