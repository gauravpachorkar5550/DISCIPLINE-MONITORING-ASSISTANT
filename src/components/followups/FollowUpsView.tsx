import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  User,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import {
  FollowUpTask,
  StudentRecord,
  IncidentReport,
  FollowUpStatus,
  Role,
} from '../../types';

interface FollowUpsViewProps {
  followups: FollowUpTask[];
  students: StudentRecord[];
  incidents: IncidentReport[];
  currentRole: Role;
  onCreateFollowUp: (task: Partial<FollowUpTask>) => Promise<void>;
  onUpdateFollowUp: (id: string, status: FollowUpStatus, resolutionSummary?: string) => Promise<void>;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  followups,
  students,
  incidents,
  currentRole,
  onCreateFollowUp,
  onUpdateFollowUp,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [completingTask, setCompletingTask] = useState<FollowUpTask | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionTypeFilter, setActionTypeFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [studentId, setStudentId] = useState(students[0]?.id || 'STU-2024-001');
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState<FollowUpTask['actionType']>('Supportive Mentoring Session');
  const [assignedStaff, setAssignedStaff] = useState('Prof. Dr. Archana Kulkarni');
  const [assignedRole, setAssignedRole] = useState('Faculty Mentor');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [relatedIncidentId, setRelatedIncidentId] = useState('');

  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<any[] | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Filtered tasks
  const filteredFollowups = followups.filter((fup) => {
    const matchesStatus = statusFilter === 'All' || fup.status === statusFilter;
    const matchesAction = actionTypeFilter === 'All' || fup.actionType === actionTypeFilter;
    return matchesStatus && matchesAction;
  });

  const overdueCount = followups.filter((f) => f.status === 'Overdue').length;
  const pendingCount = followups.filter((f) => f.status === 'Pending' || f.status === 'In Progress').length;
  const completedCount = followups.filter((f) => f.status === 'Completed').length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !dueDate) {
      alert('Please provide a task title and target due date.');
      return;
    }

    setSubmitting(true);
    const student = students.find((s) => s.id === studentId);
    const inc = incidents.find((i) => i.id === relatedIncidentId);

    try {
      await onCreateFollowUp({
        studentId,
        studentName: student?.name || 'Rahul Sharma',
        department: student?.department || 'Computer Engineering',
        classDivision: student?.classDivision || 'TE-COMP-A',
        taskTitle,
        description,
        actionType,
        assignedStaff,
        assignedStaffRole: assignedRole,
        dueDate,
        incidentId: inc?.id,
        incidentRef: inc?.referenceNumber,
      });

      setShowAddModal(false);
      setTaskTitle('');
      setDescription('');
    } catch (err: any) {
      alert(err.message || 'Failed to create follow-up task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTask) return;
    if (!resolutionText.trim()) {
      alert('Please summarize what was agreed upon during the mentoring or outreach session.');
      return;
    }

    setSubmitting(true);
    try {
      await onUpdateFollowUp(completingTask.id, 'Completed', resolutionText);
      setCompletingTask(null);
      setResolutionText('');
    } catch (err: any) {
      alert(err.message || 'Failed to complete task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFetchAISuggestions = async () => {
    const student = students.find((s) => s.id === studentId);
    setLoadingSuggestions(true);
    try {
      const res = await fetch('/api/gemini/suggest-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentDescription: description || 'Repeated late arrivals during morning lecture',
          category: actionType,
          studentName: student?.name || 'Student',
        }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
      } else {
        setAiSuggestions([
          {
            title: 'Informal Mentor Check-in',
            objective: 'Understand root commute or family hurdles without punitive pressure.',
            approach: 'Discuss transit routes and recommend peer group morning coordination.',
          },
          {
            title: 'Course Materials Catch-up Support',
            objective: 'Provide laboratory slide deck and practice questions.',
            approach: 'Ensure the student does not fall behind in practical assessments.',
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Follow-ups & Constructive Resolution
            </h2>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              {followups.length} Total Tasks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Supportive interventions, mentor discussions, and policy walk-throughs. The system never sends automated disciplinary penalties or contacts parents without explicit human staff authorization.
          </p>
        </div>

        {currentRole !== 'student' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Assign Follow-up Task</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overdue */}
        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Overdue Follow-ups</span>
            <div className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</div>
            <span className="text-[11px] text-red-500">Target due date exceeded</span>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* Pending & In Progress */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Active / In Progress</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</div>
            <span className="text-[11px] text-amber-600">Scheduled mentoring</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Resolved & Closed</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{completedCount}</div>
            <span className="text-[11px] text-emerald-600">Completed support plans</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
          >
            <option value="All">All Statuses</option>
            <option value="Overdue">Overdue Attention</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Intervention Type</label>
          <select
            value={actionTypeFilter}
            onChange={(e) => setActionTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
          >
            <option value="All">All Types</option>
            <option value="Supportive Mentoring Session">Supportive Mentoring Session</option>
            <option value="Academic Guidance">Academic Guidance</option>
            <option value="Policy Clarification">Policy Clarification</option>
            <option value="Counselling Outreach">Counselling Outreach</option>
            <option value="Attendance Review">Attendance Review</option>
            <option value="Lab Safety Briefing">Lab Safety Briefing</option>
          </select>
        </div>
      </div>

      {/* Follow-up Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFollowups.map((task) => (
          <div
            key={task.id}
            className={`bg-white rounded-xl border p-5 shadow-xs transition space-y-3 ${
              task.status === 'Overdue'
                ? 'border-red-300 ring-1 ring-red-100'
                : task.status === 'Completed'
                ? 'border-emerald-200 bg-emerald-50/10'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {task.id}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{task.taskTitle}</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  task.status === 'Overdue'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : task.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {task.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
              <div>
                <span className="text-[11px] text-slate-500 block">Student:</span>
                <span className="font-semibold text-slate-800">
                  {task.studentName} ({task.classDivision})
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Assigned Staff:</span>
                <span className="font-semibold text-slate-800">{task.assignedStaff}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Due Date:</span>
                <span className={`font-semibold ${task.status === 'Overdue' ? 'text-red-600 font-bold' : 'text-slate-800'}`}>
                  {task.dueDate}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Type:</span>
                <span className="text-slate-700 font-medium">{task.actionType}</span>
              </div>
            </div>

            {task.incidentRef && (
              <div className="text-[11px] text-slate-500">
                Related to Incident Ref: <span className="font-mono text-blue-700 font-medium">{task.incidentRef}</span>
              </div>
            )}

            {task.resolutionSummary && (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-950">
                <span className="font-semibold block mb-0.5">Resolution Notes:</span>
                {task.resolutionSummary}
                {task.completedDate && (
                  <span className="block text-[10px] text-emerald-700 mt-1">
                    Completed on {new Date(task.completedDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}

            {/* Actions for Staff */}
            {currentRole !== 'student' && task.status !== 'Completed' && (
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => onUpdateFollowUp(task.id, 'In Progress')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => setCompletingTask(task)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition shadow-xs flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark Resolved & Closed</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredFollowups.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
            No follow-up tasks match the selected status.
          </div>
        )}
      </div>

      {/* Complete Task Modal */}
      {completingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 text-xs text-slate-700">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Complete Mentoring Follow-up
            </h3>
            <p className="text-slate-500 mb-3">
              Task: {completingTask.taskTitle} for {completingTask.studentName}
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resolution Summary & Next Steps *
                </label>
                <textarea
                  rows={4}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Summarize the supportive conversation (e.g. 'Met with student on Oct 14; reviewed bus schedule; student agreed to take 7:15 AM bus; peer mentoring in DBMS confirmed')..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCompletingTask(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  {submitting ? 'Saving...' : 'Record Completion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Follow-up Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-xs text-slate-700">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Assign Supportive Follow-up Action
            </h3>
            <p className="text-slate-500 mb-4">
              Plan mentor outreach, academic guidance, or policy walkthroughs.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student *</label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Action Type *</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as FollowUpTask['actionType'])}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Supportive Mentoring Session">Supportive Mentoring Session</option>
                    <option value="Academic Guidance">Academic Guidance</option>
                    <option value="Policy Clarification">Policy Clarification</option>
                    <option value="Counselling Outreach">Counselling Outreach</option>
                    <option value="Attendance Review">Attendance Review</option>
                    <option value="Lab Safety Briefing">Lab Safety Briefing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Commute and Morning Attendance Review"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Detailed Description</label>
                  <button
                    type="button"
                    onClick={handleFetchAISuggestions}
                    disabled={loadingSuggestions}
                    className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{loadingSuggestions ? 'Thinking...' : 'AI Suggestion Ideas'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Detail the constructive goal and specific points to discuss with student..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              {/* AI Suggestions Display */}
              {aiSuggestions && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                  <span className="font-semibold text-purple-950 block">AI Recommended Approaches:</span>
                  {aiSuggestions.map((sug, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setTaskTitle(sug.title);
                        setDescription(`${sug.objective} - ${sug.approach}`);
                      }}
                      className="p-2 bg-white rounded border border-purple-200 hover:bg-purple-100/50 cursor-pointer transition text-[11px]"
                    >
                      <strong>{sug.title}:</strong> {sug.objective}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Faculty Staff</label>
                  <input
                    type="text"
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Due Date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Link to Related Incident</label>
                <select
                  value={relatedIncidentId}
                  onChange={(e) => setRelatedIncidentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="">No linked incident (Independent task)</option>
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.referenceNumber} - {inc.studentName} ({inc.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  {submitting ? 'Creating...' : 'Assign Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
