import { JiraCredentials, Issue } from '../types';

// Proxy List for Failover
// If one proxy is blocked by company firewall or fails, we try the next one.
const PROXY_PROVIDERS = [
  // Primary: Very fast, usually works
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // Fallback 1: Reliable backup
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

export const fetchJiraIssues = async (credentials: JiraCredentials): Promise<Issue[]> => {
  const { domain, email, token } = credentials;

  // 1. URL CLEANING: Robust logic to strip subpaths like /jira/for-you
  let targetOrigin = '';
  try {
    let rawDomain = domain.trim();
    if (!rawDomain.startsWith('http')) rawDomain = `https://${rawDomain}`;
    
    const urlObj = new URL(rawDomain);
    targetOrigin = urlObj.origin; // This guarantees 'https://xyz.atlassian.net' only
  } catch (e) {
    // Fallback if URL parsing fails completely
    targetOrigin = domain.trim().replace(/\/+$/, '');
    if (!targetOrigin.startsWith('http')) targetOrigin = `https://${targetOrigin}`;
  }

  const cleanEmail = email.trim();
  const cleanToken = token.trim();

  // 2. PREPARE REQUEST
  const authHeader = `Basic ${btoa(`${cleanEmail}:${cleanToken}`)}`;
  const jql = 'issuetype in (Bug, Story) AND status not in (Closed) ORDER BY priority DESC';
  const jiraApiUrl = `${targetOrigin}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50`;

  // 3. ATTEMPT FETCH WITH FALLBACK PROXIES
  let lastError: Error | null = null;

  for (const createProxyUrl of PROXY_PROVIDERS) {
    try {
      const proxyUrl = createProxyUrl(jiraApiUrl);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          // 'X-Requested-With': 'XMLHttpRequest' // Sometimes helps with proxies
        }
      });

      // Handle HTTP Errors specifically
      if (!response.ok) {
        // If 401/403, credentials are wrong. DO NOT try next proxy.
        if (response.status === 401 || response.status === 403) {
           throw new Error('YETKİ HATASI: Email veya API Token yanlış. Lütfen token izinlerini kontrol edin.');
        }
        // If 404, domain is wrong. DO NOT try next proxy.
        if (response.status === 404) {
           throw new Error(`ADRES HATASI: "${targetOrigin}" adresinde Jira API bulunamadı. URL'yi kontrol edin.`);
        }
        
        // For 500s or other errors, maybe the proxy is bad, but usually it's the target.
        // Let's treat 429 (Rate Limit) as a stop as well.
        if (response.status === 429) {
           throw new Error('Çok fazla istek yapıldı. Lütfen biraz bekleyin.');
        }

        throw new Error(`Jira Hatası (${response.status})`);
      }

      // If we got here, request was successful
      const data = await response.json();

      // Validate Data Structure
      if (!data.issues || !Array.isArray(data.issues)) {
        // If structure is wrong, maybe the proxy returned an error HTML page as JSON?
        console.warn("Unexpected data structure:", data);
        throw new Error('Veri formatı hatalı. Jira yanıtı okunamadı.');
      }

      // 4. TRANSFORM & RETURN
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
      console.warn(`Proxy failed:`, error.message);
      lastError = error;

      // Critical: If the error was a specific Auth/Domain error we threw above, stop looping.
      if (error.message.startsWith('YETKİ HATASI') || error.message.startsWith('ADRES HATASI')) {
        throw error;
      }
      
      // If it's a network error (Failed to fetch), continue to next proxy
      continue;
    }
  }

  // If loop finishes without returning, throw the last error
  throw new Error(
    lastError?.message === 'Failed to fetch'
      ? 'AĞ HATASI: Sunucuya erişilemedi. VPN veya Kurumsal Güvenlik Duvarı bağlantıyı engelliyor olabilir.'
      : (lastError?.message || 'Bilinmeyen bir bağlantı hatası oluştu.')
  );
};