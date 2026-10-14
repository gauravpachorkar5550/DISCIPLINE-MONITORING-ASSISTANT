/**
 * Data Storage Engine with JSON persistence and role-based filtering
 */

import fs from 'fs';
import path from 'path';
import {
  StudentRecord,
  IncidentReport,
  AttendanceEntry,
  FollowUpTask,
  CorrectionRequest,
  CollegeRule,
  AuditLogEntry,
  Role,
} from '../types';
import {
  initialStudents,
  initialIncidents,
  initialFollowUps,
  initialAttendanceEntries,
  initialCorrections,
  initialRules,
  initialAuditLogs,
} from './seedData';

interface DatabaseSchema {
  students: StudentRecord[];
  incidents: IncidentReport[];
  attendance: AttendanceEntry[];
  followups: FollowUpTask[];
  corrections: CorrectionRequest[];
  rules: CollegeRule[];
  auditLogs: AuditLogEntry[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

class Storage {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    this.updateAllFollowUpStatuses();
    this.recalculateAllStudentMetrics();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(fileContent) as DatabaseSchema;
      }
    } catch (err) {
      console.warn('Could not read existing store.json, initializing fresh seed data.', err);
    }

    const defaultData: DatabaseSchema = {
      students: initialStudents,
      incidents: initialIncidents,
      followups: initialFollowUps,
      attendance: initialAttendanceEntries,
      corrections: initialCorrections,
      rules: initialRules,
      auditLogs: initialAuditLogs,
    };

    this.saveDataDirect(defaultData);
    return defaultData;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving data to store.json:', err);
    }
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  public resetToSeed() {
    this.data = {
      students: JSON.parse(JSON.stringify(initialStudents)),
      incidents: JSON.parse(JSON.stringify(initialIncidents)),
      followups: JSON.parse(JSON.stringify(initialFollowUps)),
      attendance: JSON.parse(JSON.stringify(initialAttendanceEntries)),
      corrections: JSON.parse(JSON.stringify(initialCorrections)),
      rules: JSON.parse(JSON.stringify(initialRules)),
      auditLogs: [
        ...initialAuditLogs,
        {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'System Admin',
          actorRole: 'admin',
          action: 'RESET_DATA',
          entityType: 'Incident',
          entityId: 'ALL',
          details: 'Demo dataset reset to initial state.',
        },
      ],
    };
    this.updateAllFollowUpStatuses();
    this.recalculateAllStudentMetrics();
    this.save();
    return this.data;
  }

  // --- Students ---
  public getStudents(role: Role, studentId?: string): StudentRecord[] {
    if (role === 'student' && studentId) {
      return this.data.students.filter((s) => s.id === studentId);
    }
    return this.data.students;
  }

  public getStudentById(id: string): StudentRecord | undefined {
    return this.data.students.find((s) => s.id === id);
  }

  public recalculateAllStudentMetrics() {
    const today = new Date().toISOString().split('T')[0];
    this.data.students.forEach((student) => {
      const studentIncidents = this.data.incidents.filter((i) => i.studentId === student.id);
      const open = studentIncidents.filter((i) => i.status !== 'Resolved' && i.status !== 'Closed').length;
      const resolved = studentIncidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;

      const activeFups = this.data.followups.filter(
        (f) => f.studentId === student.id && (f.status === 'Pending' || f.status === 'In Progress' || f.status === 'Overdue')
      ).length;

      student.openReportsCount = open;
      student.resolvedReportsCount = resolved;
      student.activeFollowupsCount = activeFups;

      // Deterministic attendance calculation
      const entries = this.data.attendance.filter((a) => a.studentId === student.id);
      if (entries.length > 0) {
        const total = entries.length;
        const attended = entries.filter((a) => a.status === 'Present' || a.status === 'Late').length;
        const lates = entries.filter((a) => a.status === 'Late').length;
        // Blend with baseline course total
        const baseTotal = student.attendance.totalClasses || 60;
        const baseAttended = student.attendance.attendedClasses || 50;
        student.attendance.percentage = Number(((baseAttended / baseTotal) * 100).toFixed(1));
      }
    });
  }

  // --- Incidents ---
  public getIncidents(role: Role, studentId?: string): IncidentReport[] {
    let list = this.data.incidents;
    if (role === 'student') {
      if (!studentId) return [];
      list = list.filter((i) => i.studentId === studentId);
      // Strictly prevent student from accessing confidential internal notes
      return list.map((i) => {
        const copy = { ...i };
        delete copy.confidentialNotes;
        return copy;
      });
    }
    return list;
  }

  public getIncidentById(id: string, role: Role, studentId?: string): IncidentReport | null {
    const inc = this.data.incidents.find((i) => i.id === id || i.referenceNumber === id);
    if (!inc) return null;
    if (role === 'student') {
      if (inc.studentId !== studentId) return null; // Forbidden
      const sanitized = { ...inc };
      delete sanitized.confidentialNotes;
      return sanitized;
    }
    return inc;
  }

  public createIncident(
    payload: Omit<IncidentReport, 'id' | 'referenceNumber' | 'dateTime' | 'history'>,
    actor: string,
    actorRole: Role
  ): IncidentReport {
    const nextNum = 1000 + this.data.incidents.length + 1;
    const ref = `INC-2024-${nextNum}`;
    const now = new Date().toISOString();

    const newIncident: IncidentReport = {
      ...payload,
      id: ref,
      referenceNumber: ref,
      dateTime: now,
      history: [
        {
          timestamp: now,
          actor,
          role: actorRole,
          action: 'Incident Report Created',
          note: 'Initial factual documentation submitted.',
        },
      ],
    };

    this.data.incidents.unshift(newIncident);

    // Audit log
    this.addAuditLog({
      actor,
      actorRole,
      action: 'CREATE_INCIDENT',
      entityType: 'Incident',
      entityId: ref,
      details: `Created incident ${ref} for student ${payload.studentName} (${payload.category})`,
    });

    this.recalculateAllStudentMetrics();
    this.save();
    return newIncident;
  }

  public updateIncident(
    id: string,
    updates: Partial<IncidentReport>,
    actor: string,
    actorRole: Role,
    reason?: string
  ): IncidentReport | null {
    const index = this.data.incidents.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const existing = this.data.incidents[index];
    const now = new Date().toISOString();

    const historyItem = {
      timestamp: now,
      actor,
      role: actorRole,
      action: updates.status && updates.status !== existing.status ? `Status changed to ${updates.status}` : 'Report updated',
      note: reason || 'Record updated by authorized staff.',
    };

    const updated: IncidentReport = {
      ...existing,
      ...updates,
      history: [...existing.history, historyItem],
    };

    this.data.incidents[index] = updated;

    this.addAuditLog({
      actor,
      actorRole,
      action: 'UPDATE_INCIDENT',
      entityType: 'Incident',
      entityId: id,
      details: `Updated incident ${id}: ${historyItem.action} - ${reason || ''}`,
    });

    this.recalculateAllStudentMetrics();
    this.save();
    return updated;
  }

  public addStudentResponse(
    id: string,
    response: string,
    studentName: string,
    studentId: string
  ): IncidentReport | null {
    const index = this.data.incidents.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const inc = this.data.incidents[index];
    if (inc.studentId !== studentId) return null;

    const now = new Date().toISOString();
    inc.studentResponse = response;
    inc.studentResponseDate = now;
    if (inc.status === 'Awaiting student response') {
      inc.status = 'Under review';
    }

    inc.history.push({
      timestamp: now,
      actor: studentName,
      role: 'student',
      action: 'Student response submitted',
      note: 'Student provided formal written clarification.',
    });

    this.addAuditLog({
      actor: studentName,
      actorRole: 'student',
      action: 'SUBMIT_STUDENT_RESPONSE',
      entityType: 'Incident',
      entityId: id,
      details: `Student response registered for ${id}`,
    });

    this.save();
    return inc;
  }

  // --- Attendance ---
  public getAttendance(role: Role, studentId?: string): AttendanceEntry[] {
    if (role === 'student' && studentId) {
      return this.data.attendance.filter((a) => a.studentId === studentId);
    }
    return this.data.attendance;
  }

  public addAttendanceEntry(entry: Omit<AttendanceEntry, 'id' | 'auditLog'>, actor: string, actorRole: Role): AttendanceEntry {
    const id = `ATT-${Date.now().toString().slice(-6)}`;
    const newEntry: AttendanceEntry = {
      ...entry,
      id,
      auditLog: [
        {
          timestamp: new Date().toISOString(),
          updatedBy: actor,
          prevStatus: entry.status,
          newStatus: entry.status,
          reason: 'Initial attendance entry',
        },
      ],
    };

    this.data.attendance.unshift(newEntry);
    this.addAuditLog({
      actor,
      actorRole,
      action: 'RECORD_ATTENDANCE',
      entityType: 'Attendance',
      entityId: id,
      details: `Recorded ${entry.status} for ${entry.studentName} in ${entry.subject}`,
    });

    this.recalculateAllStudentMetrics();
    this.save();
    return newEntry;
  }

  public updateAttendanceStatus(
    id: string,
    newStatus: AttendanceEntry['status'],
    reason: string,
    actor: string,
    actorRole: Role
  ): AttendanceEntry | null {
    const entry = this.data.attendance.find((a) => a.id === id);
    if (!entry) return null;

    const prev = entry.status;
    entry.status = newStatus;
    if (newStatus === 'Present') {
      entry.disputed = false;
      entry.flaggedForOutreach = false;
    }

    entry.auditLog.push({
      timestamp: new Date().toISOString(),
      updatedBy: actor,
      prevStatus: prev,
      newStatus,
      reason,
    });

    this.addAuditLog({
      actor,
      actorRole,
      action: 'CORRECT_ATTENDANCE',
      entityType: 'Attendance',
      entityId: id,
      details: `Corrected attendance ${id} from ${prev} to ${newStatus}. Reason: ${reason}`,
    });

    this.recalculateAllStudentMetrics();
    this.save();
    return entry;
  }

  // --- Follow-ups ---
  public updateAllFollowUpStatuses() {
    const today = new Date().toISOString().split('T')[0];
    this.data.followups.forEach((fup) => {
      if (fup.status !== 'Completed') {
        if (fup.dueDate < today) {
          fup.status = 'Overdue';
        } else if (fup.status === 'Overdue' && fup.dueDate >= today) {
          fup.status = 'Pending';
        }
      }
    });
  }

  public getFollowUps(role: Role, studentId?: string): FollowUpTask[] {
    this.updateAllFollowUpStatuses();
    if (role === 'student' && studentId) {
      return this.data.followups.filter((f) => f.studentId === studentId);
    }
    return this.data.followups;
  }

  public createFollowUp(payload: Omit<FollowUpTask, 'id' | 'createdAt'>, actor: string, actorRole: Role): FollowUpTask {
    const id = `FUP-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    const initialStatus = payload.dueDate < today ? 'Overdue' : payload.status || 'Pending';

    const newTask: FollowUpTask = {
      ...payload,
      id,
      status: initialStatus,
      createdAt: now,
    };

    this.data.followups.unshift(newTask);
    this.addAuditLog({
      actor,
      actorRole,
      action: 'CREATE_FOLLOWUP',
      entityType: 'FollowUp',
      entityId: id,
      details: `Created follow-up task ${newTask.taskTitle} for ${newTask.studentName}`,
    });

    this.recalculateAllStudentMetrics();
    this.save();
    return newTask;
  }

  public updateFollowUpStatus(
    id: string,
    status: FollowUpTask['status'],
    resolutionSummary: string | undefined,
    actor: string,
    actorRole: Role
  ): FollowUpTask | null {
    const fup = this.data.followups.find((f) => f.id === id);
    if (!fup) return null;

    fup.status = status;
    if (status === 'Completed') {
      fup.resolutionSummary = resolutionSummary || 'Completed by authorized staff.';
      fup.completedDate = new Date().toISOString();
    }

    this.addAuditLog({
      actor,
      actorRole,
      action: 'UPDATE_FOLLOWUP',
      entityType: 'FollowUp',
      entityId: id,
      details: `Updated follow-up ${id} to ${status}`,
    });

    this.recalculateAllStudentMetrics();
    this.save();
    return fup;
  }

  // --- Correction Requests ---
  public getCorrections(role: Role, studentId?: string): CorrectionRequest[] {
    if (role === 'student' && studentId) {
      return this.data.corrections.filter((c) => c.studentId === studentId);
    }
    return this.data.corrections;
  }

  public createCorrection(payload: Omit<CorrectionRequest, 'id' | 'submittedAt' | 'status'>, studentName: string): CorrectionRequest {
    const id = `COR-${Date.now().toString().slice(-6)}`;
    const newReq: CorrectionRequest = {
      ...payload,
      id,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };

    this.data.corrections.unshift(newReq);
    this.addAuditLog({
      actor: studentName,
      actorRole: 'student',
      action: 'SUBMIT_CORRECTION',
      entityType: 'Correction',
      entityId: id,
      details: `Student ${studentName} filed correction request regarding ${payload.relatedRecordId}`,
    });

    this.save();
    return newReq;
  }

  public reviewCorrection(
    id: string,
    status: CorrectionRequest['status'],
    facultyResponse: string,
    actor: string,
    actorRole: Role
  ): CorrectionRequest | null {
    const req = this.data.corrections.find((c) => c.id === id);
    if (!req) return null;

    req.status = status;
    req.facultyResponse = facultyResponse;
    req.reviewedBy = actor;
    req.resolvedAt = new Date().toISOString();

    this.addAuditLog({
      actor,
      actorRole,
      action: 'REVIEW_CORRECTION',
      entityType: 'Correction',
      entityId: id,
      details: `Correction request ${id} reviewed with outcome: ${status}`,
    });

    this.save();
    return req;
  }

  // --- Rules ---
  public getRules(): CollegeRule[] {
    return this.data.rules;
  }

  // --- Audit Logs ---
  public getAuditLogs(role: Role): AuditLogEntry[] {
    if (role === 'student') return []; // Audit logs restricted from student access
    return this.data.auditLogs;
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const id = `AUD-${Date.now().toString().slice(-6)}`;
    this.data.auditLogs.unshift({
      ...entry,
      id,
      timestamp: new Date().toISOString(),
    });
  }
}

export const storage = new Storage();
