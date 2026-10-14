import React, { useState } from 'react';
import {
  Scale,
  History,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { CollegeRule, AuditLogEntry, Role } from '../../types';

interface PoliciesAuditViewProps {
  rules: CollegeRule[];
  auditLogs: AuditLogEntry[];
  currentRole: Role;
}

export const PoliciesAuditView: React.FC<PoliciesAuditViewProps> = ({
  rules,
  auditLogs,
  currentRole,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'audit'>('rules');
  const [searchAudit, setSearchAudit] = useState('');
  const [filterEntity, setFilterEntity] = useState('All');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.action.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.details.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchAudit.toLowerCase());

    const matchesEntity = filterEntity === 'All' || log.entityType === filterEntity;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Policies & Audit Trail</h2>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Department Governance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Institutional conduct standards and transparent system logs. All modifications to student records, incidents, or attendance retain an immutable audit trace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'rules'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Conduct Policies ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            System Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Tab 1: College Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.code}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs text-slate-700 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {rule.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{rule.title}</h3>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    {rule.category}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">{rule.description}</p>

                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-purple-950 text-[11px] leading-relaxed">
                  <strong className="block text-purple-900 mb-0.5">Constructive Restorative Protocol:</strong>
                  {rule.constructiveApproach}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Audit Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search actor, action, entity ID, or details..."
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800"
              />
            </div>

            <div>
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="All">All Entity Types</option>
                <option value="Incident">Incident</option>
                <option value="Attendance">Attendance</option>
                <option value="FollowUp">FollowUp</option>
                <option value="Correction">Correction</option>
              </select>
            </div>
          </div>

          {/* Audit Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Log ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor & Role</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-500">
                        {log.id}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{log.actor}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{log.actorRole}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {log.entityType} ({log.entityId})
                      </td>
                      <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-xs truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No audit records match your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
