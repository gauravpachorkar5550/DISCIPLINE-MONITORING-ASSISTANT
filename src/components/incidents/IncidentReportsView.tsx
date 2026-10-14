import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Sparkles,
  Info,
  Lock,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Eye,
  Check,
} from 'lucide-react';
import {
  IncidentReport,
  IncidentCategory,
  IncidentStatus,
  StudentRecord,
  CollegeRule,
  Role,
} from '../../types';

interface IncidentReportsViewProps {
  incidents: IncidentReport[];
  students: StudentRecord[];
  rules: CollegeRule[];
  currentRole: Role;
  onCreateIncident: (payload: Partial<IncidentReport>) => Promise<void>;
  onUpdateIncidentStatus: (id: string, newStatus: IncidentStatus, reason: string) => Promise<void>;
  onSubmitStudentResponse?: (id: string, response: string) => Promise<void>;
  preselectedIncident?: IncidentReport | null;
  onLaunchReportWriter?: (draft: { notes: string; category: string; studentName: string }) => void;
}

export const IncidentReportsView: React.FC<IncidentReportsViewProps> = ({
  incidents,
  students,
  rules,
  currentRole,
  onCreateIncident,
  onUpdateIncidentStatus,
  onSubmitStudentResponse,
  preselectedIncident,
  onLaunchReportWriter,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectIncident, setInspectIncident] = useState<IncidentReport | null>(preselectedIncident || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Status update form inside inspect modal
  const [newStatus, setNewStatus] = useState<IncidentStatus>('Under review');
  const [statusUpdateReason, setStatusUpdateReason] = useState('');

  // Student response form inside inspect modal
  const [studentResponseText, setStudentResponseText] = useState('');

  // New incident form state
  const [formStudentId, setFormStudentId] = useState(students[0]?.id || 'STU-2024-001');
  const [formCategory, setFormCategory] = useState<IncidentCategory>('Classroom disruption');
  const [formDescription, setFormDescription] = useState('');
  const [formRule, setFormRule] = useState(rules[0]?.code || 'RULE-ENG-101');
  const [formPeopleInvolved, setFormPeopleInvolved] = useState('');
  const [formWitnessInfo, setFormWitnessInfo] = useState('');
  const [formImmediateAction, setFormImmediateAction] = useState('Verbal reminder given to respect lecture atmosphere');
  const [formFollowUpRequired, setFormFollowUpRequired] = useState(true);
  const [formSupportingNotes, setFormSupportingNotes] = useState('');
  const [formConfidentialNotes, setFormConfidentialNotes] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Filter incidents
  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || inc.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || inc.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories: IncidentCategory[] = [
    'Classroom disruption',
    'Repeated lateness',
    'Attendance-related concern',
    'Damage to college property',
    'Disrespectful behaviour',
    'Violation of a documented college rule',
    'Other concern',
  ];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!formStudentId) errors.push('Please select a student.');
    if (!formCategory) errors.push('Please specify a category.');
    if (!formDescription || formDescription.trim().length < 10) {
      errors.push('Factual description must be at least 10 characters.');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors([]);

    const studentObj = students.find((s) => s.id === formStudentId);
    const ruleObj = rules.find((r) => r.code === formRule);

    try {
      await onCreateIncident({
        studentId: formStudentId,
        studentName: studentObj?.name || 'Rahul Sharma',
        department: studentObj?.department || 'Computer Engineering',
        classDivision: studentObj?.classDivision || 'TE-COMP-A',
        category: formCategory,
        description: formDescription,
        relevantRule: ruleObj ? `${ruleObj.code} (${ruleObj.title})` : 'College Conduct Code',
        peopleInvolved: formPeopleInvolved || studentObj?.name || '',
        witnessInfo: formWitnessInfo || 'Voluntary observations recorded',
        immediateActionTaken: formImmediateAction,
        followUpRequired: formFollowUpRequired,
        supportingNotes: formSupportingNotes,
        confidentialNotes: formConfidentialNotes,
      });

      setShowCreateModal(false);
      setActionSuccessMsg('Incident report filed successfully with unique reference ID.');
      setTimeout(() => setActionSuccessMsg(null), 4000);

      // Reset form
      setFormDescription('');
      setFormSupportingNotes('');
      setFormConfidentialNotes('');
    } catch (err: any) {
      setFormErrors([err?.message || 'Failed to file incident report.']);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!inspectIncident) return;
    if (!statusUpdateReason.trim()) {
      alert('Please provide an audit rationale note for changing this report status.');
      return;
    }

    try {
      await onUpdateIncidentStatus(inspectIncident.id, newStatus, statusUpdateReason);
      inspectIncident.status = newStatus;
      setStatusUpdateReason('');
      setActionSuccessMsg(`Status updated to "${newStatus}" with documented audit trail.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleSendStudentResponse = async () => {
    if (!inspectIncident || !studentResponseText.trim()) return;
    if (onSubmitStudentResponse) {
      try {
        await onSubmitStudentResponse(inspectIncident.id, studentResponseText);
        inspectIncident.studentResponse = studentResponseText;
        inspectIncident.status = 'Under review';
        setStudentResponseText('');
        setActionSuccessMsg('Student clarification registered and marked Under Review.');
        setTimeout(() => setActionSuccessMsg(null), 4000);
      } catch (err: any) {
        alert(err.message || 'Failed to submit response.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Incident Reports Register</h2>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              {filteredIncidents.length} Records Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Neutral documentation of classroom events and policy observations. Reports distinguish initial allegations from verified findings and mandate human review before any administrative action.
          </p>
        </div>

        {currentRole !== 'student' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>File Incident Report</span>
          </button>
        )}
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Search Reports</label>
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search reference #, student name, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Filter by Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Incident Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Awaiting review">Awaiting Review</option>
              <option value="Under review">Under Review</option>
              <option value="Awaiting student response">Awaiting Student Response</option>
              <option value="Follow-up required">Follow-up Required</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Student & Class</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Factual Nature</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-medium text-blue-700">
                    {inc.referenceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(inc.dateTime).toLocaleDateString()} {new Date(inc.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{inc.studentName}</div>
                    <div className="text-[11px] text-slate-500">{inc.classDivision} • {inc.studentId}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {inc.category}
                  </td>
                  <td className="py-3 px-4">
                    {inc.isVerifiedFact ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle className="h-3 w-3" />
                        Verified Fact
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="h-3 w-3" />
                        Reported Observation
                      </span>
                    )}
                  </td>
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
                      onClick={() => setInspectIncident(inc)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition inline-flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Details & History</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredIncidents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No incident reports match your current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Incident Modal with Audit History & Status Update */}
      {inspectIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-[#0B1528] text-white p-5 rounded-t-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                    {inspectIncident.referenceNumber}
                  </span>
                  <h3 className="text-base font-bold">{inspectIncident.category}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Reported on {new Date(inspectIncident.dateTime).toLocaleString()} by {inspectIncident.reportedBy} ({inspectIncident.reportedByRole})
                </p>
              </div>

              <button
                onClick={() => setInspectIncident(null)}
                className="text-slate-400 hover:text-white text-lg px-2 py-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Status and Verification Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium mr-2">Current Status:</span>
                  <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-300">
                    {inspectIncident.status}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-medium mr-2">Epistemological Status:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      inspectIncident.isVerifiedFact
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {inspectIncident.isVerifiedFact ? 'Verified Finding' : 'Reported Observation / Pending'}
                  </span>
                </div>
              </div>

              {/* Factual Description */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1 text-xs">Observed Event Description:</h4>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                  {inspectIncident.description}
                </div>
              </div>

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 block">Student Involved</span>
                  <span className="font-semibold text-slate-900">
                    {inspectIncident.studentName} ({inspectIncident.studentId})
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Class & Division</span>
                  <span className="font-semibold text-slate-900">{inspectIncident.classDivision}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Referenced Rule</span>
                  <span className="font-semibold text-slate-900 truncate block">
                    {inspectIncident.relevantRule}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Immediate Action Taken</span>
                  <span className="text-slate-800">{inspectIncident.immediateActionTaken || 'None'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Witness / Notes</span>
                  <span className="text-slate-800">{inspectIncident.witnessInfo || 'No witness logged'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Follow-up Mandated</span>
                  <span className="font-medium text-slate-800">
                    {inspectIncident.followUpRequired ? 'Yes (Mentoring Assigned)' : 'No'}
                  </span>
                </div>
              </div>

              {/* Student Response Section */}
              <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-950 mb-1 text-xs flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  Student Response & Clarification
                </h4>
                {inspectIncident.studentResponse ? (
                  <div className="text-xs text-purple-900 mt-1 leading-relaxed">
                    <p className="italic bg-white p-2.5 rounded border border-purple-200">
                      "{inspectIncident.studentResponse}"
                    </p>
                    {inspectIncident.studentResponseDate && (
                      <span className="text-[10px] text-purple-600 mt-1 block">
                        Received on {new Date(inspectIncident.studentResponseDate).toLocaleString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-purple-700 mt-1 italic">
                    Awaiting student clarification or response. Students have the explicit right to submit written context.
                  </p>
                )}

                {/* If role is Student, allow submitting response */}
                {currentRole === 'student' && !inspectIncident.studentResponse && (
                  <div className="mt-3 pt-3 border-t border-purple-200/80">
                    <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                      Submit Your Written Perspective:
                    </label>
                    <textarea
                      rows={3}
                      value={studentResponseText}
                      onChange={(e) => setStudentResponseText(e.target.value)}
                      placeholder="Explain any circumstances, transit delays, or technical difficulties respectfully..."
                      className="w-full bg-white border border-purple-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleSendStudentResponse}
                      className="mt-2 px-3.5 py-1.5 text-xs font-semibold bg-purple-700 hover:bg-purple-600 text-white rounded-md transition"
                    >
                      Submit Official Clarification
                    </button>
                  </div>
                )}
              </div>

              {/* Confidential Faculty Notes (Restricted to Faculty/Admin) */}
              {currentRole !== 'student' && inspectIncident.confidentialNotes && (
                <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200">
                  <div className="font-bold text-amber-900 text-xs mb-1 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                    Internal Confidential Faculty/Counselor Note (Hidden from Student)
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {inspectIncident.confidentialNotes}
                  </p>
                </div>
              )}

              {/* Status Update Form (Faculty/Admin only) */}
              {currentRole !== 'student' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs">Update Incident Status (with Audit Rationale)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Target Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as IncidentStatus)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                      >
                        <option value="Awaiting review">Awaiting Review</option>
                        <option value="Under review">Under Review</option>
                        <option value="Awaiting student response">Awaiting Student Response</option>
                        <option value="Follow-up required">Follow-up Required</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Audit Rationale (Mandatory)</label>
                      <input
                        type="text"
                        placeholder="e.g. Mentor conducted check-in; agreed on plan."
                        value={statusUpdateReason}
                        onChange={(e) => setStatusUpdateReason(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleUpdateStatus}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition"
                    >
                      Save Status Change & Audit Entry
                    </button>
                  </div>
                </div>
              )}

              {/* Immutable Audit History Timeline */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 text-xs">Record Audit Trail & History</h4>
                <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                  {inspectIncident.history.map((h, i) => (
                    <div key={i} className="text-[11px] text-slate-600 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{h.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-slate-500">
                        By {h.actor} ({h.role}) • {h.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-[#0B1528] text-white p-5 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">File Factual Incident Report</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record objective observations without presumptions of misconduct.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg px-2 py-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              {formErrors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 space-y-1">
                  {formErrors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              {/* Student & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Student Observed *
                  </label>
                  <select
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as IncidentCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Factual Description & AI Helper trigger */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Factual Observation Description *
                  </label>
                  {onLaunchReportWriter && (
                    <button
                      type="button"
                      onClick={() => {
                        const studentObj = students.find((s) => s.id === formStudentId);
                        onLaunchReportWriter({
                          notes: formDescription,
                          category: formCategory,
                          studentName: studentObj?.name || 'Student',
                        });
                        setShowCreateModal(false);
                      }}
                      className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Polish with AI Report Assistant</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe clearly and neutrally what was observed (e.g. 'Student arrived 20 minutes after lecture began due to bus delay' or 'Mobile phone notification rang twice during demonstration'). Avoid emotional modifiers or character judgements."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Relevant Rule */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Applicable Institutional Policy / Rule
                </label>
                <select
                  value={formRule}
                  onChange={(e) => setFormRule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  {rules.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code}: {r.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* People Involved & Witness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    People Involved
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma, Prof. Deshmukh"
                    value={formPeopleInvolved}
                    onChange={(e) => setFormPeopleInvolved(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Voluntary Witness Information
                  </label>
                  <input
                    type="text"
                    placeholder="If voluntarily provided and appropriate"
                    value={formWitnessInfo}
                    onChange={(e) => setFormWitnessInfo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              {/* Immediate Action Taken & Follow-up Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Immediate Action Taken
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verbal reminder given to class"
                    value={formImmediateAction}
                    onChange={(e) => setFormImmediateAction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={formFollowUpRequired}
                      onChange={(e) => setFormFollowUpRequired(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Follow-up Mentoring Session Required</span>
                  </label>
                </div>
              </div>

              {/* Confidential Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-slate-500" />
                  <span>Internal Confidential Notes (Only visible to Faculty & Administrators)</span>
                </label>
                <input
                  type="text"
                  placeholder="Optional internal notes for counselor / mentor..."
                  value={formConfidentialNotes}
                  onChange={(e) => setFormConfidentialNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'File Factual Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
