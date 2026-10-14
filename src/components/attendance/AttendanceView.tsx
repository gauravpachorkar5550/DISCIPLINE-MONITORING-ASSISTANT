import React, { useState } from 'react';
import {
  Clock,
  CalendarCheck,
  Search,
  Filter,
  Plus,
  AlertCircle,
  CheckCircle2,
  Edit2,
  FileText,
  Info,
  History,
  AlertTriangle,
} from 'lucide-react';
import {
  AttendanceEntry,
  StudentRecord,
  AttendanceStatus,
  Role,
} from '../../types';

interface AttendanceViewProps {
  attendance: AttendanceEntry[];
  students: StudentRecord[];
  currentRole: Role;
  onRecordAttendance: (entry: Partial<AttendanceEntry>) => Promise<void>;
  onCorrectAttendance: (id: string, newStatus: AttendanceStatus, reason: string) => Promise<void>;
  onRequestCorrectionAsStudent?: (relatedRecordId: string, subject: string, explanation: string) => Promise<void>;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendance,
  students,
  currentRole,
  onRecordAttendance,
  onCorrectAttendance,
  onRequestCorrectionAsStudent,
}) => {
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [correctingEntry, setCorrectingEntry] = useState<AttendanceEntry | null>(null);
  const [correctionNewStatus, setCorrectionNewStatus] = useState<AttendanceStatus>('Present');
  const [correctionReason, setCorrectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Student clarification modal
  const [studentDisputeEntry, setStudentDisputeEntry] = useState<AttendanceEntry | null>(null);
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeExplanation, setDisputeExplanation] = useState('');

  // Filters
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  // Mark form state
  const [markStudentId, setMarkStudentId] = useState(students[0]?.id || 'STU-2024-001');
  const [markSubject, setMarkSubject] = useState('Operating Systems');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markStatus, setMarkStatus] = useState<AttendanceStatus>('Present');
  const [markLateMinutes, setMarkLateMinutes] = useState('10');
  const [markOutreachFlag, setMarkOutreachFlag] = useState(false);

  // Filtered attendance list
  const filteredAttendance = attendance.filter((entry) => {
    const matchesSearch =
      entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = classFilter === 'All' || entry.classDivision === classFilter;
    const matchesStatus = statusFilter === 'All' || entry.status === statusFilter;
    const matchesSubject = subjectFilter === 'All' || entry.subject === subjectFilter;

    return matchesSearch && matchesClass && matchesStatus && matchesSubject;
  });

  const subjects = [
    'Operating Systems',
    'Database Management Systems',
    'Cloud Computing',
    'Computer Networks Lab',
    'Software Engineering',
    'Distributed Systems',
  ];

  const handleMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const student = students.find((s) => s.id === markStudentId);

    try {
      await onRecordAttendance({
        date: markDate,
        studentId: markStudentId,
        studentName: student?.name || 'Rahul Sharma',
        department: student?.department || 'Computer Engineering',
        classDivision: student?.classDivision || 'TE-COMP-A',
        subject: markSubject,
        status: markStatus,
        lateMinutes: markStatus === 'Late' ? parseInt(markLateMinutes, 10) : undefined,
        flaggedForOutreach: markOutreachFlag,
      });

      setShowMarkModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctingEntry) return;
    if (!correctionReason.trim()) {
      alert('Please provide an official audit reason for correcting this attendance mark.');
      return;
    }

    setSubmitting(true);
    try {
      await onCorrectAttendance(correctingEntry.id, correctionNewStatus, correctionReason);
      setCorrectingEntry(null);
      setCorrectionReason('');
    } catch (err: any) {
      alert(err.message || 'Correction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudentDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentDisputeEntry || !onRequestCorrectionAsStudent) return;
    if (!disputeExplanation.trim()) {
      alert('Please explain the circumstances (e.g. gate pass, transit delay).');
      return;
    }

    setSubmitting(true);
    try {
      await onRequestCorrectionAsStudent(
        studentDisputeEntry.id,
        disputeSubject || `Attendance review for ${studentDisputeEntry.subject} on ${studentDisputeEntry.date}`,
        disputeExplanation
      );
      setStudentDisputeEntry(null);
      setDisputeExplanation('');
      alert('Attendance clarification request submitted to your faculty mentor for review.');
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Attendance & Punctuality Module</h2>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Demo System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Deterministic record-keeping for lectures and practical laboratories. Low attendance triggers supportive academic check-ins and mentorship rather than automatic punishment.
          </p>
        </div>

        {currentRole !== 'student' && (
          <button
            onClick={() => setShowMarkModal(true)}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Mark Attendance Entry</span>
          </button>
        )}
      </div>

      {/* Philosophy Banner */}
      <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Academic Support Notice:</strong> In accordance with CIE guidelines, attendance records are not used as disciplinary sanctions. Any session below the 75% threshold initiates positive outreach by the designated class mentor to address commute hurdles or academic challenges.
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Search Records</label>
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Student, Subject, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Class / Division</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Classes</option>
              <option value="TE-COMP-A">TE-COMP-A</option>
              <option value="TE-COMP-B">TE-COMP-B</option>
              <option value="BE-COMP-B">BE-COMP-B</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Attendance Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late Arrival</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Entries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Subject Course</th>
                <th className="py-3 px-4">Status & Lateness</th>
                <th className="py-3 px-4">Support & Dispute Flags</th>
                <th className="py-3 px-4 text-right">Action / Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition">
                  {/* Date */}
                  <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                    {entry.date}
                  </td>

                  {/* Student */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{entry.studentName}</div>
                    <div className="text-[11px] text-slate-500">{entry.studentId}</div>
                  </td>

                  {/* Class */}
                  <td className="py-3 px-4 text-slate-600 font-medium">{entry.classDivision}</td>

                  {/* Subject */}
                  <td className="py-3 px-4 text-slate-800">{entry.subject}</td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                          entry.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : entry.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {entry.status}
                      </span>
                      {entry.lateMinutes && (
                        <span className="text-[11px] text-slate-500">
                          +{entry.lateMinutes}m
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Flags */}
                  <td className="py-3 px-4">
                    {entry.disputed && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        <AlertTriangle className="h-3 w-3" />
                        Disputed / Clarification
                      </span>
                    )}
                    {entry.flaggedForOutreach && !entry.disputed && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Outreach Triggered
                      </span>
                    )}
                    {!entry.disputed && !entry.flaggedForOutreach && (
                      <span className="text-[11px] text-slate-400">Regular</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    {currentRole !== 'student' ? (
                      <button
                        onClick={() => {
                          setCorrectingEntry(entry);
                          setCorrectionNewStatus(entry.status === 'Absent' ? 'Present' : 'Absent');
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition inline-flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Audit / Correct</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setStudentDisputeEntry(entry);
                          setDisputeSubject(`Attendance dispute for ${entry.subject} on ${entry.date}`);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition"
                      >
                        Request Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No attendance records match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Attendance Correction Modal */}
      {correctingEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 text-xs text-slate-700">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Correct Attendance Record
            </h3>
            <p className="text-slate-500 mb-4">
              All corrections are logged to the immutable audit trail with actor name and reason.
            </p>

            <form onSubmit={handleCorrectionSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 space-y-1">
                <div><strong>Student:</strong> {correctingEntry.studentName} ({correctingEntry.studentId})</div>
                <div><strong>Session:</strong> {correctingEntry.subject} on {correctingEntry.date}</div>
                <div><strong>Current Marked Status:</strong> {correctingEntry.status}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Status
                </label>
                <select
                  value={correctionNewStatus}
                  onChange={(e) => setCorrectionNewStatus(e.target.value as AttendanceStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late Arrival</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Change (Audit Documentation) *
                </label>
                <textarea
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Student submitted department symposium gate pass signed by faculty advisor."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  required
                />
              </div>

              {/* Previous Audit Log for this Entry */}
              {correctingEntry.auditLog.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-800 mb-1">Audit History:</div>
                  <div className="space-y-1 text-[11px] text-slate-500">
                    {correctingEntry.auditLog.map((log, i) => (
                      <div key={i}>
                        • {new Date(log.timestamp).toLocaleTimeString()}: {log.updatedBy} changed {log.prevStatus} → {log.newStatus} ({log.reason})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCorrectingEntry(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  {submitting ? 'Saving...' : 'Save & Log Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Dispute / Clarification Modal */}
      {studentDisputeEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 text-xs text-slate-700">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Request Attendance Correction
            </h3>
            <p className="text-slate-500 mb-4">
              Submit your explanation to the course instructor. College policy ensures fair, non-punitive review.
            </p>

            <form onSubmit={handleStudentDisputeSubmit} className="space-y-4">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-purple-950 space-y-1">
                <div><strong>Subject:</strong> {studentDisputeEntry.subject}</div>
                <div><strong>Date:</strong> {studentDisputeEntry.date}</div>
                <div><strong>Current Recorded Status:</strong> {studentDisputeEntry.status}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  value={disputeSubject}
                  onChange={(e) => setDisputeSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Factual Explanation *
                </label>
                <textarea
                  rows={4}
                  value={disputeExplanation}
                  onChange={(e) => setDisputeExplanation(e.target.value)}
                  placeholder="Explain your situation respectfully (e.g. participated in official college hackathon, transit breakdown on suburban rail line, medical certificate #1024)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStudentDisputeEntry(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-semibold text-white bg-purple-700 hover:bg-purple-600 rounded-lg"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark New Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl p-6 text-xs text-slate-700">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Record Attendance Entry
            </h3>
            <p className="text-slate-500 mb-4">
              Enter lecture attendance or practical lab arrival.
            </p>

            <form onSubmit={handleMarkSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Student *
                  </label>
                  <select
                    value={markStudentId}
                    onChange={(e) => setMarkStudentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id} • {s.classDivision})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Course Subject *
                  </label>
                  <select
                    value={markSubject}
                    onChange={(e) => setMarkSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={markDate}
                    onChange={(e) => setMarkDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={markStatus}
                    onChange={(e) => setMarkStatus(e.target.value as AttendanceStatus)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late Arrival</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              {markStatus === 'Late' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Late Minutes Arrived
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={markLateMinutes}
                    onChange={(e) => setMarkLateMinutes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              )}

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={markOutreachFlag}
                    onChange={(e) => setMarkOutreachFlag(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Flag for supportive mentor outreach (if consecutive absence/lateness)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  {submitting ? 'Saving...' : 'Record Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
