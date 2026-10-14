/**
 * Type definitions for Discipline Monitoring Assistant
 * CIE-3 AI Agent Design Challenge
 */

export type Role = 'admin' | 'faculty' | 'student';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  designation?: string;
  studentId?: string; // Set when role is student
  avatarBg?: string;
}

export interface StudentRecord {
  id: string; // e.g. STU-2024-001
  name: string;
  department: string;
  classDivision: string; // e.g. TE-COMP-A
  rollNumber: string;
  academicYear: string;
  mentor: string;
  attendance: {
    totalClasses: number;
    attendedClasses: number;
    percentage: number;
    lateArrivals: number;
  };
  openReportsCount: number;
  resolvedReportsCount: number;
  activeFollowupsCount: number;
  notes: string;
  status: 'Good Standing' | 'Academic/Attendance Review' | 'Active Support Plan';
}

export type IncidentCategory =
  | 'Classroom disruption'
  | 'Repeated lateness'
  | 'Attendance-related concern'
  | 'Damage to college property'
  | 'Disrespectful behaviour'
  | 'Violation of a documented college rule'
  | 'Other concern';

export type IncidentStatus =
  | 'Submitted'
  | 'Awaiting review'
  | 'Under review'
  | 'Awaiting student response'
  | 'Follow-up required'
  | 'Resolved'
  | 'Closed';

export interface IncidentHistoryItem {
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  note?: string;
}

export interface IncidentReport {
  id: string;
  referenceNumber: string; // e.g. INC-2024-1042
  dateTime: string;
  studentId: string;
  studentName: string;
  department: string;
  classDivision: string;
  category: IncidentCategory;
  description: string;
  relevantRule: string;
  peopleInvolved: string;
  witnessInfo: string;
  immediateActionTaken: string;
  followUpRequired: boolean;
  supportingNotes: string;
  confidentialNotes?: string; // Only visible to admin and faculty
  status: IncidentStatus;
  studentResponse?: string;
  studentResponseDate?: string;
  isVerifiedFact: boolean; // Distinguishes reported observation vs verified finding
  reportedBy: string;
  reportedByRole: Role;
  history: IncidentHistoryItem[];
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceAuditItem {
  timestamp: string;
  updatedBy: string;
  prevStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reason: string;
}

export interface AttendanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  department: string;
  classDivision: string;
  subject: string;
  status: AttendanceStatus;
  lateMinutes?: number;
  flaggedForOutreach: boolean;
  disputed: boolean;
  disputeReason?: string;
  resolutionNotes?: string;
  auditLog: AttendanceAuditItem[];
}

export type FollowUpStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

export interface FollowUpTask {
  id: string; // e.g. FUP-2024-089
  incidentId?: string;
  incidentRef?: string;
  studentId: string;
  studentName: string;
  department: string;
  classDivision: string;
  taskTitle: string;
  description: string;
  actionType:
    | 'Supportive Mentoring Session'
    | 'Academic Guidance'
    | 'Policy Clarification'
    | 'Counselling Outreach'
    | 'Attendance Review'
    | 'Lab Safety Briefing';
  assignedStaff: string;
  assignedStaffRole: string;
  dueDate: string; // YYYY-MM-DD
  status: FollowUpStatus;
  resolutionSummary?: string;
  completedDate?: string;
  createdAt: string;
}

export interface CorrectionRequest {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  type: 'Attendance Correction' | 'Incident Clarification' | 'Record Error';
  relatedRecordId: string;
  subject: string;
  explanation: string;
  status: 'Pending' | 'Under Review' | 'Accepted' | 'Clarification Needed' | 'Rejected';
  facultyResponse?: string;
  reviewedBy?: string;
  submittedAt: string;
  resolvedAt?: string;
}

export interface CollegeRule {
  code: string;
  title: string;
  category: string;
  description: string;
  constructiveApproach: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: Role;
  action: string;
  entityType: 'Incident' | 'Attendance' | 'FollowUp' | 'Correction' | 'Rule';
  entityId: string;
  details: string;
}

export interface TestCaseResult {
  id: number;
  title: string;
  category: string;
  description: string;
  expectedOutcome: string;
  actualOutcome: string;
  passed: boolean;
  executionTimeMs: number;
  details: string;
}
