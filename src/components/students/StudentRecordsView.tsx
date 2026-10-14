import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  PlusCircle,
  FileEdit,
  Info,
  Calendar,
} from 'lucide-react';
import {
  StudentRecord,
  IncidentReport,
  FollowUpTask,
  Role,
} from '../../types';

interface StudentRecordsViewProps {
  students: StudentRecord[];
  incidents: IncidentReport[];
  followups: FollowUpTask[];
  currentRole: Role;
  onOpenNewIncidentWithStudent?: (student: StudentRecord) => void;
  onOpenNewFollowUpWithStudent?: (student: StudentRecord) => void;
}

export const StudentRecordsView: React.FC<StudentRecordsViewProps> = ({
  students,
  incidents,
  followups,
  currentRole,
  onOpenNewIncidentWithStudent,
  onOpenNewFollowUpWithStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [attendanceRange, setAttendanceRange] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'All' || student.department === departmentFilter;
    const matchesClass = classFilter === 'All' || student.classDivision === classFilter;

    let matchesAttendance = true;
    if (attendanceRange === 'low') matchesAttendance = student.attendance.percentage < 75;
    else if (attendanceRange === 'medium')
      matchesAttendance = student.attendance.percentage >= 75 && student.attendance.percentage < 85;
    else if (attendanceRange === 'high') matchesAttendance = student.attendance.percentage >= 85;

    return matchesSearch && matchesDept && matchesClass && matchesAttendance;
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Records & Profiles</h2>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              {filteredStudents.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fictional student profiles in Computer Engineering. Individual records contain verified attendance, mentorship notes, and follow-up histories.
          </p>
        </div>

        {/* Ethical Privacy Tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>No biometric, facial recognition, or covert tracking enabled</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Search Student</label>
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="ID, Name, or Roll No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
            </select>
          </div>

          {/* Class Division Filter */}
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
              <option value="BE-COMP-A">BE-COMP-A</option>
              <option value="BE-COMP-B">BE-COMP-B</option>
            </select>
          </div>

          {/* Attendance Range Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Attendance Range</label>
            <select
              value={attendanceRange}
              onChange={(e) => setAttendanceRange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Percentages</option>
              <option value="low">Below 75% (Needs Outreach)</option>
              <option value="medium">75% - 85% (Moderate)</option>
              <option value="high">85% and above (Good)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Name & Roll</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Attendance %</th>
                <th className="py-3 px-4">Punctuality</th>
                <th className="py-3 px-4">Reports (Open / Resolved)</th>
                <th className="py-3 px-4">Status & Follow-ups</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const attPct = student.attendance.percentage;
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-medium text-blue-700">
                      {student.id}
                    </td>

                    {/* Name & Roll */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500">Roll: {student.rollNumber}</div>
                    </td>

                    {/* Class */}
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {student.classDivision}
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            attPct < 75
                              ? 'text-amber-600'
                              : attPct < 85
                              ? 'text-blue-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {attPct}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({student.attendance.attendedClasses}/{student.attendance.totalClasses})
                        </span>
                      </div>
                      {attPct < 75 && (
                        <span className="inline-block mt-0.5 text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Outreach Flagged
                        </span>
                      )}
                    </td>

                    {/* Punctuality */}
                    <td className="py-3 px-4 text-slate-700">
                      {student.attendance.lateArrivals > 0 ? (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                          {student.attendance.lateArrivals} late sessions
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">0 late arrivals</span>
                      )}
                    </td>

                    {/* Reports count */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {student.openReportsCount > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-800 border border-amber-200">
                            {student.openReportsCount} Open
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-600">
                          {student.resolvedReportsCount} Resolved
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                          student.status === 'Good Standing'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {student.status}
                      </span>
                      {student.activeFollowupsCount > 0 && (
                        <div className="text-[10px] text-indigo-600 mt-0.5">
                          {student.activeFollowupsCount} active follow-up(s)
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition inline-flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View Dossier</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Student Dossier Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-[#0B1528] text-white p-5 rounded-t-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{selectedStudent.name}</h3>
                  <span className="font-mono text-xs bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700">
                    {selectedStudent.id}
                  </span>
                  <span className="text-xs bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded border border-purple-800">
                    {selectedStudent.classDivision}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Department: {selectedStudent.department} • Roll No: {selectedStudent.rollNumber} • Mentor: {selectedStudent.mentor}
                </p>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white text-lg px-2 py-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs text-slate-700">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-medium">Calculated Attendance</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {selectedStudent.attendance.percentage}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {selectedStudent.attendance.attendedClasses} / {selectedStudent.attendance.totalClasses} sessions attended
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-medium">Punctuality Tracking</div>
                  <div className="text-xl font-bold text-amber-700 mt-1">
                    {selectedStudent.attendance.lateArrivals}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Late arrival instances logged</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-medium">Incident Status</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {selectedStudent.openReportsCount} Open / {selectedStudent.resolvedReportsCount} Resolved
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Formal reports in record</div>
                </div>
              </div>

              {/* Mentorship & Academic Notes */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/70">
                <div className="font-bold text-blue-900 text-xs mb-1 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-blue-600" />
                  Academic Mentoring Observations
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedStudent.notes}</p>
              </div>

              {/* Associated Incidents */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>Incident Reports Related to {selectedStudent.name}</span>
                  <span className="text-[11px] text-slate-500">
                    {incidents.filter((i) => i.studentId === selectedStudent.id).length} record(s)
                  </span>
                </h4>

                <div className="space-y-2">
                  {incidents
                    .filter((i) => i.studentId === selectedStudent.id)
                    .map((inc) => (
                      <div
                        key={inc.id}
                        className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-medium text-blue-700">{inc.referenceNumber}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                            {inc.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium">{inc.category}</p>
                        <p className="text-[11px] text-slate-600 mt-1">{inc.description}</p>
                        {inc.studentResponse && (
                          <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-[11px] text-purple-900">
                            <strong>Student Response:</strong> {inc.studentResponse}
                          </div>
                        )}
                        {currentRole !== 'student' && inc.confidentialNotes && (
                          <div className="mt-1.5 text-[10px] text-slate-500 flex items-center gap-1">
                            <Lock className="h-3 w-3 text-slate-400" />
                            <span>Internal faculty memo: {inc.confidentialNotes}</span>
                          </div>
                        )}
                      </div>
                    ))}

                  {incidents.filter((i) => i.studentId === selectedStudent.id).length === 0 && (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                      No disciplinary incidents or reports on file for this student.
                    </p>
                  )}
                </div>
              </div>

              {/* Associated Follow-up Tasks */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Supportive Follow-up Tasks</h4>
                <div className="space-y-2">
                  {followups
                    .filter((f) => f.studentId === selectedStudent.id)
                    .map((fup) => (
                      <div
                        key={fup.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{fup.taskTitle}</div>
                          <div className="text-[11px] text-slate-500">
                            Type: {fup.actionType} • Due: {fup.dueDate} • Mentor: {fup.assignedStaff}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            fup.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fup.status === 'Overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {fup.status}
                        </span>
                      </div>
                    ))}

                  {followups.filter((f) => f.studentId === selectedStudent.id).length === 0 && (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                      No pending follow-up tasks currently assigned.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {currentRole !== 'student' && (
                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  {onOpenNewFollowUpWithStudent && (
                    <button
                      onClick={() => {
                        onOpenNewFollowUpWithStudent(selectedStudent);
                        setSelectedStudent(null);
                      }}
                      className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                      + Assign Mentoring Follow-up
                    </button>
                  )}
                  {onOpenNewIncidentWithStudent && (
                    <button
                      onClick={() => {
                        onOpenNewIncidentWithStudent(selectedStudent);
                        setSelectedStudent(null);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs"
                    >
                      + File Incident Observation
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
