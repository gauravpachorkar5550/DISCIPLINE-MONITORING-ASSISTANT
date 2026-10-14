/**
 * Discipline Monitoring Assistant - Main Application Entry
 * Computer Engineering Department - CIE-3 AI Agent Design Challenge
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import {
  Role,
  StudentRecord,
  IncidentReport,
  AttendanceEntry,
  FollowUpTask,
  CorrectionRequest,
  CollegeRule,
  AuditLogEntry,
  TestCaseResult,
} from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentRecordsView } from './components/students/StudentRecordsView';
import { IncidentReportsView } from './components/incidents/IncidentReportsView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { AIReportWriterView } from './components/ai/AIReportWriterView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { FollowUpsView } from './components/followups/FollowUpsView';
import { StudentPortalView } from './components/portal/StudentPortalView';
import { Cie3ProjectDemoView } from './components/demo/Cie3ProjectDemoView';
import { PoliciesAuditView } from './components/policies/PoliciesAuditView';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [currentStudentId, setCurrentStudentId] = useState<string>('STU-2024-001');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Application Data States
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [followups, setFollowups] = useState<FollowUpTask[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [rules, setRules] = useState<CollegeRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Incident for inspect modal
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);

  // State for AI Report Writer transfer
  const [reportWriterInitial, setReportWriterInitial] = useState<{
    notes: string;
    category: string;
    studentName: string;
  } | null>(null);

  // Load all data with current role
  const loadData = useCallback(async () => {
    try {
      api.setRole(currentRole, currentStudentId);
      const [
        studentsData,
        incidentsData,
        attendanceData,
        followupsData,
        correctionsData,
        rulesData,
        auditLogsData,
      ] = await Promise.all([
        api.getStudents(),
        api.getIncidents(),
        api.getAttendance(),
        api.getFollowUps(),
        api.getCorrections(),
        api.getRules(),
        api.getAuditLogs(),
      ]);

      setStudents(studentsData);
      setIncidents(incidentsData);
      setAttendance(attendanceData);
      setFollowups(followupsData);
      setCorrections(correctionsData);
      setRules(rulesData);
      setAuditLogs(auditLogsData);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentRole, currentStudentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Role change handler
  const handleRoleChange = (role: Role, studentId?: string) => {
    const nextStudentId = studentId || currentStudentId;
    setCurrentRole(role);
    if (studentId) setCurrentStudentId(studentId);

    api.setRole(role, nextStudentId);

    // If changing to student, direct them to Student Portal or dashboard
    if (role === 'student' && (activeTab === 'students' || activeTab === 'report-writer' || activeTab === 'analytics' || activeTab === 'policies-audit')) {
      setActiveTab('student-portal');
    }
  };

  // Reset Demo Dataset
  const handleResetData = async () => {
    setLoading(true);
    try {
      await api.resetData();
      await loadData();
      alert('Demo dataset has been restored to baseline challenge state.');
    } catch (err: any) {
      alert('Reset failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Incident Operations
  const handleCreateIncident = async (payload: Partial<IncidentReport>) => {
    await api.createIncident(payload);
    await loadData();
  };

  const handleUpdateIncidentStatus = async (
    id: string,
    newStatus: IncidentReport['status'],
    reason: string
  ) => {
    await api.updateIncident(id, { status: newStatus }, reason);
    await loadData();
  };

  const handleSubmitStudentResponse = async (id: string, response: string) => {
    await api.submitStudentResponse(id, response);
    await loadData();
  };

  // Attendance Operations
  const handleRecordAttendance = async (entry: Partial<AttendanceEntry>) => {
    await api.markAttendance(entry);
    await loadData();
  };

  const handleCorrectAttendance = async (id: string, newStatus: string, reason: string) => {
    await api.correctAttendance(id, newStatus, reason);
    await loadData();
  };

  // Follow-up Operations
  const handleCreateFollowUp = async (task: Partial<FollowUpTask>) => {
    await api.createFollowUp(task);
    await loadData();
  };

  const handleUpdateFollowUp = async (
    id: string,
    status: FollowUpTask['status'],
    resolutionSummary?: string
  ) => {
    await api.updateFollowUp(id, status, resolutionSummary);
    await loadData();
  };

  // Corrections Operations
  const handleCreateCorrection = async (data: Partial<CorrectionRequest>) => {
    await api.createCorrection(data);
    await loadData();
  };

  // AI Assistant Call
  const handleAskAI = async (message: string) => {
    return api.askAIAssistant(message);
  };

  // Test Suite Execution
  const handleRunTests = async () => {
    const result = await api.runTestSuite();
    await loadData(); // Reload store in case tests created test records
    return result;
  };

  // Filter metrics
  const overdueCount = followups.filter((f) => f.status === 'Overdue').length;
  const pendingCorrectionsCount = corrections.filter((c) => c.status === 'Pending').length;
  const openIncidentsCount = incidents.filter(
    (i) => i.status !== 'Resolved' && i.status !== 'Closed'
  ).length;

  const currentStudentObj =
    students.find((s) => s.id === currentStudentId) ||
    students[0] || {
      id: 'STU-2024-001',
      name: 'Rahul Sharma',
      department: 'Computer Engineering',
      classDivision: 'TE-COMP-A',
      rollNumber: 'TE-A-24',
      academicYear: '2024-2025',
      mentor: 'Prof. Dr. Archana Kulkarni',
      attendance: { totalClasses: 64, attendedClasses: 56, percentage: 87.5, lateArrivals: 3 },
      openReportsCount: 1,
      resolvedReportsCount: 1,
      activeFollowupsCount: 1,
      notes: 'Attentive student; commute delay acknowledged.',
      status: 'Good Standing' as const,
    };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        currentStudentId={currentStudentId}
        onRoleChange={handleRoleChange}
        onResetData={handleResetData}
        overdueCount={overdueCount}
        pendingCorrectionsCount={pendingCorrectionsCount}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          currentRole={currentRole}
          overdueCount={overdueCount}
          openIncidentsCount={openIncidentsCount}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <RotateCcw className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Synchronizing college records & permissions...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  students={students}
                  incidents={incidents}
                  followups={followups}
                  attendance={attendance}
                  currentRole={currentRole}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onSelectIncident={(inc) => {
                    setSelectedIncident(inc);
                    setActiveTab('incidents');
                  }}
                />
              )}

              {activeTab === 'students' && (
                <StudentRecordsView
                  students={students}
                  incidents={incidents}
                  followups={followups}
                  currentRole={currentRole}
                  onOpenNewIncidentWithStudent={(student) => {
                    setActiveTab('incidents');
                  }}
                  onOpenNewFollowUpWithStudent={(student) => {
                    setActiveTab('followups');
                  }}
                />
              )}

              {activeTab === 'incidents' && (
                <IncidentReportsView
                  incidents={incidents}
                  students={students}
                  rules={rules}
                  currentRole={currentRole}
                  onCreateIncident={handleCreateIncident}
                  onUpdateIncidentStatus={handleUpdateIncidentStatus}
                  onSubmitStudentResponse={handleSubmitStudentResponse}
                  preselectedIncident={selectedIncident}
                  onLaunchReportWriter={(draft) => {
                    setReportWriterInitial(draft);
                    setActiveTab('report-writer');
                  }}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceView
                  attendance={attendance}
                  students={students}
                  currentRole={currentRole}
                  onRecordAttendance={handleRecordAttendance}
                  onCorrectAttendance={handleCorrectAttendance}
                  onRequestCorrectionAsStudent={async (recId, sub, expl) => {
                    await handleCreateCorrection({
                      studentId: currentStudentId,
                      studentName: currentStudentObj.name,
                      department: currentStudentObj.department,
                      type: 'Attendance Correction',
                      relatedRecordId: recId,
                      subject: sub,
                      explanation: expl,
                    });
                  }}
                />
              )}

              {activeTab === 'ai-assistant' && (
                <AIAssistantView
                  currentRole={currentRole}
                  currentStudentId={currentStudentId}
                  onAskAI={handleAskAI}
                />
              )}

              {activeTab === 'report-writer' && (
                <AIReportWriterView
                  students={students}
                  rules={rules}
                  initialDraft={reportWriterInitial}
                  onDraftAccepted={(draft) => {
                    handleCreateIncident({
                      studentId: draft.studentId,
                      studentName: draft.studentName,
                      category: draft.category,
                      description: draft.description,
                      relevantRule: 'RULE-ENG-101 (Classroom Decorum & Device Usage)',
                      peopleInvolved: draft.studentName,
                      witnessInfo: 'Documented via AI Report Assistant',
                      immediateActionTaken: 'Verbal reminder and mentor check-in scheduled',
                      followUpRequired: true,
                    });
                    setActiveTab('incidents');
                  }}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  incidents={incidents}
                  students={students}
                  attendance={attendance}
                  followups={followups}
                />
              )}

              {activeTab === 'followups' && (
                <FollowUpsView
                  followups={followups}
                  students={students}
                  incidents={incidents}
                  currentRole={currentRole}
                  onCreateFollowUp={handleCreateFollowUp}
                  onUpdateFollowUp={handleUpdateFollowUp}
                />
              )}

              {activeTab === 'student-portal' && (
                <StudentPortalView
                  currentStudent={currentStudentObj}
                  studentIncidents={incidents.filter((i) => i.studentId === currentStudentId)}
                  studentFollowups={followups.filter((f) => f.studentId === currentStudentId)}
                  studentCorrections={corrections.filter((c) => c.studentId === currentStudentId)}
                  rules={rules}
                  onSubmitCorrection={handleCreateCorrection}
                  onSubmitIncidentResponse={handleSubmitStudentResponse}
                />
              )}

              {activeTab === 'project-demo' && (
                <Cie3ProjectDemoView onRunTests={handleRunTests} />
              )}

              {activeTab === 'policies-audit' && (
                <PoliciesAuditView
                  rules={rules}
                  auditLogs={auditLogs}
                  currentRole={currentRole}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
