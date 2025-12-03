import { JiraCredentials, Issue } from '../types';

export const fetchJiraIssues = async (credentials: JiraCredentials): Promise<Issue[]> => {
  const { domain, email, token } = credentials;

  // URL Formatting
  let formattedDomain = domain.trim();
  if (!formattedDomain.startsWith('http')) formattedDomain = `https://${formattedDomain}`;
  if (formattedDomain.endsWith('/')) formattedDomain = formattedDomain.slice(0, -1);

  // Authentication Header
  const authHeader = `Basic ${btoa(`${email}:${token}`)}`;
  
  // JQL Query
  const jql = 'issuetype in (Bug, Story) AND status not in (Closed) ORDER BY priority DESC';
  const url = `${formattedDomain}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Connection Error: ${response.status}`);
  }

  const data = await response.json();

  // Transform Data
  return data.issues.map((issue: any) => ({
    id: issue.key,
    type: issue.fields.issuetype.name,
    summary: issue.fields.summary,
    priority: issue.fields.priority?.name || 'Medium',
    status: issue.fields.status.name,
    assignee: issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned',
    created: new Date(issue.fields.created).toLocaleDateString('tr-TR'),
    description: issue.fields.description
  }));
};