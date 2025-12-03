import { JiraCredentials, Issue } from '../types';

export const fetchJiraIssues = async (credentials: JiraCredentials): Promise<Issue[]> => {
  const { domain, email, token } = credentials;

  // URL Formatting: Extract origin only (removes /jira/software etc.)
  let formattedDomain = domain.trim();
  try {
    if (!formattedDomain.startsWith('http')) {
      formattedDomain = `https://${formattedDomain}`;
    }
    const urlObj = new URL(formattedDomain);
    formattedDomain = urlObj.origin; // Keeps only https://company.atlassian.net
  } catch (e) {
    // Fallback simple trim if URL is invalid
    if (formattedDomain.endsWith('/')) formattedDomain = formattedDomain.slice(0, -1);
  }

  const cleanEmail = email.trim();
  const cleanToken = token.trim();

  // Authentication Header
  const authHeader = `Basic ${btoa(`${cleanEmail}:${cleanToken}`)}`;
  
  // JQL Query
  const jql = 'issuetype in (Bug, Story) AND status not in (Closed) ORDER BY priority DESC';
  
  // Proxy URL
  const targetUrl = `${formattedDomain}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
        // Content-Type removed to avoid CORS preflight (OPTIONS) request failure
      }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('Yetkilendirme hatası: Email veya Token yanlış.');
      }
      if (response.status === 404) {
        throw new Error('Jira adresi bulunamadı. Domain ismini kontrol edin.');
      }
      
      throw new Error(`API Hatası (${response.status}): ${errorText.substring(0, 100)}`);
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
    // Network errors (like CORS or AdBlock blocking the proxy)
    if (error.message === 'Failed to fetch') {
        throw new Error('Ağ hatası: Proxy servisine erişilemedi. AdBlock veya VPN kapatıp deneyin.');
    }
    throw new Error(error.message || 'Jira bağlantısı kurulamadı.');
  }
};