export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { domain, email, token } = JSON.parse(req.body);

    if (!domain || !email || !token) {
      return res.status(400).json({ error: 'Eksik parametreler' });
    }

    // URL Temizleme
    let targetOrigin = domain.trim().replace(/\/+$/, '');
    if (!targetOrigin.startsWith('http')) targetOrigin = `https://${targetOrigin}`;

    // Jira API URL
    const jql = 'issuetype in (Bug, Story) AND status not in (Closed) ORDER BY priority DESC';
    const jiraApiUrl = `${targetOrigin}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50`;

    // Basic Auth Header
    const authHeader = `Basic ${btoa(`${email.trim()}:${token.trim()}`)}`;

    // Sunucu tarafında fetch işlemi (CORS sorunu olmaz)
    const response = await fetch(jiraApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Jira'dan dönen hata kodunu istemciye ilet
      return res.status(response.status).json({ error: `Jira Hatası: ${response.statusText}` });
    }

    const data = await response.json();
    
    // Başarılı yanıtı döndür
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy Hatası:', error);
    return res.status(500).json({ error: 'Sunucu tarafında işlem başarısız oldu.' });
  }
}