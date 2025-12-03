import { JiraCredentials, Issue } from '../types';

// Proxy List for Failover
// We cycle through these to find one that works with the user's network.
const PROXY_PROVIDERS = [
  // Primary: Very fast, handles headers well
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // Backup 1: "Raw" endpoint of AllOrigins (returns actual content)
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  // Backup 2: CodeTabs (Good but has rate limits)
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

export const fetchJiraIssues = async (credentials: JiraCredentials): Promise<Issue[]> => {
  const { domain, email, token } = credentials;

  // 1. URL CLEANING
  let targetOrigin = '';
  try {
    let rawDomain = domain.trim();
    if (!rawDomain.startsWith('http')) rawDomain = `https://${rawDomain}`;
    const urlObj = new URL(rawDomain);
    targetOrigin = urlObj.origin; 
  } catch (e) {
    targetOrigin = domain.trim().replace(/\/+$/, '');
    if (!targetOrigin.startsWith('http')) targetOrigin = `https://${targetOrigin}`;
  }

  const cleanEmail = email.trim();
  const cleanToken = token.trim();

  // 2. PREPARE REQUEST
  // Note: We use btoa for Basic Auth. Ensure email/token don't have non-ASCII chars.
  const authHeader = `Basic ${btoa(`${cleanEmail}:${cleanToken}`)}`;
  const jql = 'issuetype in (Bug, Story) AND status not in (Closed) ORDER BY priority DESC';
  const jiraApiUrl = `${targetOrigin}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50`;

  let lastError: Error | null = null;

  // 3. ATTEMPT FETCH
  for (const createProxyUrl of PROXY_PROVIDERS) {
    try {
      const proxyUrl = createProxyUrl(jiraApiUrl);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
        // CRITICAL SETTINGS FOR CORS/PROXIES:
        referrerPolicy: 'no-referrer', // Don't send origin header
        cache: 'no-store',             // Don't cache
        credentials: 'omit',           // Don't send cookies
        mode: 'cors'                   // Standard CORS request
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
           throw new Error('YETKİ HATASI: Email veya API Token yanlış. Lütfen token izinlerini kontrol edin.');
        }
        if (response.status === 404) {
           throw new Error(`ADRES HATASI: "${targetOrigin}" adresinde Jira API bulunamadı. URL'yi kontrol edin.`);
        }
        if (response.status === 429) {
           throw new Error('Çok fazla istek yapıldı. Lütfen biraz bekleyin.');
        }
        throw new Error(`Jira Hatası (${response.status})`);
      }

      const data = await response.json();

      if (!data.issues || !Array.isArray(data.issues)) {
        console.warn("Unexpected data structure:", data);
        throw new Error('Veri formatı hatalı. Jira yanıtı okunamadı.');
      }

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
      console.warn(`Proxy attempt failed:`, error.message);
      lastError = error;

      // Stop trying if it's an authentication error
      if (error.message.startsWith('YETKİ HATASI') || error.message.startsWith('ADRES HATASI')) {
        throw error;
      }
      
      continue;
    }
  }

  throw new Error(
    lastError?.message === 'Failed to fetch'
      ? 'AĞ HATASI: Sunucuya erişilemedi. VPN veya Kurumsal Güvenlik Duvarı bağlantıyı engelliyor olabilir.'
      : (lastError?.message || 'Bilinmeyen bir bağlantı hatası oluştu.')
  );
};