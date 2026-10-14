import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Clock,
  Bot,
  PenTool,
  BarChart3,
  CheckSquare,
  GraduationCap,
  Award,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { Role } from '../../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: Role;
  overdueCount: number;
  openIncidentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  overdueCount,
  openIncidentsCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'faculty', 'student'],
      badge: null,
    },
    {
      id: 'students',
      label: 'Student Records',
      icon: Users,
      roles: ['admin', 'faculty'],
      badge: null,
    },
    {
      id: 'incidents',
      label: 'Incident Reports',
      icon: FileSpreadsheet,
      roles: ['admin', 'faculty', 'student'],
      badge: openIncidentsCount > 0 ? `${openIncidentsCount}` : null,
      badgeColor: 'bg-blue-900/60 text-blue-200 border border-blue-700/60',
    },
    {
      id: 'attendance',
      label: 'Attendance & Punctuality',
      icon: Clock,
      roles: ['admin', 'faculty', 'student'],
      badge: null,
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: Bot,
      roles: ['admin', 'faculty', 'student'],
      badge: 'Gemini',
      badgeColor: 'bg-purple-900/60 text-purple-200 border border-purple-700/60',
    },
    {
      id: 'report-writer',
      label: 'AI Report Writer',
      icon: PenTool,
      roles: ['admin', 'faculty'],
      badge: 'New',
      badgeColor: 'bg-indigo-900/60 text-indigo-200 border border-indigo-700/60',
    },
    {
      id: 'analytics',
      label: 'Analytics & Reporting',
      icon: BarChart3,
      roles: ['admin', 'faculty'],
      badge: null,
    },
    {
      id: 'followups',
      label: 'Follow-ups & Resolution',
      icon: CheckSquare,
      roles: ['admin', 'faculty', 'student'],
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : null,
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800',
    },
    {
      id: 'student-portal',
      label: 'Student Portal',
      icon: GraduationCap,
      roles: ['admin', 'faculty', 'student'],
      badge: currentRole === 'student' ? 'Active' : null,
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      id: 'project-demo',
      label: 'CIE-3 Project Demo',
      icon: Award,
      roles: ['admin', 'faculty', 'student'],
      badge: '20M',
      badgeColor: 'bg-emerald-900/80 text-emerald-300 border border-emerald-700',
    },
    {
      id: 'policies-audit',
      label: 'Rules & Audit Trail',
      icon: Scale,
      roles: ['admin', 'faculty'],
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#0B1528] text-slate-300 border-r border-slate-800 shrink-0 flex flex-col justify-between py-4">
      <div>
        {/* Department Header */}
        <div className="px-5 pb-4 mb-2 border-b border-slate-800/80">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Department Navigation
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-slate-200">Computer Engineering</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              CIE-3
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1 px-3">
          {menuItems
            .filter((item) => item.roles.includes(currentRole))
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      </div>

      {/* Footer Role Card */}
      <div className="px-4 mt-6">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Active Context
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                currentRole === 'admin'
                  ? 'bg-blue-900/80 text-blue-200'
                  : currentRole === 'faculty'
                  ? 'bg-indigo-900/80 text-indigo-200'
                  : 'bg-purple-900/80 text-purple-200'
              }`}
            >
              {currentRole.toUpperCase()}
            </span>
          </div>
          <p className="text-slate-300 font-medium truncate">
            {currentRole === 'admin'
              ? 'Prof. Dr. Archana Kulkarni'
              : currentRole === 'faculty'
              ? 'Prof. Rajesh Deshmukh'
              : 'Rahul Sharma (Student)'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {currentRole === 'student' ? 'TE-COMP-A (STU-001)' : 'Authorized Evaluator'}
          </p>
        </div>
      </div>
    </aside>
  );
};
