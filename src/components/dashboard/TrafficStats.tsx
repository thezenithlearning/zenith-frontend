'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, Eye, Globe, TrendingDown, TrendingUp, Users } from 'lucide-react';
import {
  useGetTrafficStatsQuery,
  type TrafficRange,
} from '../../features/dashboard/api/dashboardApi';
import { getApiErrorMessage } from '../../lib/apiError';

const nf = (n: number) => n.toLocaleString();

const RANGES: { id: TrafficRange; label: string; hint: string }[] = [
  { id: 'day', label: 'Daily', hint: 'Last 30 days' },
  { id: 'month', label: 'Monthly', hint: 'Last 12 months' },
  { id: 'year', label: 'Yearly', hint: 'Last 5 years' },
];

const formatPeriod = (p: string, range: TrafficRange): string => {
  if (range === 'year') return p;
  if (range === 'month') {
    return new Date(`${p}-01T00:00:00Z`).toLocaleDateString(undefined, {
      month: 'short',
      year: '2-digit',
      timeZone: 'UTC',
    });
  }
  return new Date(`${p}T00:00:00Z`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

const DEVICE_COLORS: Record<string, string> = {
  mobile: '#2563eb',
  desktop: '#16a34a',
  tablet: '#ea580c',
};

export default function TrafficStats() {
  const [range, setRange] = useState<TrafficRange>('day');
  const { data, isLoading, isFetching, error, refetch } = useGetTrafficStatsQuery(range, {
    pollingInterval: 60000,
    refetchOnMountOrArgChange: true,
  });

  const active = RANGES.find((r) => r.id === range)!;

  const todayVsYesterday = (() => {
    if (!data) return null;
    const { today, yesterday } = data.totals;
    if (!yesterday.visitors) return today.visitors ? 100 : 0;
    return Math.round(((today.visitors - yesterday.visitors) / yesterday.visitors) * 100);
  })();

  const kpis = data
    ? [
        { label: 'Unique visitors', value: data.totals.allTime.visitors, sub: `${nf(data.totals.allTime.views)} visits`, icon: Globe, tone: 'bg-blue-50 text-blue-600' },
        { label: 'Today', value: data.totals.today.visitors, sub: `${nf(data.totals.today.views)} visits`, icon: Users, tone: 'bg-green-50 text-green-600', trend: todayVsYesterday },
        { label: 'This month', value: data.totals.thisMonth.visitors, sub: `${nf(data.totals.thisMonth.views)} visits`, icon: Eye, tone: 'bg-purple-50 text-purple-600' },
        { label: 'This year', value: data.totals.thisYear.visitors, sub: `${nf(data.totals.thisYear.views)} visits`, icon: Eye, tone: 'bg-orange-50 text-orange-600' },
      ]
    : [];

  const devices = (data?.devices ?? []).map((d) => ({ name: d.device, value: d.visitors }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Website traffic</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Every visit counts · bots are excluded · unique visitors count once per day
            {data ? ` · ${data.timezone}` : ''}
          </p>
        </div>
        <div className="inline-flex rounded-lg bg-gray-100 p-1 self-start">
          {RANGES.map((r) => (
            <button
              key={r.id}
              id={`dashboard-traffic-range-${r.id}-button`}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                range === r.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
        </div>
      ) : error || !data ? (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700 flex-1">
            {getApiErrorMessage(error, 'Could not load traffic statistics.')}
          </p>
          <button
            id="dashboard-traffic-retry-button"
            onClick={() => refetch()}
            className="text-sm font-medium text-red-700 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {kpis.map((k) => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex p-2 rounded-lg ${k.tone}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {typeof k.trend === 'number' && (
                      <span
                        className={`text-xs font-medium flex items-center gap-0.5 ${
                          k.trend >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {k.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(k.trend)}% vs yesterday
                      </span>
                    )}
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{nf(k.value)}</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-700">{k.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <div className={`lg:col-span-2 ${isFetching ? 'opacity-70' : ''} transition-opacity`}>
              <p className="text-sm font-medium text-gray-700 mb-2">{active.hint}</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.series} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16a34a" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="period"
                      tickFormatter={(p) => formatPeriod(String(p), range)}
                      tick={{ fontSize: 11 }}
                      minTickGap={24}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip labelFormatter={(l) => formatPeriod(String(l), range)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="views" name="Total visits" stroke="#16a34a" strokeWidth={2} fill="url(#viewsFill)" />
                    <Area type="monotone" dataKey="visitors" name="Unique visitors" stroke="#2563eb" strokeWidth={2} fill="url(#visitorsFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Devices · last 30 days</p>
              <div className="h-64">
                {devices.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={devices} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                        {devices.map((d) => (
                          <Cell key={d.name} fill={DEVICE_COLORS[d.name] ?? '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">No visits yet</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
