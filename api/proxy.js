export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { domain, email, token } = body;

    if (!domain || !email || !token) {
      return res.status(400).json({ error: 'Eksik parametreler (domain, email, token)' });
    }

    // --- URL TEMİZLEME (KRİTİK DÜZELTME) ---
    // Kullanıcı "https://abc.atlassian.net/jira/software" girse bile
    // biz sadece "https://abc.atlassian.net" kısmını almalıyız.
    let cleanDomain = domain.trim();
    if (!cleanDomain.startsWith('http')) {
      cleanDomain = `https://${cleanDomain}`;
    }

    let targetOrigin;
    try {
      // URL sınıfı ile path, query string vs hepsini atıp sadece kök domaini alıyoruz
      const urlObj = new URL(cleanDomain);
      targetOrigin = urlObj.origin; 
    } catch (e) {
      return res.status(400).json({ error: 'Geçersiz URL formatı.' });
    }

    // Jira API URL (Cloud için v3)
    const jql = 'issuetype in (Bug, Story) AND status not in (Closed) ORDER BY priority DESC';
    const jiraApiUrl = `${targetOrigin}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50`;

    // Basic Auth Header (Node.js uyumlu Buffer kullanımı)
    const authString = `${email.trim()}:${token.trim()}`;
    const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

    console.log(`Proxy Request to: ${jiraApiUrl}`); // Loglama (Vercel loglarında görünür)

    // Sunucu tarafında fetch işlemi
    const response = await fetch(jiraApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Hata detayını yakala
      const errorText = await response.text();
      console.error('Jira API Error:', response.status, errorText);
      
      if (response.status === 410) {
        return res.status(410).json({ error: 'Jira API adresi bulunamadı (410 Gone). Domain adresinin doğru olduğundan emin olun.' });
      }
      
      return res.status(response.status).json({ error: `Jira Hatası (${response.status}): ${response.statusText}` });
    }

    const data = await response.json();
    
    // Başarılı yanıtı döndür
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy Sunucu Hatası:', error);
    return res.status(500).json({ error: 'Sunucu tarafında işlem başarısız oldu: ' + error.message });
  }
}