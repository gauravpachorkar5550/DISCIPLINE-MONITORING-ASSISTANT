/**
 * Discipline Monitoring Assistant - Full-Stack Express Server
 * Computer Engineering Department - CIE-3 AI Agent Design Challenge
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { storage } from './src/server/storage';
import { runCie3TestSuite } from './src/server/testSuite';
import { Role } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize Google GenAI SDK:', err);
  }
} else {
  console.warn('GEMINI_API_KEY is not defined in environment. Fallback responses enabled.');
}

const AGENT_SYSTEM_INSTRUCTIONS = `You are the Discipline Monitoring Assistant for a college. Your purpose is to help authorized faculty and administrators maintain accurate records, identify administrative follow-ups, and promote a respectful, safe, and supportive learning environment.

Use only the information provided by authorized application records. Never invent incidents, student behaviour, attendance records, dates, witnesses, or disciplinary findings.

Distinguish allegations, observed facts, verified findings, and unresolved questions. Use neutral language and avoid labelling students as bad, dangerous, dishonest, or problematic.

Do not infer intent, guilt, personality, or future misconduct from attendance patterns or incident reports. Do not recommend automatic punishment, suspension, or other serious consequences based solely on AI analysis.

Provide constructive, proportionate, and educational suggestions. For serious concerns, recommend review by the appropriate authorized college staff under established institutional procedures.

When information is incomplete, identify the missing information and ask for clarification. Never silently fill in missing facts.

Do not reveal confidential records to unauthorized users. Minimize unnecessary personal information in summaries and generated messages.

AI-generated summaries and recommendations are advisory only. Human staff must verify the facts and make all formal disciplinary decisions.

Be professional, fair, respectful, transparent, and supportive.`;

// Helper: Extract role and studentId from headers
function getAuthContext(req: Request): { role: Role; studentId?: string; actor: string } {
  const role = (req.headers['x-demo-role'] as Role) || 'admin';
  const studentId = (req.headers['x-demo-student-id'] as string) || undefined;
  const actor = (req.headers['x-demo-actor'] as string) || (role === 'admin' ? 'College Administrator' : role === 'faculty' ? 'Faculty Evaluator' : 'Student');
  return { role, studentId, actor };
}

// --- API Endpoints ---

// Health & Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiAvailable: Boolean(aiClient),
    model: 'gemini-3.8-flash',
    uptime: process.uptime(),
  });
});

// Reset data
app.post('/api/reset-data', (req: Request, res: Response) => {
  const resetData = storage.resetToSeed();
  res.json({ success: true, message: 'All demo datasets reset to realistic initial state.', data: resetData });
});

// Run CIE-3 Automated Test Suite
app.get('/api/test-suite/run', async (req: Request, res: Response) => {
  try {
    const results = await runCie3TestSuite();
    const passedCount = results.filter((r) => r.passed).length;
    res.json({
      success: true,
      totalTests: results.length,
      passedCount,
      allPassed: passedCount === results.length,
      results,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to run test suite' });
  }
});

// Students
app.get('/api/students', (req: Request, res: Response) => {
  const { role, studentId } = getAuthContext(req);
  const students = storage.getStudents(role, studentId);
  res.json(students);
});

// Incidents
app.get('/api/incidents', (req: Request, res: Response) => {
  const { role, studentId } = getAuthContext(req);
  const incidents = storage.getIncidents(role, studentId);
  res.json(incidents);
});

app.post('/api/incidents', (req: Request, res: Response) => {
  const { role, actor } = getAuthContext(req);
  if (role === 'student') {
    return res.status(403).json({ error: 'Students cannot file faculty incident reports. Use the correction request form instead.' });
  }

  const { studentId, studentName, department, classDivision, category, description, relevantRule, peopleInvolved, witnessInfo, immediateActionTaken, followUpRequired, supportingNotes, confidentialNotes } = req.body;

  if (!studentId || !studentName || !category || !description) {
    return res.status(400).json({ error: 'Missing mandatory fields: studentId, studentName, category, and description are required.' });
  }

  const newIncident = storage.createIncident(
    {
      studentId,
      studentName,
      department: department || 'Computer Engineering',
      classDivision: classDivision || 'TE-COMP-A',
      category,
      description,
      relevantRule: relevantRule || 'Documented College Code of Conduct',
      peopleInvolved: peopleInvolved || studentName,
      witnessInfo: witnessInfo || 'None specified',
      immediateActionTaken: immediateActionTaken || 'Observation noted',
      followUpRequired: Boolean(followUpRequired),
      supportingNotes: supportingNotes || '',
      confidentialNotes: confidentialNotes || '',
      status: 'Submitted',
      isVerifiedFact: false,
      reportedBy: actor,
      reportedByRole: role,
    },
    actor,
    role
  );

  res.status(201).json(newIncident);
});

app.patch('/api/incidents/:id', (req: Request, res: Response) => {
  const { role, actor } = getAuthContext(req);
  if (role === 'student') {
    return res.status(403).json({ error: 'Unauthorized to modify incident records directly.' });
  }

  const { id } = req.params;
  const { updates, reason } = req.body;

  const updated = storage.updateIncident(id, updates || {}, actor, role, reason);
  if (!updated) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(updated);
});

app.post('/api/incidents/:id/response', (req: Request, res: Response) => {
  const { studentId, actor } = getAuthContext(req);
  const { id } = req.params;
  const { responseText } = req.body;

  if (!responseText || !responseText.trim()) {
    return res.status(400).json({ error: 'Response text cannot be empty' });
  }

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID must be present in request context' });
  }

  const updated = storage.addStudentResponse(id, responseText, actor, studentId);
  if (!updated) {
    return res.status(403).json({ error: 'Incident not found or you are not authorized to respond to this report.' });
  }
  res.json(updated);
});

// Attendance
app.get('/api/attendance', (req: Request, res: Response) => {
  const { role, studentId } = getAuthContext(req);
  const entries = storage.getAttendance(role, studentId);
  res.json(entries);
});

app.post('/api/attendance', (req: Request, res: Response) => {
  const { role, actor } = getAuthContext(req);
  if (role === 'student') {
    return res.status(403).json({ error: 'Students are not authorized to record attendance.' });
  }

  const { date, studentId, studentName, department, classDivision, subject, status, lateMinutes, flaggedForOutreach } = req.body;
  if (!studentId || !studentName || !subject || !status) {
    return res.status(400).json({ error: 'Missing mandatory attendance fields' });
  }

  const entry = storage.addAttendanceEntry(
    {
      date: date || new Date().toISOString().split('T')[0],
      studentId,
      studentName,
      department: department || 'Computer Engineering',
      classDivision: classDivision || 'TE-COMP-A',
      subject,
      status,
      lateMinutes: lateMinutes ? parseInt(lateMinutes, 10) : undefined,
      flaggedForOutreach: Boolean(flaggedForOutreach),
      disputed: false,
    },
    actor,
    role
  );

  res.status(201).json(entry);
});

app.patch('/api/attendance/:id', (req: Request, res: Response) => {
  const { role, actor } = getAuthContext(req);
  if (role === 'student') {
    return res.status(403).json({ error: 'Students must submit attendance corrections through the correction request portal.' });
  }

  const { id } = req.params;
  const { newStatus, reason } = req.body;

  if (!newStatus || !reason) {
    return res.status(400).json({ error: 'New status and reason for correction are required for audit trail.' });
  }

  const updated = storage.updateAttendanceStatus(id, newStatus, reason, actor, role);
  if (!updated) {
    return res.status(404).json({ error: 'Attendance entry not found' });
  }
  res.json(updated);
});

// Follow-ups
app.get('/api/followups', (req: Request, res: Response) => {
  const { role, studentId } = getAuthContext(req);
  const followups = storage.getFollowUps(role, studentId);
  res.json(followups);
});

app.post('/api/followups', (req: Request, res: Response) => {
  const { role, actor } = getAuthContext(req);
  if (role === 'student') {
    return res.status(403).json({ error: 'Students cannot create follow-up assignments.' });
  }

  const { incidentId, incidentRef, studentId, studentName, department, classDivision, taskTitle, description, actionType, assignedStaff, assignedStaffRole, dueDate } = req.body;

  if (!studentId || !taskTitle || !dueDate || !actionType) {
    return res.status(400).json({ error: 'Missing required follow-up fields' });
  }

  const task = storage.createFollowUp(
    {
      incidentId,
      incidentRef,
      studentId,
      studentName,
      department: department || 'Computer Engineering',
      classDivision: classDivision || 'TE-COMP-A',
      taskTitle,
      description: description || 'Academic and mentoring follow-up check-in.',
      actionType,
      assignedStaff: assignedStaff || actor,
      assignedStaffRole: assignedStaffRole || 'Faculty Mentor',
      dueDate,
      status: 'Pending',
    },
    actor,
    role
  );

  res.status(201).json(task);
});

app.patch('/api/followups/:id', (req: Request, res: Response) => {
  const { role, actor } = getAuthContext(req);
  if (role === 'student') {
    return res.status(403).json({ error: 'Students cannot update follow-up task status directly.' });
  }

  const { id } = req.params;
  const { status, resolutionSummary } = req.body;

  const updated = storage.updateFollowUpStatus(id, status, resolutionSummary, actor, role);
  if (!updated) {
    return res.status(404).json({ error: 'Follow-up task not found' });
  }
  res.json(updated);
});

// Correction Requests
app.get('/api/corrections', (req: Request, res: Response) => {
  const { role, studentId } = getAuthContext(req);
  const corrections = storage.getCorrections(role, studentId);
  res.json(corrections);
});

app.post('/api/corrections', (req: Request, res: Response) => {
  const { studentId, actor } = getAuthContext(req);
  const { type, relatedRecordId, subject, explanation, department } = req.body;

  if (!relatedRecordId || !subject || !explanation) {
    return res.status(400).json({ error: 'Related record ID, subject, and explanation are required.' });
  }

  const effectiveStudentId = studentId || req.body.studentId || 'STU-2024-001';
  const effectiveStudentName = actor && actor !== 'Student' ? actor : (storage.getStudentById(effectiveStudentId)?.name || 'Rahul Sharma');

  const correction = storage.createCorrection(
    {
      studentId: effectiveStudentId,
      studentName: effectiveStudentName,
      department: department || 'Computer Engineering',
      type: type || 'Record Error',
      relatedRecordId,
      subject,
      explanation,
    },
    effectiveStudentName
  );

  res.status(201).json(correction);
});

app.patch('/api/corrections/:id', (req: Request, res: Response) => {
  const { role, actor } = getAuthContext(req);
  if (role === 'student') {
    return res.status(403).json({ error: 'Students cannot approve or review correction requests.' });
  }

  const { id } = req.params;
  const { status, facultyResponse } = req.body;

  if (!status || !facultyResponse) {
    return res.status(400).json({ error: 'Status and faculty response notes are required.' });
  }

  const updated = storage.reviewCorrection(id, status, facultyResponse, actor, role);
  if (!updated) {
    return res.status(404).json({ error: 'Correction request not found' });
  }
  res.json(updated);
});

// Rules & Audit
app.get('/api/rules', (req: Request, res: Response) => {
  res.json(storage.getRules());
});

app.get('/api/audit-logs', (req: Request, res: Response) => {
  const { role } = getAuthContext(req);
  res.json(storage.getAuditLogs(role));
});

// --- Server-Side Gemini API Routes ---

/**
 * 1. AI Discipline Assistant Chat
 * Strictly grounds answers in authorized records, distinguishes allegations vs verified facts,
 * avoids derogatory labels and punitive judgements.
 */
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const { role, studentId } = getAuthContext(req);
  const { message, conversationHistory } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  // Gather authorized context data
  const authorizedStudents = storage.getStudents(role, studentId);
  const authorizedIncidents = storage.getIncidents(role, studentId);
  const authorizedFollowups = storage.getFollowUps(role, studentId);
  const authorizedAttendance = storage.getAttendance(role, studentId);
  const authorizedRules = storage.getRules();

  const overdueFollowups = authorizedFollowups.filter((f) => f.status === 'Overdue');

  const contextData = {
    currentUserRole: role,
    studentScopeId: studentId || 'N/A (Staff view)',
    summaryStats: {
      totalAccessibleStudents: authorizedStudents.length,
      totalAccessibleIncidents: authorizedIncidents.length,
      awaitingReviewIncidents: authorizedIncidents.filter((i) => i.status === 'Submitted' || i.status === 'Awaiting review' || i.status === 'Under review').length,
      overdueFollowUpsCount: overdueFollowups.length,
    },
    overdueFollowups: overdueFollowups.map((f) => ({
      id: f.id,
      title: f.taskTitle,
      studentName: f.studentName,
      dueDate: f.dueDate,
      assignedStaff: f.assignedStaff,
      actionType: f.actionType,
    })),
    recentIncidentsSample: authorizedIncidents.slice(0, 6).map((i) => ({
      referenceNumber: i.referenceNumber,
      dateTime: i.dateTime,
      studentName: i.studentName,
      category: i.category,
      status: i.status,
      isVerifiedFact: i.isVerifiedFact ? 'Verified observation' : 'Pending review / Allegation',
      summary: i.description,
      hasStudentResponse: Boolean(i.studentResponse),
    })),
    collegeRules: authorizedRules.map((r) => ({ code: r.code, title: r.title, constructiveApproach: r.constructiveApproach })),
  };

  const promptContent = `
Current User Role: ${role.toUpperCase()} ${studentId ? `(Viewing Student Profile: ${studentId})` : ''}
Context Records Authorized for this User:
${JSON.stringify(contextData, null, 2)}

User Question or Request:
"${message}"

Instructions:
- Address the user respectfully based on their role (${role}).
- Use only the provided data records. If asked about a student or incident not in the authorized dataset, state clearly that you do not have verified records for that query.
- Maintain an encouraging, educational, and constructive tone.
- Never label students as problematic, bad, or guilty.
- Explicitly distinguish between reported observations and verified facts.
- Remind that formal disciplinary actions require human staff decision.
`;

  if (!aiClient) {
    // Graceful offline fallback providing deterministic answer
    const fallbackAnswer = generateFallbackChatResponse(message, role, contextData);
    return res.json({
      text: fallbackAnswer,
      isFallback: true,
      role,
    });
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out, using fallback rules.')), 4000)
    );

    const generatePromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContent,
      config: {
        systemInstruction: AGENT_SYSTEM_INSTRUCTIONS,
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const replyText = response.text || 'I have reviewed your query against the authorized college records. Please verify details with your faculty mentor.';
    res.json({
      text: replyText,
      isFallback: false,
      role,
    });
  } catch (err: any) {
    console.error('Gemini chat error:', err?.message || err);
    const fallbackAnswer = generateFallbackChatResponse(message, role, contextData);
    res.json({
      text: fallbackAnswer,
      isFallback: true,
      role,
    });
  }
});

/**
 * 2. AI Incident Report Writer
 * Takes raw faculty notes and transforms them into a neutral, factual, objective draft.
 */
app.post('/api/gemini/assist-report', async (req: Request, res: Response) => {
  const { notes, category, subjectRule, observedStudents } = req.body;

  if (!notes || typeof notes !== 'string' || notes.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide at least a few words describing the factual observation.' });
  }

  const prompt = `
Convert the following instructor/faculty observations into a structured, neutral, professional college incident report draft.

Observed Notes:
"${notes}"

Selected Category: ${category || 'General Classroom Conduct'}
Referenced Rule: ${subjectRule || 'Classroom Decorum'}
Observed Student(s): ${observedStudents || 'Fictional Demo Student'}

Requirements for the output:
1. Neutral, factual tone without exaggeration or emotional language.
2. Clearly separate "Observed Facts" from "Allegations or Assumptions".
3. Highlight any "Missing Details" that the faculty member should verify before submitting (e.g. exact timestamp, workstation number, witnesses).
4. Provide a recommended "Constructive Next Step" (e.g. mentor check-in, rule clarification).
5. Do NOT invent names, motives, punishments, or past infractions.
`;

  if (!aiClient) {
    const fallbackDraft = `### Factual Observation Summary
On the reported date, the following event was observed: "${notes.trim()}".

### Objective Observations
- Event occurred during scheduled academic session.
- Faculty noted the disruption and requested attention to be restored.
- Student complied once addressed.

### Missing Information to Verify
- Exact laboratory workstation or classroom seat number.
- Verified timestamp and presence of voluntary student witness.

### Constructive Recommendation
Schedule an informal 5-minute mentor dialogue to review classroom device guidelines (RULE-ENG-101) and understand any underlying transit or academic concerns.`;

    return res.json({
      draftText: fallbackDraft,
      isFallback: true,
    });
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI draft timed out, using structured template.')), 4000)
    );

    const generatePromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: AGENT_SYSTEM_INSTRUCTIONS,
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    res.json({
      draftText: response.text || notes,
      isFallback: false,
    });
  } catch (err: any) {
    console.error('Report assistant error:', err?.message || err);
    const fallbackDraft = `### Factual Observation Summary
On the reported date, the following event was observed: "${notes.trim()}".

### Objective Observations
- Event occurred during scheduled academic session.
- Faculty noted the disruption and requested attention to be restored.
- Student complied once addressed.

### Missing Information to Verify
- Exact laboratory workstation or classroom seat number.
- Verified timestamp and presence of voluntary student witness.

### Constructive Recommendation
Schedule an informal 5-minute mentor dialogue to review classroom device guidelines (RULE-ENG-101) and understand any underlying transit or academic concerns.`;

    res.json({
      draftText: fallbackDraft,
      isFallback: true,
    });
  }
});

/**
 * 3. AI Constructive Follow-up Suggestion
 */
app.post('/api/gemini/suggest-followup', async (req: Request, res: Response) => {
  const { incidentDescription, category, studentName } = req.body;

  const prompt = `
Given this incident observation in Computer Engineering:
Student: ${studentName || 'Student'}
Category: ${category}
Observation: "${incidentDescription}"

Suggest 3 constructive, supportive, non-punitive follow-up actions for the college faculty mentor.
For each action, provide:
1. Title
2. Educational Objective
3. Suggested Due Timeline (e.g., within 3 days)
4. Key talking point focused on empathy, clear expectations, and problem-solving (e.g., checking transportation, study schedule, or lab safety).
`;

  if (!aiClient) {
    return res.json({
      suggestions: [
        {
          title: 'Informal Mentor Check-in',
          objective: 'Understand root cause (e.g., transit delay or personal challenge) in a supportive setting.',
          timeline: 'Within 3 business days',
          approach: 'Acknowledge academic goals and discuss adjusting morning commute or study group arrangements.',
        },
        {
          title: 'College Policy & Resource Clarification',
          objective: 'Walk through institutional guidelines and supportive resources available on campus.',
          timeline: 'Within 5 business days',
          approach: 'Provide digital copies of course handouts and lab safety checklists.',
        },
        {
          title: 'Peer Learning Group Alignment',
          objective: 'Encourage collaborative engagement with class academic representatives.',
          timeline: 'Within 1 week',
          approach: 'Connect student with departmental study sessions to catch up on missed laboratory exercises.',
        },
      ],
      isFallback: true,
    });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: AGENT_SYSTEM_INSTRUCTIONS,
      },
    });

    res.json({
      text: response.text,
      isFallback: false,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate suggestions', details: err?.message });
  }
});

// Helper for deterministic offline chat responses
function generateFallbackChatResponse(query: string, role: Role, context: any): string {
  const q = query.toLowerCase();

  if (q.includes('overdue') || q.includes('follow-up') || q.includes('pending')) {
    const overdues = context.overdueFollowups;
    if (overdues && overdues.length > 0) {
      return `### Overdue Follow-up Tasks (${overdues.length} Identified)
The following administrative follow-ups have exceeded their target dates and require review:

${overdues.map((f: any, idx: number) => `${idx + 1}. **${f.title}** (Ref: ${f.id})
   - Assigned to: ${f.assignedStaff}
   - Student: ${f.studentName}
   - Action Type: ${f.actionType}
   - Target Due Date: ${f.dueDate} (Status: Overdue)`).join('\n\n')}

*Recommendation: Contact the assigned faculty mentor to reschedule or complete these supportive sessions.*`;
    }
    return 'There are currently no overdue follow-up tasks in the authorized records. All active action items are within their scheduled timeframes.';
  }

  if (q.includes('summarize') && (q.includes('week') || q.includes('incident'))) {
    return `### Discipline Records Summary
- **Total Accessible Incidents:** ${context.summaryStats.totalAccessibleIncidents}
- **Awaiting Review:** ${context.summaryStats.awaitingReviewIncidents}
- **Pending/Overdue Follow-ups:** ${context.summaryStats.overdueFollowUpsCount}

**Key Observations by Category:**
- *Classroom Decorum:* Handled through verbal reminders; students cooperative.
- *Repeated Lateness:* Associated primarily with municipal transit schedule delays rather than intentional absence.
- *Property / Equipment:* Routine hardware wear-and-tear in computing labs with no verified vandalism.

*Reminder: All incident entries are treated as reported observations until verified by faculty mentors and student responses.*`;
  }

  if (q.includes('attendance') && (q.includes('incorrect') || q.includes('dispute') || q.includes('what can i do'))) {
    return `### Student Guide: Attendance Correction Request
If you believe an attendance mark for a lecture or practical session is inaccurate, you can submit a formal clarification through your **Student Portal**:

1. Navigate to the **Attendance & Punctuality** tab or **Student Portal**.
2. Locate the specific session date and click **"Request Correction"**.
3. State the factual reason (e.g. participation in approved department symposium, medical leave certificate, or suburban train disruption).
4. Your subject faculty or class mentor will review the entry and update the official record with an audit note.

*College policy ensures that attendance concerns trigger supportive dialogue rather than automatic penalization.*`;
  }

  if (q.includes('difference') && q.includes('allegation')) {
    return `### Understanding Reported Observations vs. Verified Findings
In accordance with college fairness and procedural justice principles:

1. **Reported Observation / Allegation:**
   An initial statement of what was noticed by an instructor or peer (e.g. "student arrived after lecture began"). It reflects an unverified perception and carries no presumption of misconduct or fault.

2. **Verified Fact / Finding:**
   A conclusion reached only after:
   - Consulting the student to hear their perspective.
   - Verifying external evidence (such as gate passes, medical slips, or transit delays).
   - Review by the designated faculty mentor or department committee.

*The Discipline Monitoring Assistant maintains this strict boundary to prevent premature labelling or unjust consequences.*`;
  }

  if (q.includes('neutral') || q.includes('write')) {
    return `### Guidelines for Writing a Neutral Incident Report
When documenting an observation:
1. **Stick strictly to verifiable sensory facts:** Record what was seen or heard without emotional modifiers (e.g., say *"mobile phone alert rang twice"* instead of *"student showed blatant disregard"*).
2. **Avoid mind-reading motives:** Do not guess intent (e.g., avoiding *"student deliberately ignored instructions"*).
3. **Record immediate constructive action:** Note if the issue was resolved promptly upon verbal reminder.
4. **Identify needed context:** Leave room for student explanation before finalizing any review.`;
  }

  return `### Discipline Monitoring Assistant
I am ready to assist you in managing student records, reviewing attendance patterns, drafting neutral incident reports, or identifying constructive follow-ups.

**Authorized Records Summary:**
- Student Records accessible: ${context.summaryStats.totalAccessibleStudents}
- Active Incidents in scope: ${context.summaryStats.totalAccessibleIncidents}
- Pending / Overdue Follow-ups: ${context.summaryStats.overdueFollowUpsCount}

Feel free to ask for a weekly incident summary, check overdue tasks, or ask how to draft a constructive report.`;
}

// Start Server and mount Vite / Static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn('Vite middleware could not be loaded dynamically:', viteErr);
      app.use(express.static(path.resolve(__dirname, 'dist')));
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Discipline Monitoring Assistant server running on port ${PORT}`);
  });
}

startServer();
