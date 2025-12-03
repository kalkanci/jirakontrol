import { JiraCredentials, Issue } from '../types';

export const fetchJiraIssues = async (credentials: JiraCredentials): Promise<Issue[]> => {
  const { domain, email, token } = credentials;

  // Artık dışarıdaki proxy servislerini değil, kendi Vercel fonksiyonumuzu çağırıyoruz.
  // Bu istek tarayıcıdan -> bizim sunucumuza (Same Origin) gider.
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      body: JSON.stringify({
        domain,
        email,
        token
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401 || response.status === 403) {
         throw new Error('YETKİ HATASI: Email veya API Token yanlış. Lütfen token izinlerini kontrol edin.');
      }
      if (response.status === 500 || response.status === 404) {
         throw new Error('ADRES VEYA SUNUCU HATASI: Jira adresini kontrol edin.');
      }
      
      throw new Error(errorData.error || `Bağlantı Hatası (${response.status})`);
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
    console.error(`Service Error:`, error.message);
    throw new Error(error.message || 'Bilinmeyen bir hata oluştu.');
  }
};