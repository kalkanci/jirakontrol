import React from 'react';
import { Wifi, AlertCircle, Clock, BarChart3, Bug, CheckCircle2 } from 'lucide-react';
import { Issue } from '../types';
import { IssueCard } from '../components/IssueCard';

interface DashboardViewProps {
  issues: Issue[];
  isConnected: boolean;
  onIssueClick: (issue: Issue) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ issues, isConnected, onIssueClick }) => {
  const criticalBugs = issues.filter(i => i.type === 'Bug' && (i.priority === 'Critical' || i.priority === 'High'));
  const backlogCount = issues.filter(i => i.status === 'Backlog').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Genel Bakış</h2>
            <p className="text-slate-500 text-sm">Proje durum özeti</p>
         </div>
         {isConnected && (
             <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                 <Wifi size={14} /> Jira Bağlı
             </div>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Kritik Buglar</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{criticalBugs.length}</h3>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Hemen müdahale edilmeli</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Bekleyen Storyler</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{backlogCount}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20} /></div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Sonraki sprint adayları</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Sprint Tamamlanma</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">%65</h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><BarChart3 size={20} /></div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Hedefin üzerindesiniz</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Bug size={20} className="text-red-500" />
          Acil Çözüm Bekleyenler
        </h3>
        <div className="space-y-3">
          {criticalBugs.length > 0 ? (
            criticalBugs.map(issue => (
              <IssueCard key={issue.id} issue={issue} onClick={onIssueClick} />
            ))
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
              <p className="text-slate-600 font-medium">Harika! Kritik bug bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};