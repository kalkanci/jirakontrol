import React from 'react';
import { Issue } from '../types';
import { IssueCard } from '../components/IssueCard';

interface BacklogViewProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({ issues, onIssueClick }) => {
  const stories = issues.filter(i => i.type === 'Story' || i.status === 'Backlog');

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-slate-800">Bekleyen İşler (Backlog)</h2>
      <div className="space-y-3">
        {stories.length > 0 ? (
          stories.map(issue => (
            <IssueCard key={issue.id} issue={issue} onClick={onIssueClick} />
          ))
        ) : (
          <div className="p-8 text-center text-slate-500">Backlog boş.</div>
        )}
      </div>
    </div>
  );
};