import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  ShieldCheck,
  TrendingUp,
  Clock,
  PieChart,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  IncidentReport,
  StudentRecord,
  AttendanceEntry,
  FollowUpTask,
} from '../../types';

interface AnalyticsViewProps {
  incidents: IncidentReport[];
  students: StudentRecord[];
  attendance: AttendanceEntry[];
  followups: FollowUpTask[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  incidents,
  students,
  attendance,
  followups,
}) => {
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  incidents.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  // Status counts
  const statusCounts: Record<string, number> = {};
  incidents.forEach((i) => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  });

  // Attendance brackets
  const lowAttendance = students.filter((s) => s.attendance.percentage < 75).length;
  const mediumAttendance = students.filter(
    (s) => s.attendance.percentage >= 75 && s.attendance.percentage < 85
  ).length;
  const goodAttendance = students.filter((s) => s.attendance.percentage >= 85).length;

  // Average turnaround time (demo calc)
  const avgTurnaroundDays = '2.8';

  // Export Sanitized CSV
  const handleExportCSV = () => {
    const headers = ['Reference Number', 'Date', 'Class', 'Category', 'Status', 'Is Verified Fact'];
    const rows = incidents.map((i) => [
      i.referenceNumber,
      i.dateTime.split('T')[0],
      i.classDivision,
      `"${i.category}"`,
      `"${i.status}"`,
      i.isVerifiedFact ? 'Yes' : 'No',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Discipline_Aggregate_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Aggregated CSV exported safely. Individual private notes were excluded.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Analytics & Aggregate Reporting</h2>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              Department Summary
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Institutional metrics presented in aggregate. Predictive scoring and student shaming lists are strictly prohibited by system architecture.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 font-medium">
          {exportNotice}
        </div>
      )}

      {/* Fairness Safeguard Notice */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 flex items-start gap-3 text-xs leading-relaxed">
        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">Privacy & Non-Punitive Analytics Guarantee:</strong>
          Data is displayed at the aggregate level. This platform enforces zero predictive misconduct profiling: we do not calculate "risk scores" for individual students, nor do we predict future misbehavior. All data represents fictional demo records.
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Documented Incidents</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{incidents.length}</div>
          <span className="text-[11px] text-slate-500">Across 2 academic cohorts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Avg Resolution Turnaround</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">{avgTurnaroundDays} days</div>
          <span className="text-[11px] text-slate-500">From filing to mentor closure</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Cases Resolved / Closed</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length}
          </div>
          <span className="text-[11px] text-slate-500">Supportive resolution rate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Pending Follow-up Sessions</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {followups.filter((f) => f.status === 'Pending' || f.status === 'In Progress').length}
          </div>
          <span className="text-[11px] text-slate-500">Active mentor check-ins</span>
        </div>
      </div>

      {/* Detailed Aggregate Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Status Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Resolution Status Distribution</h3>
              <p className="text-xs text-slate-500">Current state of documented reports</p>
            </div>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-600">
              {incidents.length} Total
            </span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = incidents.length > 0 ? ((count / incidents.length) * 100).toFixed(0) : '0';
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>{status}</span>
                    <span className="text-slate-500 font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        status === 'Resolved' || status === 'Closed'
                          ? 'bg-emerald-500'
                          : status === 'Under review'
                          ? 'bg-blue-500'
                          : status === 'Awaiting student response'
                          ? 'bg-purple-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.max(Number(pct), 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Distribution Spectrum */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Cohort Attendance Distribution</h3>
              <p className="text-xs text-slate-500">Percentage distribution across student cohorts</p>
            </div>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-600">
              {students.length} Students
            </span>
          </div>

          <div className="space-y-4 pt-1 text-xs">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900 block">85% and Above (Good Standing)</span>
                <span className="text-[11px] text-emerald-700">Consistent regular attendance in lectures and practicals</span>
              </div>
              <div className="text-xl font-bold text-emerald-700">{goodAttendance} students</div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-900 block">75% - 84% (Standard Benchmark)</span>
                <span className="text-[11px] text-blue-700">Satisfies minimum institutional requirements</span>
              </div>
              <div className="text-xl font-bold text-blue-700">{mediumAttendance} students</div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-900 block">Below 75% (Supportive Outreach Flag)</span>
                <span className="text-[11px] text-amber-700">Class mentor initiated check-in for commute or illness support</span>
              </div>
              <div className="text-xl font-bold text-amber-700">{lowAttendance} students</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
