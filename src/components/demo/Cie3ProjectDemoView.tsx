import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Shield,
  Layers,
  Cpu,
  ArrowRight,
  Database,
  Lock,
  Bot,
  Terminal,
  Clock,
  Sparkles,
  Info,
  Scale,
  Users,
} from 'lucide-react';
import { TestCaseResult } from '../../types';

interface Cie3ProjectDemoViewProps {
  onRunTests: () => Promise<{
    success: boolean;
    totalTests: number;
    passedCount: number;
    allPassed: boolean;
    results: TestCaseResult[];
  }>;
}

export const Cie3ProjectDemoView: React.FC<Cie3ProjectDemoViewProps> = ({ onRunTests }) => {
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'tests' | 'conversations' | 'safeguards'>('overview');

  const handleExecuteTests = async () => {
    setRunningTests(true);
    try {
      const data = await onRunTests();
      setTestResults(data.results);
    } catch (err: any) {
      alert('Error running test suite: ' + err.message);
    } finally {
      setRunningTests(false);
    }
  };

  const sampleConversations = [
    {
      title: 'Conversation 1 — Weekly Summary',
      role: 'Faculty',
      query: '“Summarize this week’s incident reports.”',
      outcome: 'Agent compiles aggregated reports categorized by Classroom Decorum, Punctuality, and Equipment status, withholding private student names to respect confidentiality.',
    },
    {
      title: 'Conversation 2 — Neutral Report Writing',
      role: 'Faculty',
      query: '“Help me write a report about repeated classroom interruptions.”',
      outcome: 'Agent prompts for verifiable sensory observations, then synthesizes a neutral draft distinguishing facts from subjective interpretations without derogatory labels.',
    },
    {
      title: 'Conversation 3 — Overdue Follow-ups',
      role: 'Administrator / Faculty',
      query: '“Which follow-up tasks are overdue?”',
      outcome: 'Agent queries the deterministic task register, identifies tasks where target due date < current date, and outputs mentor assignments with reference numbers.',
    },
    {
      title: 'Conversation 4 — Student Response Guide',
      role: 'Student',
      query: '“I believe the attendance entry for Monday is incorrect. What can I do?”',
      outcome: 'Agent explains the collegiate procedural justice process, directing the student to the Correction Request form with required proof (gate pass, transit slip).',
    },
    {
      title: 'Conversation 5 — Constructive Support',
      role: 'Faculty Mentor',
      query: '“A student has repeatedly arrived late. What should I do?”',
      outcome: 'Agent recommends scheduling a private mentor check-in to investigate commute or family barriers, offering lecture slides beforehand, and avoiding automatic sanctions.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#1a103c] to-[#0B1528] p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-300">
                <Award className="h-6 w-6" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Computer Engineering • Evaluation Challenge
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  CIE-3 AI Agent Design Challenge (20 Marks)
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Discipline Monitoring Assistant is an ethical, privacy-preserving institutional decision-support system. It decouples high-level natural language understanding (Google Gemini) from mission-critical deterministic rules (attendance math, access control, audit logs).
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={handleExecuteTests}
              disabled={runningTests}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {runningTests ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  <span>Executing 10 Verification Tests...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Run Automated Test Suite (10 Tests)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'overview', label: '1. Problem & Objectives' },
            { id: 'architecture', label: '2. System Architecture' },
            { id: 'tests', label: '3. Automated Test Suite (10 Scenarios)' },
            { id: 'conversations', label: '4. Five Sample AI Interactions' },
            { id: 'safeguards', label: '5. Ethics, Safeguards & Future Scope' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview, Objectives, Existing vs Proposed */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Problem Statement & Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs text-slate-700">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Problem Statement
              </h3>
              <p className="leading-relaxed text-slate-600">
                Traditional collegiate discipline systems suffer from fragmented manual paper registers, delayed mentor outreach, emotional or subjective report phrasing, and punitive knee-jerk responses. Furthermore, naive AI implementations risk biased profiling, predictive misconduct scoring, and breaches of student confidentiality.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-medium">
                <strong>Core Challenge:</strong> How do we build an AI-powered assistant that improves faculty documentation quality and flags overdue mentoring while strictly preventing biased labelling, unverified accusations, and automated punishments?
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs text-slate-700">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Project Objectives
              </h3>
              <ul className="space-y-2 text-slate-600 list-disc list-inside leading-relaxed">
                <li>
                  <strong>Decoupled Architecture:</strong> Combine Gemini 3.8 Flash for neutral language processing with deterministic backend business logic for record isolation.
                </li>
                <li>
                  <strong>Procedural Justice:</strong> Ensure students possess right-to-respond and record-correction workflows before reports are finalized.
                </li>
                <li>
                  <strong>Strict Non-Punitive Philosophy:</strong> Prohibit predictive misconduct scoring and public student ranking lists.
                </li>
                <li>
                  <strong>Role-Based Access Control (RBAC):</strong> Isolate student records so peers cannot view private notes, and strip counselor notes automatically.
                </li>
              </ul>
            </div>
          </div>

          {/* Existing System vs Proposed System Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-900 text-sm">
              Comparative Analysis: Conventional Disciplinary Tracking vs. Proposed AI Assistant
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="p-3.5">Parameter</th>
                    <th className="p-3.5 text-slate-600">Conventional College System</th>
                    <th className="p-3.5 text-blue-900 bg-blue-50/70">Proposed Discipline Monitoring Assistant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Incident Documentation</td>
                    <td className="p-3.5">Subjective, hasty, emotionally charged instructor notes.</td>
                    <td className="p-3.5 bg-blue-50/30 font-medium text-slate-900">
                      AI Report Assistant converts raw notes into neutral factual summaries separating observations from allegations.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Attendance Interpretation</td>
                    <td className="p-3.5">Low attendance immediately treated as disobedience or exam bar.</td>
                    <td className="p-3.5 bg-blue-50/30 font-medium text-slate-900">
                      Triggers supportive outreach (investigating commute hurdles or medical leaves) without premature sanctions.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Student Rights</td>
                    <td className="p-3.5">Unilateral faculty decisions; no formal student response channel.</td>
                    <td className="p-3.5 bg-blue-50/30 font-medium text-slate-900">
                      Dedicated Student Portal with written clarification and attendance dispute mechanism.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Accountability & Audits</td>
                    <td className="p-3.5">Paper changes without timestamp or actor attribution.</td>
                    <td className="p-3.5 bg-blue-50/30 font-medium text-slate-900">
                      Immutable backend audit log with actor ID, timestamp, and mandatory rationale.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Decision Authority</td>
                    <td className="p-3.5">Often delayed or arbitrary.</td>
                    <td className="p-3.5 bg-blue-50/30 font-medium text-slate-900">
                      AI is advisory only. Human faculty mentors and deans retain 100% formal decision authority.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: System Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Architecture Diagram Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900 text-sm">System Architectural Pipeline</h3>
            <p className="text-slate-500">
              The application explicitly separates language understanding (probabilistic LLM) from record management (deterministic logic):
            </p>

            {/* Visual Flow Blocks */}
            <div className="p-5 bg-slate-900 rounded-xl text-white space-y-4 overflow-x-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-xs font-mono">
                <div className="bg-blue-900/80 p-3 rounded-lg border border-blue-700 w-full sm:w-36">
                  <Users className="h-4 w-4 mx-auto mb-1 text-blue-300" />
                  <span>Faculty or Student</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 rotate-90 sm:rotate-0" />
                <div className="bg-indigo-900/80 p-3 rounded-lg border border-indigo-700 w-full sm:w-40">
                  <Shield className="h-4 w-4 mx-auto mb-1 text-indigo-300" />
                  <span>Role-Based Web UI (React/TS)</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 rotate-90 sm:rotate-0" />
                <div className="bg-purple-900/80 p-3 rounded-lg border border-purple-700 w-full sm:w-44">
                  <Cpu className="h-4 w-4 mx-auto mb-1 text-purple-300" />
                  <span>Discipline Assistant Server (Node Express)</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 rotate-90 sm:rotate-0" />
                <div className="bg-pink-900/80 p-3 rounded-lg border border-pink-700 w-full sm:w-40">
                  <Bot className="h-4 w-4 mx-auto mb-1 text-pink-300" />
                  <span>Gemini API (3.8 Flash)</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 rotate-90 sm:rotate-0" />
                <div className="bg-emerald-900/80 p-3 rounded-lg border border-emerald-700 w-full sm:w-36">
                  <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-emerald-300" />
                  <span>Human Verification & Resolution</span>
                </div>
              </div>
            </div>

            {/* Division of Responsibility Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                <span className="font-bold text-purple-950 flex items-center gap-1.5 text-xs">
                  <Bot className="h-4 w-4 text-purple-700" />
                  Google Gemini 3.8 Flash Responsibilities
                </span>
                <ul className="space-y-1 text-purple-900 text-[11px] list-disc list-inside">
                  <li>Natural language query interpretation and dialogue synthesis.</li>
                  <li>Transforming subjective notes into neutral, objective drafts.</li>
                  <li>Identifying missing factual context in incident reports.</li>
                  <li>Recommending restorative, educational mentoring actions.</li>
                  <li>Enforcing non-punitive, supportive language guidelines.</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
                <span className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                  <Database className="h-4 w-4 text-blue-700" />
                  Deterministic Application Logic Responsibilities
                </span>
                <ul className="space-y-1 text-blue-900 text-[11px] list-disc list-inside">
                  <li>Calculating attendance percentages (attended / total * 100).</li>
                  <li>Overdue task identification (comparing due date vs current date).</li>
                  <li>Enforcing Role-Based Access Control and student isolation.</li>
                  <li>Stripping confidential counselor notes from student responses.</li>
                  <li>Maintaining immutable audit logs for every record alteration.</li>
                </ul>
              </div>
            </div>

            {/* Exact System Prompt Transparency Card */}
            <div className="p-4 bg-slate-900 rounded-xl text-slate-300 space-y-2 border border-slate-800">
              <span className="font-bold text-white text-xs block">
                Agent System Instructions (Enforced at Server API Gateway):
              </span>
              <p className="font-mono text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed text-slate-300 max-h-48 overflow-y-auto">
                "You are the Discipline Monitoring Assistant for a college. Your purpose is to help authorized faculty and administrators maintain accurate records, identify administrative follow-ups, and promote a respectful, safe, and supportive learning environment.
                Use only the information provided by authorized application records. Never invent incidents, student behaviour, attendance records, dates, witnesses, or disciplinary findings.
                Distinguish allegations, observed facts, verified findings, and unresolved questions. Use neutral language and avoid labelling students as bad, dangerous, dishonest, or problematic.
                Do not infer intent, guilt, personality, or future misconduct from attendance patterns or incident reports. Do not recommend automatic punishment, suspension, or other serious consequences based solely on AI analysis.
                Provide constructive, proportionate, and educational suggestions. For serious concerns, recommend review by the appropriate authorized college staff under established institutional procedures..."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Automated Test Suite */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                CIE-3 Benchmark Test Runner (10 Evaluation Cases)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Executes live verification tests on backend endpoints, deterministic math, RBAC data isolation, and API resilience.
              </p>
            </div>

            <button
              onClick={handleExecuteTests}
              disabled={runningTests}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>{runningTests ? 'Running...' : 'Run All 10 Tests'}</span>
            </button>
          </div>

          {/* Test results table */}
          {testResults ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800">Live Test Run Results</span>
                <span className="font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                  {testResults.filter((r) => r.passed).length} / {testResults.length} Tests Passed
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {testResults.map((t) => (
                  <div key={t.id} className="p-4 hover:bg-slate-50/70 transition space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            t.passed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                          }`}
                        >
                          {t.passed ? '✓' : '✗'}
                        </span>
                        <span className="font-bold text-slate-900">
                          Test #{t.id}: {t.title}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {t.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {t.executionTimeMs} ms
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px]">{t.description}</p>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                      <div>
                        <strong className="text-slate-700">Expected:</strong> {t.expectedOutcome}
                      </div>
                      <div className={t.passed ? 'text-emerald-800' : 'text-red-700'}>
                        <strong>Actual:</strong> {t.actualOutcome}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
              <Terminal className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700 text-xs">
                Test Suite Ready for Execution
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Click "Run All 10 Tests" above to verify incident creation, input validation, deterministic attendance math, overdue detection, RBAC data isolation, and confidential note shielding.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Five Sample AI Interactions */}
      {activeTab === 'conversations' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
            Below are the five benchmark conversational scenarios demonstrating the AI agent's contextual adherence, neutral phrasing, and procedural guidance.
          </div>

          <div className="space-y-4">
            {sampleConversations.map((conv, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{conv.title}</h4>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded">
                    Role: {conv.role}
                  </span>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200 text-purple-950 font-medium">
                  <strong>User Input:</strong> {conv.query}
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  <strong>AI Evaluation Outcome:</strong> {conv.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Safeguards, Limitations, Future Scope */}
      {activeTab === 'safeguards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
            {/* Privacy & Fairness */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                Privacy & Fairness Safeguards
              </h3>
              <ul className="space-y-2 text-slate-600 list-disc list-inside leading-relaxed">
                <li><strong>No Covert Surveillance:</strong> Zero facial recognition, sentiment detection, or background location tracking.</li>
                <li><strong>No Predictive Punishment:</strong> System never computes "recidivism risk scores" or student rankings.</li>
                <li><strong>Role Isolation:</strong> Students can never query peer records or read internal faculty counselor notes.</li>
                <li><strong>Immutable Audits:</strong> Every correction and status change records actor, timestamp, and rationale.</li>
              </ul>
            </div>

            {/* Limitations & Future Scope */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Limitations & Future Scope
              </h3>
              <ul className="space-y-2 text-slate-600 list-disc list-inside leading-relaxed">
                <li><strong>Current Scope:</strong> Demonstrates single-college department deployment with fictional seed datasets.</li>
                <li><strong>Future Integration:</strong> Connect directly with university LMS (e.g. Moodle, Google Classroom) via OAuth.</li>
                <li><strong>Multilingual Support:</strong> Add local language translation (Marathi, Hindi) for parent notifications.</li>
                <li><strong>Human Authority:</strong> Emphasizes AI as advisory decision-support rather than autonomous judge.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
