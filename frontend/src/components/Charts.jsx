import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { formatMoney } from '../utils';

const ACCENT = '#5ec8ff';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-xl px-3 py-2 text-sm">
      <p className="text-zinc-500 text-xs">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.name === 'earnings' ? formatMoney(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export function EarningsChart({ data }) {
  if (!data?.length) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
        Немає даних для графіка
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    date: d.date?.slice(5) || d.date,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="earnings"
          name="earnings"
          stroke={ACCENT}
          fill="url(#earningsGrad)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SubscribersChart({ data }) {
  if (!data?.length) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
        Немає даних
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    date: d.date?.slice(5) || d.date,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={formatted} barGap={2}>
        <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="joins" name="Вхід" fill="#34d399" radius={[4, 4, 0, 0]} />
        <Bar dataKey="leaves" name="Вихід" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
