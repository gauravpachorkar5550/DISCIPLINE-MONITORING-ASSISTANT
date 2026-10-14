/**
 * API Service for Discipline Monitoring Assistant
 * Handles HTTP requests with role-based headers and robust error recovery.
 */

import {
  StudentRecord,
  IncidentReport,
  AttendanceEntry,
  FollowUpTask,
  CorrectionRequest,
  CollegeRule,
  AuditLogEntry,
  Role,
  TestCaseResult,
} from '../types';

export class ApiService {
  private currentRole: Role = 'admin';
  private currentStudentId: string = 'STU-2024-001';
  private currentActorName: string = 'Prof. Dr. Archana Kulkarni';

  public setRole(role: Role, studentId?: string, actorName?: string) {
    this.currentRole = role;
    if (studentId) this.currentStudentId = studentId;
    if (actorName) {
      this.currentActorName = actorName;
    } else {
      if (role === 'admin') this.currentActorName = 'Prof. Dr. Archana Kulkarni (Dean/HOD)';
      else if (role === 'faculty') this.currentActorName = 'Prof. Rajesh Deshmukh';
      else this.currentActorName = 'Rahul Sharma (Student)';
    }
  }

  public getRole(): Role {
    return this.currentRole;
  }

  public getStudentId(): string {
    return this.currentStudentId;
  }

  public getActorName(): string {
    return this.currentActorName;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-demo-role': this.currentRole,
      'x-demo-actor': this.currentActorName,
    };
    if (this.currentRole === 'student' && this.currentStudentId) {
      headers['x-demo-student-id'] = this.currentStudentId;
    }
    return headers;
  }

  // Health
  public async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  }

  // Reset demo data
  public async resetData() {
    const res = await fetch('/api/reset-data', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // Run Test Suite
  public async runTestSuite(): Promise<{
    success: boolean;
    totalTests: number;
    passedCount: number;
    allPassed: boolean;
    results: TestCaseResult[];
  }> {
    const res = await fetch('/api/test-suite/run');
    return res.json();
  }

  // Students
  public async getStudents(): Promise<StudentRecord[]> {
    const res = await fetch('/api/students', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  }

  // Incidents
  public async getIncidents(): Promise<IncidentReport[]> {
    const res = await fetch('/api/incidents', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  }

  public async createIncident(data: Partial<IncidentReport>): Promise<IncidentReport> {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create incident');
    }
    return res.json();
  }

  public async updateIncident(id: string, updates: Partial<IncidentReport>, reason?: string): Promise<IncidentReport> {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ updates, reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update incident');
    }
    return res.json();
  }

  public async submitStudentResponse(id: string, responseText: string): Promise<IncidentReport> {
    const res = await fetch(`/api/incidents/${id}/response`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ responseText }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit response');
    }
    return res.json();
  }

  // Attendance
  public async getAttendance(): Promise<AttendanceEntry[]> {
    const res = await fetch('/api/attendance', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  }

  public async markAttendance(entry: Partial<AttendanceEntry>): Promise<AttendanceEntry> {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to record attendance');
    return res.json();
  }

  public async correctAttendance(id: string, newStatus: string, reason: string): Promise<AttendanceEntry> {
    const res = await fetch(`/api/attendance/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ newStatus, reason }),
    });
    if (!res.ok) throw new Error('Failed to correct attendance');
    return res.json();
  }

  // Follow-ups
  public async getFollowUps(): Promise<FollowUpTask[]> {
    const res = await fetch('/api/followups', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch follow-ups');
    return res.json();
  }

  public async createFollowUp(task: Partial<FollowUpTask>): Promise<FollowUpTask> {
    const res = await fetch('/api/followups', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create follow-up task');
    return res.json();
  }

  public async updateFollowUp(id: string, status: string, resolutionSummary?: string): Promise<FollowUpTask> {
    const res = await fetch(`/api/followups/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, resolutionSummary }),
    });
    if (!res.ok) throw new Error('Failed to update follow-up');
    return res.json();
  }

  // Corrections
  public async getCorrections(): Promise<CorrectionRequest[]> {
    const res = await fetch('/api/corrections', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch corrections');
    return res.json();
  }

  public async createCorrection(data: Partial<CorrectionRequest>): Promise<CorrectionRequest> {
    const res = await fetch('/api/corrections', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit correction request');
    return res.json();
  }

  public async reviewCorrection(id: string, status: string, facultyResponse: string): Promise<CorrectionRequest> {
    const res = await fetch(`/api/corrections/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, facultyResponse }),
    });
    if (!res.ok) throw new Error('Failed to review correction');
    return res.json();
  }

  // Rules & Audit
  public async getRules(): Promise<CollegeRule[]> {
    const res = await fetch('/api/rules');
    return res.json();
  }

  public async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch('/api/audit-logs', { headers: this.getHeaders() });
    return res.json();
  }

  // AI Gemini Calls
  public async askAIAssistant(message: string): Promise<{ text: string; isFallback: boolean; role: Role }> {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('AI Assistant request failed');
    return res.json();
  }

  public async assistReportDraft(data: {
    notes: string;
    category?: string;
    subjectRule?: string;
    observedStudents?: string;
  }): Promise<{ draftText: string; isFallback: boolean }> {
    const res = await fetch('/api/gemini/assist-report', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to generate report draft');
    return res.json();
  }

  public async suggestFollowUp(data: {
    incidentDescription: string;
    category: string;
    studentName: string;
  }): Promise<{ text?: string; suggestions?: any[]; isFallback: boolean }> {
    const res = await fetch('/api/gemini/suggest-followup', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  }
}

export const api = new ApiService();
