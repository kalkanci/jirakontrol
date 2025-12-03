import React from 'react';
import { Bug, BookOpen } from 'lucide-react';
import { Issue } from '../types';
import { StatusBadge, PriorityBadge } from './Badges';

interface IssueModalProps {
  issue: Issue | null;
  onClose: () => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({ issue, onClose }) => {
  if (!issue) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${issue.type === 'Bug' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {issue.type === 'Bug' ? <Bug size={20} /> : <BookOpen size={20} />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">{issue.id}</p>
              <h2 className="text-lg font-bold text-slate-800 line-clamp-1">{issue.summary}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Durum</p>
              <StatusBadge status={issue.status} />
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Öncelik</p>
              <PriorityBadge priority={issue.priority} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Detaylar</p>
            <p className="text-sm text-slate-600 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
              {typeof issue.description === 'string' 
                ? issue.description 
                : "Bu görev için detaylı açıklama Jira üzerinden görüntülenebilir."}
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Kapat</button>
            <button className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-200">Jira'da Aç</button>
          </div>
        </div>
      </div>
    </div>
  );
};