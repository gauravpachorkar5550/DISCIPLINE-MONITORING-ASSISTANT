import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
  RefreshCw,
  Info,
  Shield,
  FileCheck,
} from 'lucide-react';
import { StudentRecord, CollegeRule } from '../../types';

interface AIReportWriterViewProps {
  students: StudentRecord[];
  rules: CollegeRule[];
  onDraftAccepted: (draft: {
    studentId: string;
    studentName: string;
    category: any;
    description: string;
  }) => void;
  initialDraft?: { notes: string; category: string; studentName: string } | null;
}

export const AIReportWriterView: React.FC<AIReportWriterViewProps> = ({
  students,
  rules,
  onDraftAccepted,
  initialDraft,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 'STU-2024-001');
  const [rawNotes, setRawNotes] = useState(
    initialDraft?.notes ||
      'Several students were talking during the lecture, and the instructor paused twice to restore attention. Mobile phone notification chimed once from the back bench.'
  );
  const [category, setCategory] = useState(initialDraft?.category || 'Classroom disruption');
  const [ruleCode, setRuleCode] = useState('RULE-ENG-101');
  const [loading, setLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [editedDraft, setEditedDraft] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const categories = [
    'Classroom disruption',
    'Repeated lateness',
    'Attendance-related concern',
    'Damage to college property',
    'Disrespectful behaviour',
    'Violation of a documented college rule',
    'Other concern',
  ];

  const handleGenerateDraft = async () => {
    if (!rawNotes.trim()) {
      alert('Please enter your observed notes first.');
      return;
    }

    setLoading(true);
    const student = students.find((s) => s.id === selectedStudentId);

    try {
      const res = await fetch('/api/gemini/assist-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: rawNotes,
          category,
          subjectRule: ruleCode,
          observedStudents: student?.name || 'Student',
        }),
      });

      const data = await res.json();
      const text = data.draftText || 'Draft generated.';
      setGeneratedDraft(text);
      setEditedDraft(text);
    } catch (err: any) {
      alert('Failed to generate draft: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToIncident = () => {
    const student = students.find((s) => s.id === selectedStudentId);
    onDraftAccepted({
      studentId: selectedStudentId,
      studentName: student?.name || 'Student',
      category,
      description: editedDraft || rawNotes,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1e1b4b] to-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-600/30 border border-indigo-400/40">
            <PenTool className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI Incident Report Assistant</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Converts rough faculty observations into neutral, professional, factual documentation.
            </p>
          </div>
        </div>

        {/* Ethical Standards Card */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-indigo-200">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-indigo-400" />
            Removes subjective bias & exaggeration
          </span>
          <span className="flex items-center gap-1.5">
            <FileCheck className="h-3.5 w-3.5 text-indigo-400" />
            Separates observed facts from allegations
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
            Requires human faculty approval before filing
          </span>
        </div>
      </div>

      {/* Two-Column Editor: Input Notes on Left, AI Neutral Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Faculty Input */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Step 1: Enter Observed Facts</h3>
            <p className="text-slate-500 mt-0.5">
              Enter your initial notes just as witnessed in class or lab.
            </p>
          </div>

          {/* Student selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Student Involved
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
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
              <label className="block font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Applicable Policy Rule
            </label>
            <select
              value={ruleCode}
              onChange={(e) => setRuleCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
            >
              {rules.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code}: {r.title}
                </option>
              ))}
            </select>
          </div>

          {/* Rough Notes Textarea */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Your Observation Notes
            </label>
            <textarea
              rows={8}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="e.g. Student arrived 15 minutes late to the afternoon lab session; mentioned suburban local train was halted at Dadar station due to technical signaling issues..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleGenerateDraft}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Neutral Report with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze & Convert to Neutral Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Refined Report Preview & Editor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Step 2: Review & Edit Neutral Report</h3>
                <p className="text-slate-500 mt-0.5">
                  Editable draft highlighting facts, missing details, and constructive steps.
                </p>
              </div>

              {editedDraft && (
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {/* Content area */}
            <div className="mt-4">
              {generatedDraft ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Editable Final Report Text:
                  </label>
                  <textarea
                    rows={12}
                    value={editedDraft}
                    onChange={(e) => setEditedDraft(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <div className="h-72 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <PenTool className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="font-medium text-slate-600">No Draft Generated Yet</p>
                  <p className="text-[11px] max-w-xs mt-1">
                    Click "Analyze & Convert" on the left to structure your observations objectively.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          {generatedDraft && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Human in the Loop:</strong> Verify all dates, times, and workstation numbers before submitting.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleApplyToIncident}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition shadow-md flex items-center gap-1.5"
                >
                  <span>Transfer to Official Incident Register</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
