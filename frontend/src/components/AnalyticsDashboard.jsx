import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalytics } from "../hooks/useAnalytics";

const PRIORITY_COLORS = { low: "#8A93A6", medium: "#5B8DEF", high: "#F2994A", urgent: "#EB5757" };

export default function AnalyticsDashboard({ boardId, onClose }) {
  const { data, isLoading } = useAnalytics(boardId);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-panel border border-white/10 rounded-2xl w-full max-w-4xl shadow-card max-h-[88vh] overflow-y-auto"
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display font-semibold text-base flex items-center gap-2">
            <span className="pulse-dot" />
            Live analytics
          </h2>
          <button onClick={onClose} className="text-mist hover:text-white text-sm">
            ✕
          </button>
        </div>

        {isLoading || !data ? (
          <p className="text-mist text-sm p-5">Crunching numbers…</p>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummaryCards summary={data.summary} />

            <ChartCard title="Cards per list">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.cardsPerList}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232838" vertical={false} />
                  <XAxis dataKey="listTitle" stroke="#8A93A6" fontSize={11} />
                  <YAxis stroke="#8A93A6" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#232838", border: "none", fontSize: 12 }} />
                  <Bar dataKey="count" fill="#5B8DEF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Priority breakdown">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.priorityBreakdown}
                    dataKey="count"
                    nameKey="priority"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {data.priorityBreakdown.map((entry, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[entry.priority] || "#8A93A6"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#232838", border: "none", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Workload per teammate">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.assigneeWorkload} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#232838" horizontal={false} />
                  <XAxis type="number" stroke="#8A93A6" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#8A93A6" fontSize={11} width={80} />
                  <Tooltip contentStyle={{ background: "#232838", border: "none", fontSize: 12 }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {data.assigneeWorkload.map((entry, i) => (
                      <Cell key={i} fill={entry.color || "#5B8DEF"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Completions (last 14 days)">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.completionOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232838" vertical={false} />
                  <XAxis dataKey="date" stroke="#8A93A6" fontSize={10} />
                  <YAxis stroke="#8A93A6" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#232838", border: "none", fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="#27AE60" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-white/5">
      <h4 className="text-xs font-semibold text-mist uppercase tracking-wide mb-2">{title}</h4>
      {children}
    </div>
  );
}

function SummaryCards({ summary }) {
  return (
    <div className="md:col-span-2 grid grid-cols-3 gap-3">
      <Stat label="Total cards" value={summary.totalCards} />
      <Stat label="Completed" value={summary.completedCards} />
      <Stat label="Completion rate" value={`${summary.completionRate}%`} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-white/5 text-center">
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-mist text-xs mt-1">{label}</p>
    </div>
  );
}
