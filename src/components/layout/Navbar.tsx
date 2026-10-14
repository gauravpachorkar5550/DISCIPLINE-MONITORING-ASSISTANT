import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  GraduationCap,
  Bell,
  RefreshCw,
  AlertTriangle,
  Info,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Role } from '../../types';

interface NavbarProps {
  currentRole: Role;
  currentStudentId: string;
  onRoleChange: (role: Role, studentId?: string) => void;
  onResetData: () => void;
  overdueCount: number;
  pendingCorrectionsCount: number;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentStudentId,
  onRoleChange,
  onResetData,
  overdueCount,
  pendingCorrectionsCount,
  onNavigate,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const totalAlerts = overdueCount + pendingCorrectionsCount;

  return (
    <header className="sticky top-0 z-40 bg-[#0B1528] text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-900/40 ring-1 ring-white/15">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                  Discipline Monitoring Assistant
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-purple-950/80 text-purple-200 border border-purple-800/60 rounded">
                  CIE-3 Challenge • 20 Marks
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Promoting responsibility, fairness, and a positive campus environment
              </p>
            </div>
          </div>

          {/* Right Action Tools: Role Switcher & Alerts */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Demo Notice Tag */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800/80 text-slate-300 border border-slate-700 rounded-md">
              <Info className="h-3.5 w-3.5 text-blue-400" />
              <span>Fictional Demo Records</span>
            </div>

            {/* Role Switcher Pill Bar */}
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => onRoleChange('admin')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition flex items-center gap-1.5 ${
                  currentRole === 'admin'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Dean / Administrator View"
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>

              <button
                onClick={() => onRoleChange('faculty')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition flex items-center gap-1.5 ${
                  currentRole === 'faculty'
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Faculty Mentor View"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Faculty</span>
              </button>

              <button
                onClick={() => onRoleChange('student', currentStudentId)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition flex items-center gap-1.5 ${
                  currentRole === 'student'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Student Portal View"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Student</span>
              </button>
            </div>

            {/* If Student, Student Selector */}
            {currentRole === 'student' && (
              <div className="relative">
                <select
                  value={currentStudentId}
                  onChange={(e) => onRoleChange('student', e.target.value)}
                  className="bg-slate-800 text-purple-200 text-xs rounded-md border border-purple-800/70 px-2 py-1.5 pr-6 appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                >
                  <option value="STU-2024-001">STU-001: Rahul Sharma</option>
                  <option value="STU-2024-003">STU-003: Aman Verma</option>
                  <option value="STU-2024-004">STU-004: Ananya Patel</option>
                  <option value="STU-2024-005">STU-005: Devendra Naik</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-purple-400 absolute right-1.5 top-2 pointer-events-none" />
              </div>
            )}

            {/* Notifications Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition border border-slate-700"
                title="Notifications & Action Alerts"
              >
                <Bell className="h-4 w-4" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 border-[#0B1528]">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-xs tracking-wide text-white uppercase">
                      Action Required Alerts
                    </span>
                    <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      {totalAlerts} items
                    </span>
                  </div>

                  <div className="p-2 space-y-1.5 text-xs max-h-72 overflow-y-auto">
                    {overdueCount > 0 && (
                      <div
                        onClick={() => {
                          onNavigate('followups');
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-md bg-amber-950/40 border border-amber-800/50 hover:bg-amber-950/70 cursor-pointer transition flex items-start gap-2.5"
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-200">
                            {overdueCount} Overdue Follow-up Task{overdueCount > 1 ? 's' : ''}
                          </p>
                          <p className="text-[11px] text-amber-300/80">
                            Review target dates and assist assigned mentors.
                          </p>
                        </div>
                      </div>
                    )}

                    {pendingCorrectionsCount > 0 && (
                      <div
                        onClick={() => {
                          onNavigate('student-portal');
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-md bg-purple-950/40 border border-purple-800/50 hover:bg-purple-950/70 cursor-pointer transition flex items-start gap-2.5"
                      >
                        <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-purple-200">
                            {pendingCorrectionsCount} Correction Request{pendingCorrectionsCount > 1 ? 's' : ''}
                          </p>
                          <p className="text-[11px] text-purple-300/80">
                            Students awaiting attendance or incident response review.
                          </p>
                        </div>
                      </div>
                    )}

                    {totalAlerts === 0 && (
                      <div className="p-4 text-center text-slate-500">
                        All follow-ups and records are current. No pending critical actions.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Data Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700"
              title="Reset Demo Dataset to Original State"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-400" />
              Reset Demo Dataset?
            </h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              This will restore all fictional student records, incidents, attendance logs, and follow-ups to the baseline CIE-3 challenge state.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetData();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-md"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
