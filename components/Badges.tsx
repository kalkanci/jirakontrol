import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../constants';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`px-2 py-1 rounded-md text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
    {status}
  </span>
);

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => (
  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
    {priority}
  </span>
);