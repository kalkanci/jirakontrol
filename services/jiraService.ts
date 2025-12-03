import { JiraCredentials, Issue } from '../types';

export const fetchJiraIssues = async (credentials: JiraCredentials): Promise<Issue[]> => {
  const { domain, email, token } = credentials;

  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        email,
        token
      }),
    });

    // Response JSON değilse patlamaması için text olarak alıp kontrol edelim
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Sunucudan geçersiz yanıt alındı: ${responseText.substring(0, 50)}...`);
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
         throw new Error('YETKİ HATASI: Email veya API Token yanlış.');
      }
      if (response.status === 410 || response.status === 404) {
         throw new Error('ADRES HATASI: Jira domain adresi hatalı veya API değişmiş.');
      }
      throw new Error(data.error || `Bağlantı Hatası (${response.status})`);
    }

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
    console.error(`Service Error:`, error.message);
    throw new Error(error.message || 'Bilinmeyen bir hata oluştu.');
  }
};