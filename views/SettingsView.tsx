import React, { useState } from 'react';
import { Wifi, Settings, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { MOCK_ISSUES } from '../constants';
import { fetchJiraIssues } from '../services/jiraService';
import { Issue } from '../types';

interface SettingsViewProps {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  setIssues: (issues: Issue[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isConnected, setIsConnected, setIssues }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [jiraDomain, setJiraDomain] = useState('sirketiniz.atlassian.net');
  const [email, setEmail] = useState('ad.soyad@sirket.com');
  const [apiToken, setApiToken] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setErrorMsg('');

    if (!jiraDomain || !email || !apiToken) {
        setLoading(false);
        setErrorMsg('Lütfen tüm alanları doldurun.');
        return;
    }

    try {
      const issues = await fetchJiraIssues({ domain: jiraDomain, email, token: apiToken });
      setIssues(issues);
      setIsConnected(true);
      setErrorMsg('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIssues(MOCK_ISSUES);
    setEmail('');
    setApiToken('');
  };

  return (
    <div className="max-w-xl mx-auto mt-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-lg">
        <div className="flex flex-col items-center text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isConnected ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {isConnected ? <Wifi size={32} /> : <Settings size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isConnected ? 'Bağlantı Başarılı' : 'Jira Bağlantısı'}
          </h2>
          <p className="text-slate-500 mt-2">
            {isConnected 
              ? 'Jira entegrasyonu aktif durumda. Veriler senkronize ediliyor.' 
              : 'API Token kullanarak Jira hesabınızı bağlayın.'}
          </p>
        </div>

        {!isConnected ? (
          <div className="space-y-4">
             {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-3 border border-red-100">
                    <AlertCircle size={20} className="mt-0.5 shrink-0" />
                    <div className="flex flex-col text-left">
                        <span className="font-bold">Bağlantı Hatası:</span>
                        <span>{errorMsg}</span>
                    </div>
                </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jira URL</label>
              <input 
                type="text" 
                value={jiraDomain}
                onChange={(e) => setJiraDomain(e.target.value)}
                placeholder="https://sirketiniz.atlassian.net" 
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
              />
              <p className="text-xs text-slate-400 mt-1">Sadece domain kök adresi (örn: https://mycompany.atlassian.net)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Adresi</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ad.soyad@sirket.com" 
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">API Token</label>
              <input 
                type="password" 
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="ATATT3xFfGF0..." 
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
              />
              <p className="text-xs text-slate-400 mt-1">
                <a href="https://id.atlassian.com/manage/api-tokens" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                  Token oluşturmak için tıklayın
                </a>
              </p>
            </div>

            <button 
              onClick={handleConnect}
              disabled={loading}
              className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Bağlanıyor...
                  </>
              ) : (
                  'Bağlantıyı Test Et ve Kaydet'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500">Bağlı Hesap</span>
                    <span className="text-sm font-medium text-slate-800">{email}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Domain</span>
                    <span className="text-sm font-medium text-slate-800">{jiraDomain}</span>
                </div>
             </div>
             
             <button 
                onClick={handleDisconnect}
                className="w-full py-2.5 px-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
             >
                <LogOut size={18} />
                Bağlantıyı Kes
             </button>
          </div>
        )}
      </div>
    </div>
  );
};