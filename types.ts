export type IssueType = 'Bug' | 'Story' | string;
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low' | string;
export type Status = 'To Do' | 'In Progress' | 'Done' | 'Backlog' | 'Closed' | string;

export interface Issue {
  id: string;
  type: IssueType;
  summary: string;
  priority: Priority;
  status: Status;
  assignee: string;
  created: string;
  description?: string;
}

export type Tab = 'dashboard' | 'bugs' | 'backlog' | 'settings';

export interface JiraCredentials {
  domain: string;
  email: string;
  token: string;
}