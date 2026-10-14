import React, { useState } from 'react';
import {
  Users,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Filter,
  ArrowRight,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  StudentRecord,
  IncidentReport,
  FollowUpTask,
  AttendanceEntry,
  Role,
} from '../../types';

interface DashboardViewProps {
  students: StudentRecord[];
  incidents: IncidentReport[];
  followups: FollowUpTask[];
  attendance: AttendanceEntry[];
  currentRole: Role;
  onNavigate: (tab: string) => void;
  onSelectIncident: (inc: IncidentReport) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  incidents,
  followups,
  attendance,
  currentRole,
  onNavigate,
  onSelectIncident,
}) => {
  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (selectedDept !== 'All' && inc.department !== selectedDept) return false;
    if (selectedClass !== 'All' && inc.classDivision !== selectedClass) return false;
    if (selectedCategory !== 'All' && inc.category !== selectedCategory) return false;
    if (selectedStatus !== 'All' && inc.status !== selectedStatus) return false;
    return true;
  });

  // Metric counts
  const totalStudents = students.length;
  const totalIncidents = incidents.length;
  const awaitingReviewCount = incidents.filter(
    (i) => i.status === 'Submitted' || i.status === 'Awaiting review' || i.status === 'Under review'
  ).length;
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;
  const pendingFollowups = followups.filter((f) => f.status === 'Pending' || f.status === 'In Progress');
  const overdueFollowups = followups.filter((f) => f.status === 'Overdue');

  // Attendance metrics
  const avgAttendance =
    students.length > 0
      ? (
          students.reduce((acc, curr) => acc + curr.attendance.percentage, 0) / students.length
        ).toFixed(1)
      : '0.0';

  const totalLates = students.reduce((acc, curr) => acc + curr.attendance.lateArrivals, 0);

  // Category distribution calculation
  const categoryCounts: Record<string, number> = {};
  filteredIncidents.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  const categories = [
    'Classroom disruption',
    'Repeated lateness',
    'Attendance-related concern',
    'Damage to college property',
    'Disrespectful behaviour',
    'Violation of a documented college rule',
    'Other concern',
  ];

  // Weekly trend demo points
  const weeklyTrendData = [
    { week: 'W1 Sep', count: 2 },
    { week: 'W2 Sep', count: 4 },
    { week: 'W3 Sep', count: 3 },
    { week: 'W4 Sep', count: 5 },
    { week: 'W1 Oct', count: 4 },
    { week: 'W2 Oct', count: filteredIncidents.length },
  ];

  const maxTrend = Math.max(...weeklyTrendData.map((d) => d.count), 6);

  return (
    <div className="space-y-6">
      {/* Top Banner & Fairness Principle Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-[#132238] to-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Academic Discipline & Attendance Overview
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/80">
                TE & BE Computer Engineering
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time monitoring focused on constructive mentoring, transparency, and timely academic outreach.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('incidents')}
              className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow-md flex items-center gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Record Incident</span>
            </button>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="px-3.5 py-2 text-xs font-semibold bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition shadow-md flex items-center gap-1.5"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Ask AI Summary</span>
            </button>
          </div>
        </div>

        {/* Ethical Safeguard Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center gap-2 text-xs text-purple-200/90">
          <Info className="h-4 w-4 text-purple-400 shrink-0" />
          <span>
            <strong>Fairness Guarantee:</strong> In accordance with college policy, students are never ranked by incident count, and automatic punitive algorithms are disabled.
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Demo Students</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active fictional roster</div>
        </div>

        {/* Monthly Incidents */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Incidents Logged</span>
            <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalIncidents}</div>
          <div className="text-[11px] text-slate-500 mt-1">This academic month</div>
        </div>

        {/* Awaiting Review */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Awaiting Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{awaitingReviewCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Needs faculty verification</div>
        </div>

        {/* Pending & Overdue Follow-ups */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-red-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Follow-ups</span>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pendingFollowups.length}</span>
            {overdueFollowups.length > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                {overdueFollowups.length} overdue
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Mentoring & check-ins</div>
        </div>

        {/* Resolved Reports */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{resolvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Cases closed constructively</div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Avg Attendance</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">{avgAttendance}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{totalLates} recorded late arrivals</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="h-3.5 w-3.5 text-blue-600" />
          <span>Filter Department Records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Class / Division</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Classes</option>
              <option value="TE-COMP-A">TE-COMP-A (Third Year Div A)</option>
              <option value="TE-COMP-B">TE-COMP-B (Third Year Div B)</option>
              <option value="BE-COMP-A">BE-COMP-A (Final Year Div A)</option>
              <option value="BE-COMP-B">BE-COMP-B (Final Year Div B)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Incident Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Report Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Awaiting review">Awaiting Review</option>
              <option value="Under review">Under Review</option>
              <option value="Awaiting student response">Awaiting Student Response</option>
              <option value="Follow-up required">Follow-up Required</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visual Charts: Weekly Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Weekly Incident Trajectory</h3>
              <p className="text-xs text-slate-500">Aggregate reports over the semester weeks</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Bi-weekly Trend
            </span>
          </div>

          {/* SVG Area Line Chart */}
          <div className="h-52 w-full pt-4">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 40, 80, 120].map((y, i) => (
                <line
                  key={i}
                  x1="30"
                  y1={y}
                  x2="480"
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Area path */}
              <path
                d={`M 50 ${140 - (weeklyTrendData[0].count / maxTrend) * 110}
                    L 130 ${140 - (weeklyTrendData[1].count / maxTrend) * 110}
                    L 210 ${140 - (weeklyTrendData[2].count / maxTrend) * 110}
                    L 290 ${140 - (weeklyTrendData[3].count / maxTrend) * 110}
                    L 370 ${140 - (weeklyTrendData[4].count / maxTrend) * 110}
                    L 450 ${140 - (weeklyTrendData[5].count / maxTrend) * 110}
                    L 450 140 L 50 140 Z`}
                fill="url(#trendGradient)"
              />

              {/* Line path */}
              <path
                d={`M 50 ${140 - (weeklyTrendData[0].count / maxTrend) * 110}
                    L 130 ${140 - (weeklyTrendData[1].count / maxTrend) * 110}
                    L 210 ${140 - (weeklyTrendData[2].count / maxTrend) * 110}
                    L 290 ${140 - (weeklyTrendData[3].count / maxTrend) * 110}
                    L 370 ${140 - (weeklyTrendData[4].count / maxTrend) * 110}
                    L 450 ${140 - (weeklyTrendData[5].count / maxTrend) * 110}`}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Dots and Labels */}
              {weeklyTrendData.map((d, idx) => {
                const cx = 50 + idx * 80;
                const cy = 140 - (d.count / maxTrend) * 110;
                return (
                  <g key={idx}>
                    <circle cx={cx} cy={cy} r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                    <text
                      x={cx}
                      y={cy - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#1e293b"
                      fontWeight="bold"
                    >
                      {d.count}
                    </text>
                    <text x={cx} y="155" textAnchor="middle" fontSize="10" fill="#64748b">
                      {d.week}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Incidents by Concern Category</h3>
              <p className="text-xs text-slate-500">Distribution of reported behavioral observations</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              {filteredIncidents.length} Filtered Total
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {categories.slice(0, 5).map((cat) => {
              const count = categoryCounts[cat] || 0;
              const pct = filteredIncidents.length > 0 ? ((count / filteredIncidents.length) * 100).toFixed(0) : '0';

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium truncate max-w-[280px]">{cat}</span>
                    <span className="text-slate-500 font-semibold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(Number(pct), 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Recent Incident Reports & Overdue Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Reports */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Incident Reports</h3>
              <p className="text-xs text-slate-500">Most recently documented observations</p>
            </div>
            <button
              onClick={() => onNavigate('incidents')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
            >
              <span>View All Reports</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-4">Ref Number</th>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.slice(0, 5).map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-medium text-blue-700">
                      {inc.referenceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{inc.studentName}</div>
                      <div className="text-[11px] text-slate-500">{inc.studentId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium truncate max-w-[160px]">
                      {inc.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inc.classDivision}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                          inc.status === 'Resolved' || inc.status === 'Closed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : inc.status === 'Awaiting student response'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : inc.status === 'Under review'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          onSelectIncident(inc);
                          onNavigate('incidents');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Urgent Attention & Overdue Follow-ups */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Follow-up Tasks</h3>
                <p className="text-xs text-slate-500">Upcoming and overdue mentor check-ins</p>
              </div>
              <button
                onClick={() => onNavigate('followups')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                All
              </button>
            </div>

            <div className="p-3 space-y-2.5">
              {followups.slice(0, 4).map((fup) => (
                <div
                  key={fup.id}
                  className={`p-3 rounded-lg border text-xs transition ${
                    fup.status === 'Overdue'
                      ? 'bg-red-50/60 border-red-200'
                      : fup.status === 'Completed'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                      {fup.taskTitle}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        fup.status === 'Overdue'
                          ? 'bg-red-600 text-white'
                          : fup.status === 'Completed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {fup.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                    Student: {fup.studentName} • Assigned: {fup.assignedStaff}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {fup.dueDate}
                    </span>
                    <span className="font-medium text-slate-700">{fup.actionType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={() => onNavigate('followups')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>Manage All Mentoring Actions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
