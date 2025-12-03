import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { Issue } from '../types';
import { IssueCard } from '../components/IssueCard';

interface BugListViewProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
}

export const BugListView: React.FC<BugListViewProps> = ({ issues, onIssueClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const bugs = issues.filter(i => 
    i.type === 'Bug' && 
    (i.summary.toLowerCase().includes(searchTerm.toLowerCase()) || i.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-800">Tüm Hatalar (Bugs)</h2>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter size={16} /> Filtrele
            </button>
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Ara..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 focus:w-64 transition-all" 
                />
            </div>
        </div>
      </div>
      <div className="space-y-3">
        {bugs.length > 0 ? (
          bugs.map(issue => (
            <IssueCard key={issue.id} issue={issue} onClick={onIssueClick} />
          ))
        ) : (
          <div className="p-8 text-center text-slate-500">Kayıt bulunamadı.</div>
        )}
      </div>
    </div>
  );
};