import React from 'react';
import { Bug, BookOpen, UserCircle, ChevronRight } from 'lucide-react';
import { Issue } from '../types';
import { StatusBadge, PriorityBadge } from './Badges';

interface IssueCardProps {
  issue: Issue;
  onClick: (issue: Issue) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick }) => (
  <div 
    onClick={() => onClick(issue)}
    className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
  >
    <div className="flex items-start gap-3">
      <div className={`mt-1 p-2 rounded-lg ${issue.type === 'Bug' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
        {issue.type === 'Bug' ? <Bug size={18} /> : <BookOpen size={18} />}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-500">{issue.id}</span>
          <StatusBadge status={issue.status} />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">{issue.summary}</h4>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1"><UserCircle size={14} /> {issue.assignee}</span>
          <span>{issue.created}</span>
        </div>
      </div>
    </div>
    <div className="flex flex-col items-end gap-2">
      <PriorityBadge priority={issue.priority} />
      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
    </div>
  </div>
);