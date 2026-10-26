'use client';

import Link from 'next/link';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import {
  BookOpen,
  FileText,
  FileQuestion,
  HardDrive,
  HelpCircle,
  ListChecks,
  RefreshCw,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { useGetDashboardStatsQuery } from '../../features/dashboard/api/dashboardApi';
import { getApiErrorMessage } from '../../lib/apiError';

const COLORS = {
  blue: '#2563eb',
  green: '#16a34a',
  purple: '#9333ea',
  orange: '#ea580c',
  teal: '#0d9488',
  pink: '#db2777',
  slate: '#94a3b8',
};

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value >= 100 || i === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[i]}`;
};

const nf = (n: number) => n.toLocaleString();

const shortDate = (iso: string) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

const shortMonth = (m: string) =>
  new Date(m + '-01T00:00:00Z').toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 h-full">
      <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{title}</h3>
      {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="h-full min-h-[200px] flex items-center justify-center text-sm text-gray-400">{text}</div>;
}

export default function DashboardStats() {
  const { data, isLoading, isFetching, error, refetch } = useGetDashboardStatsQuery(undefined, {
    pollingInterval: 60000,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
        <p className="text-sm text-red-700 flex-1">
          {getApiErrorMessage(error, 'Could not load dashboard statistics.')}
        </p>
        <button
          id="dashboard-stats-retry-button"
          onClick={() => refetch()}
          className="text-sm font-medium text-red-700 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const cards = [
    { label: 'Live Courses', value: data.courses.live, sub: `${nf(data.courses.total)} total · ${nf(data.courses.upcoming)} upcoming`, icon: BookOpen, tone: 'bg-green-50 text-green-600', href: '/dashboard/courses' },
    { label: 'Blogs', value: data.blogs.published, sub: `${nf(data.blogs.total)} total · ${nf(data.blogs.draft)} draft`, icon: FileText, tone: 'bg-purple-50 text-purple-600', href: '/dashboard/blog' },
    { label: 'Leads', value: data.leads.total, sub: `${nf(data.leads.new)} new · ${nf(data.leads.enrolled)} enrolled`, icon: UserPlus, tone: 'bg-blue-50 text-blue-600', href: '/dashboard/leads' },
    { label: 'Q&A', value: data.qna.published, sub: `${nf(data.qna.total)} total · ${nf(data.qna.draft)} draft`, icon: HelpCircle, tone: 'bg-indigo-50 text-indigo-600', href: '/dashboard/qna' },
    { label: 'PDFs', value: data.pdfs.published, sub: `${nf(data.pdfs.total)} total · ${formatBytes(data.pdfs.bytes)}`, icon: FileQuestion, tone: 'bg-orange-50 text-orange-600', href: '/dashboard/pyqs' },
    { label: 'MCQ Quizzes', value: data.mcqs.published, sub: `${nf(data.mcqs.questions)} questions · ${nf(data.mcqs.attempts)} attempts`, icon: ListChecks, tone: 'bg-pink-50 text-pink-600', href: '/dashboard/quizzes' },
    { label: 'File Storage', value: formatBytes(data.storage.bytes), sub: `${nf(data.storage.files)} files`, icon: HardDrive, tone: 'bg-slate-100 text-slate-600', href: '/dashboard/files' },
  ];

  const contentMix = [
    { name: 'Courses', value: data.courses.total, color: COLORS.green },
    { name: 'Blogs', value: data.blogs.total, color: COLORS.purple },
    { name: 'Q&A', value: data.qna.total, color: COLORS.teal },
    { name: 'PDFs', value: data.pdfs.total, color: COLORS.orange },
    { name: 'MCQs', value: data.mcqs.total, color: COLORS.pink },
  ].filter((d) => d.value > 0);
  const contentTotal = contentMix.reduce((a, b) => a + b.value, 0);

  const leadFunnel = [
    { stage: 'New', count: data.leads.new, color: COLORS.blue },
    { stage: 'Contacted', count: data.leads.contacted, color: COLORS.orange },
    { stage: 'Enrolled', count: data.leads.enrolled, color: COLORS.green },
    { stage: 'Lost', count: data.leads.lost, color: COLORS.slate },
  ];

  const storageByType = data.storage.byType
    .filter((t) => t.bytes > 0)
    .map((t) => ({ name: t.type, value: t.bytes, files: t.files }));
  const storagePalette = [COLORS.blue, COLORS.green, COLORS.orange, COLORS.purple, COLORS.pink, COLORS.slate];

  const publishStatus = [
    { name: 'Blogs', Published: data.blogs.published, Draft: data.blogs.draft, Scheduled: 0 },
    { name: 'Q&A', Published: data.qna.published, Draft: data.qna.draft, Scheduled: data.qna.scheduled },
    { name: 'PDFs', Published: data.pdfs.published, Draft: data.pdfs.draft, Scheduled: data.pdfs.scheduled },
    { name: 'MCQs', Published: data.mcqs.published, Draft: data.mcqs.draft, Scheduled: data.mcqs.scheduled },
  ];

  const leads30 = data.leadsDaily.reduce((a, b) => a + b.count, 0);
  const conversion = data.leads.total ? Math.round((data.leads.enrolled / data.leads.total) * 100) : 0;
  const draftTotal = data.blogs.draft + data.qna.draft + data.pdfs.draft + data.mcqs.draft;
  const verifiedPct = data.users.total ? Math.round((data.users.verified / data.users.total) * 100) : 0;

  const summary = [
    `${nf(contentTotal)} content items across the platform: ${nf(data.courses.total)} courses, ${nf(data.blogs.total)} blogs, ${nf(data.qna.total)} Q&As, ${nf(data.pdfs.total)} PDFs and ${nf(data.mcqs.total)} MCQ quizzes.`,
    `${nf(data.courses.live)} course${data.courses.live === 1 ? ' is' : 's are'} live right now, with ${nf(data.courses.upcoming)} upcoming and ${nf(data.courses.ended)} ended.`,
    `${nf(data.leads.total)} leads collected (${nf(leads30)} in the last 30 days); ${conversion}% have enrolled and ${nf(data.leads.new)} still need a first contact.`,
    `MCQ quizzes hold ${nf(data.mcqs.questions)} questions and have been attempted ${nf(data.mcqs.attempts)} times; PDFs have been accessed ${nf(data.pdfs.accesses)} times.`,
    `${nf(draftTotal)} item${draftTotal === 1 ? '' : 's'} sit in draft across blogs, Q&A, PDFs and MCQs.`,
    `File storage uses ${formatBytes(data.storage.bytes)} across ${nf(data.storage.files)} files.`,
    `${nf(data.users.total)} user accounts, ${verifiedPct}% verified.`,
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Platform overview</h2>
        <button
          id="dashboard-stats-refresh-button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Updated {new Date(data.generatedAt).toLocaleTimeString()}
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-2 rounded-xl ${c.tone}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                {typeof c.value === 'number' ? nf(c.value) : c.value}
              </p>
              <p className="text-xs sm:text-sm font-medium text-gray-700">{c.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{c.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Leads trend + content mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card title="Leads — last 30 days" subtitle={`${nf(leads30)} new leads`}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.leadsDaily} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} minTickGap={24} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={(l) => shortDate(String(l))} formatter={(v) => [v, 'Leads']} />
                  <Area type="monotone" dataKey="count" stroke={COLORS.blue} strokeWidth={2} fill="url(#leadFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card title="Content mix" subtitle={`${nf(contentTotal)} items`}>
          <div className="h-64">
            {contentMix.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={contentMix} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                    {contentMix.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty text="No content yet" />
            )}
          </div>
        </Card>
      </div>

      {/* Content growth + publish status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Content added — last 6 months">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.contentByMonth} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tickFormatter={shortMonth} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(l) => shortMonth(String(l))} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="courses" name="Courses" stackId="a" fill={COLORS.green} />
                <Bar dataKey="blogs" name="Blogs" stackId="a" fill={COLORS.purple} />
                <Bar dataKey="qna" name="Q&A" stackId="a" fill={COLORS.teal} />
                <Bar dataKey="pdfs" name="PDFs" stackId="a" fill={COLORS.orange} />
                <Bar dataKey="mcqs" name="MCQs" stackId="a" fill={COLORS.pink} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Publishing status" subtitle="Published vs draft vs scheduled">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={publishStatus} layout="vertical" margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={56} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Published" stackId="s" fill={COLORS.green} />
                <Bar dataKey="Scheduled" stackId="s" fill={COLORS.orange} />
                <Bar dataKey="Draft" stackId="s" fill={COLORS.slate} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Lead pipeline + storage + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Lead pipeline" subtitle={`${conversion}% conversion to enrolled`}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadFunnel} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Leads']} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {leadFunnel.map((d) => (
                    <Cell key={d.stage} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="File storage" subtitle={`${formatBytes(data.storage.bytes)} · ${nf(data.storage.files)} files`}>
          <div className="h-56">
            {storageByType.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={storageByType} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                    {storageByType.map((d, i) => (
                      <Cell key={d.name} fill={storagePalette[i % storagePalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatBytes(Number(v))} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty text="No files uploaded" />
            )}
          </div>
        </Card>

        <Card title="Overall summary">
          <ul className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {summary.map((line, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600 leading-5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
