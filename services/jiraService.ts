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
  
  // Direct Jira API calls from browser are blocked by CORS policies.
  // We use a CORS proxy to bypass this restriction for client-side only applications.
  const targetUrl = `${formattedDomain}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`API Hatası (${response.status}): ${errorText.substring(0, 150)}`);
    }

    const data = await response.json();

    if (!data.issues || !Array.isArray(data.issues)) {
       throw new Error('Jira yanıtı beklenen formatta değil.');
    }

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
  } catch (error: any) {
    console.error("Jira Fetch Error:", error);
    throw new Error(error.message || 'Jira bağlantısı kurulamadı.');
  }
};