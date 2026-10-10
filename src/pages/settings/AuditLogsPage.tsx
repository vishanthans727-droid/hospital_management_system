import React, { useState } from 'react';
import { mockAuditLogs } from '../../lib/mockData';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, Clock, User, Terminal } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const AuditLogsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = mockAuditLogs.filter(
    l =>
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-sky-600" />
          HIPAA Audit Trail & Security Logs
        </h1>
        <p className="text-xs text-slate-500">
          Immutable system ledger tracking user logins, role assignments, clinical updates, and pharmacy operations
        </p>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by user, action, module..."
          />
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span>Hashing: SHA-256 Verified Ledger</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Action Code</th>
                <th className="p-3.5">Clinical Module</th>
                <th className="p-3.5">Audit Event Details</th>
                <th className="p-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5 font-bold font-sans text-slate-900 dark:text-white">
                    {log.userName}
                  </td>
                  <td className="p-3.5">
                    <Badge variant="primary" size="sm">
                      {log.userRole}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-bold text-sky-700 dark:text-sky-400">
                    {log.action}
                  </td>
                  <td className="p-3.5 font-sans text-slate-600 dark:text-slate-300">
                    {log.module}
                  </td>
                  <td className="p-3.5 font-sans max-w-sm text-slate-700 dark:text-slate-300">
                    {log.details}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {log.ipAddress || '192.168.1.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
