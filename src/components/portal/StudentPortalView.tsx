import React, { useState } from 'react';
import {
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  BookOpen,
  Info,
  Shield,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import {
  StudentRecord,
  IncidentReport,
  FollowUpTask,
  CorrectionRequest,
  CollegeRule,
} from '../../types';

interface StudentPortalViewProps {
  currentStudent: StudentRecord;
  studentIncidents: IncidentReport[];
  studentFollowups: FollowUpTask[];
  studentCorrections: CorrectionRequest[];
  rules: CollegeRule[];
  onSubmitCorrection: (data: Partial<CorrectionRequest>) => Promise<void>;
  onSubmitIncidentResponse: (incidentId: string, response: string) => Promise<void>;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentStudent,
  studentIncidents,
  studentFollowups,
  studentCorrections,
  rules,
  onSubmitCorrection,
  onSubmitIncidentResponse,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'incidents' | 'corrections' | 'rules'>('attendance');

  // New correction request form
  const [corrType, setCorrType] = useState<CorrectionRequest['type']>('Attendance Correction');
  const [corrRecordId, setCorrRecordId] = useState('');
  const [corrSubject, setCorrSubject] = useState('');
  const [corrExplanation, setCorrExplanation] = useState('');
  const [submittingCorr, setSubmittingCorr] = useState(false);
  const [corrSuccess, setCorrSuccess] = useState(false);

  // Quick response state for incidents
  const [respondingIncidentId, setRespondingIncidentId] = useState<string | null>(null);
  const [incidentResponseText, setIncidentResponseText] = useState('');
  const [submittingResp, setSubmittingResp] = useState(false);

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!corrRecordId.trim() || !corrSubject.trim() || !corrExplanation.trim()) {
      alert('Please fill in the record reference, subject, and factual explanation.');
      return;
    }

    setSubmittingCorr(true);
    try {
      await onSubmitCorrection({
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        department: currentStudent.department,
        type: corrType,
        relatedRecordId: corrRecordId,
        subject: corrSubject,
        explanation: corrExplanation,
      });

      setCorrSuccess(true);
      setCorrRecordId('');
      setCorrSubject('');
      setCorrExplanation('');
      setTimeout(() => setCorrSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit correction request');
    } finally {
      setSubmittingCorr(false);
    }
  };

  const handleIncidentResponseSubmit = async (incidentId: string) => {
    if (!incidentResponseText.trim()) return;

    setSubmittingResp(true);
    try {
      await onSubmitIncidentResponse(incidentId, incidentResponseText);
      setRespondingIncidentId(null);
      setIncidentResponseText('');
      alert('Your response has been filed and sent to your mentor for review.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit response');
    } finally {
      setSubmittingResp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#2e1065] to-slate-900 p-6 rounded-xl border border-slate-800 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{currentStudent.name}</h2>
                <span className="font-mono text-xs bg-purple-950 text-purple-200 border border-purple-700 px-2 py-0.5 rounded">
                  {currentStudent.id}
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Class: {currentStudent.classDivision} • Roll No: {currentStudent.rollNumber} • Faculty Mentor: {currentStudent.mentor}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
              {currentStudent.status}
            </span>
          </div>
        </div>

        {/* Portal Notice */}
        <div className="mt-4 pt-3 border-t border-purple-900/60 flex items-center gap-2 text-xs text-purple-200">
          <Info className="h-4 w-4 text-purple-400 shrink-0" />
          <span>
            <strong>Demonstration Student Portal:</strong> Only permitted records for {currentStudent.name} are accessible. Internal faculty notes and other students' private records are strictly isolated.
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 py-2 rounded-lg transition ${
            activeTab === 'attendance'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          My Attendance Summary
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'incidents'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>My Reports & Concerns</span>
          {studentIncidents.length > 0 && (
            <span className="bg-purple-950 text-purple-200 text-[10px] px-1.5 py-0.2 rounded-full">
              {studentIncidents.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('corrections')}
          className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'corrections'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Request Record Correction</span>
          {studentCorrections.length > 0 && (
            <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded-full">
              {studentCorrections.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3.5 py-2 rounded-lg transition ${
            activeTab === 'rules'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          College Conduct Policy Rules
        </button>
      </div>

      {/* Tab 1: Attendance Summary */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Verified Attendance Percentage</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">
                {currentStudent.attendance.percentage}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {currentStudent.attendance.attendedClasses} out of {currentStudent.attendance.totalClasses} total lectures & labs
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Late Arrival Occurrences</span>
              <div className="text-3xl font-bold text-amber-700 mt-1">
                {currentStudent.attendance.lateArrivals}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Suburban train or transit commute notifications
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Institutional Status</span>
              <div className="text-3xl font-bold text-emerald-700 mt-1">Good</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Complies with minimum semester eligibility
              </p>
            </div>
          </div>

          {/* Academic Mentorship Guidance */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Faculty Mentor Note</h3>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              "{currentStudent.notes}"
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Incidents & Concerns */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {studentIncidents.map((inc) => (
            <div
              key={inc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {inc.referenceNumber}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{inc.category}</h3>
                </div>
                <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                  {inc.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                <span className="font-semibold block mb-0.5">Faculty Observation:</span>
                {inc.description}
              </div>

              <div className="text-[11px] text-slate-500">
                Applicable Policy: <strong>{inc.relevantRule}</strong> • Immediate Action: {inc.immediateActionTaken}
              </div>

              {/* Student Response Display */}
              {inc.studentResponse ? (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-purple-950">
                  <span className="font-semibold block mb-0.5">Your Submitted Clarification:</span>
                  "{inc.studentResponse}"
                  {inc.studentResponseDate && (
                    <span className="text-[10px] text-purple-600 block mt-1">
                      Submitted on {new Date(inc.studentResponseDate).toLocaleString()}
                    </span>
                  )}
                </div>
              ) : (
                <div className="pt-2">
                  {respondingIncidentId === inc.id ? (
                    <div className="space-y-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <label className="font-semibold text-purple-950 block">
                        Write Your Official Perspective or Explanation:
                      </label>
                      <textarea
                        rows={3}
                        value={incidentResponseText}
                        onChange={(e) => setIncidentResponseText(e.target.value)}
                        placeholder="State any factual context, commute delays, or misunderstandings respectfully..."
                        className="w-full bg-white border border-purple-300 rounded-lg p-2.5 text-xs text-slate-800"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setRespondingIncidentId(null)}
                          className="px-3 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={submittingResp}
                          onClick={() => handleIncidentResponseSubmit(inc.id)}
                          className="px-3 py-1.5 text-white bg-purple-700 hover:bg-purple-600 font-semibold rounded-md shadow-xs"
                        >
                          {submittingResp ? 'Submitting...' : 'Submit Clarification'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingIncidentId(inc.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
                    >
                      + Submit Written Clarification / Context
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {studentIncidents.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              No disciplinary concerns or incident reports recorded for your account.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Request Correction */}
      {activeTab === 'corrections' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-xs text-slate-700 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Submit Record Correction Request</h3>
              <p className="text-slate-500 mt-0.5">
                If you notice an erroneous absence mark or need to clarify an incident, submit formal review documentation.
              </p>
            </div>

            {corrSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 font-medium">
                Correction request registered successfully. Your faculty mentor has been notified.
              </div>
            )}

            <form onSubmit={handleCorrectionSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Request Type</label>
                <select
                  value={corrType}
                  onChange={(e) => setCorrType(e.target.value as CorrectionRequest['type'])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="Attendance Correction">Attendance Correction (Absence to Present/Excused)</option>
                  <option value="Incident Clarification">Incident Clarification / Dispute</option>
                  <option value="Record Error">General Record Error</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Related Record ID or Session Date *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ATT-2024-502 or INC-2024-1001 or 'Oct 11 OS Lab'"
                  value={corrRecordId}
                  onChange={(e) => setCorrRecordId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  placeholder="e.g. Attended Department Symposium with HOD Permission Gate Pass"
                  value={corrSubject}
                  onChange={(e) => setCorrSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Factual Explanation & Evidence Details *
                </label>
                <textarea
                  rows={4}
                  value={corrExplanation}
                  onChange={(e) => setCorrExplanation(e.target.value)}
                  placeholder="State the circumstances accurately (e.g. 'I was representing the college in the Smart Campus Hackathon in Seminar Hall 2; permission pass #GP-402 was countersigned by Dr. Kulkarni')..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingCorr}
                  className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-lg transition shadow-md disabled:opacity-50"
                >
                  {submittingCorr ? 'Submitting...' : 'Submit Official Review Request'}
                </button>
              </div>
            </form>
          </div>

          {/* Submitted Corrections Tracking */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-xs space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Status of Submitted Correction Requests</h3>
              <p className="text-slate-500 mt-0.5">Track faculty review progress and resolution notes.</p>
            </div>

            <div className="space-y-3">
              {studentCorrections.map((corr) => (
                <div key={corr.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{corr.subject}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        corr.status === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : corr.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {corr.status}
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">{corr.explanation}</p>

                  <div className="text-[10px] text-slate-500">
                    Ref: {corr.relatedRecordId} • Submitted: {new Date(corr.submittedAt).toLocaleDateString()}
                  </div>

                  {corr.facultyResponse && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-950 text-[11px]">
                      <strong>Faculty Mentor Outcome:</strong> {corr.facultyResponse}
                    </div>
                  )}
                </div>
              ))}

              {studentCorrections.length === 0 && (
                <div className="py-8 text-center text-slate-400">
                  You have not submitted any correction requests.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: College Conduct Policy Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.code} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {rule.code}
                  </span>
                  <h4 className="font-bold text-slate-900">{rule.title}</h4>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{rule.category}</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{rule.description}</p>
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900 text-[11px]">
                <strong>Constructive Approach:</strong> {rule.constructiveApproach}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
