import React, { useState } from 'react';
import { 
  Layout, 
  AlertCircle, 
  BookOpen, 
  Settings, 
  Bug,
  UserCircle,
} from 'lucide-react';
import { MOCK_ISSUES } from './constants';
import { Issue, Tab } from './types';
import { DashboardView } from './views/DashboardView';
import { BugListView } from './views/BugListView';
import { BacklogView } from './views/BacklogView';
import { SettingsView } from './views/SettingsView';
import { IssueModal } from './components/IssueModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Computed counts for badges
  const bugCount = issues.filter(i => i.type === 'Bug').length;
  const backlogCount = issues.filter(i => i.status === 'Backlog' || i.type === 'Story').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Bug size={20} />
            </div>
            JiraFocus
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800'}`}
          >
            <Layout size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('bugs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'bugs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800'}`}
          >
            <AlertCircle size={20} />
            Bug Listesi
            <span className="ml-auto bg-slate-800 text-xs px-2 py-0.5 rounded-full">{bugCount}</span>
          </button>
          <button 
            onClick={() => setActiveTab('backlog')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'backlog' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800'}`}
          >
            <BookOpen size={20} />
            Backlog
             <span className="ml-auto bg-slate-800 text-xs px-2 py-0.5 rounded-full">{backlogCount}</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
          >
            <Settings size={20} />
            Ayarlar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 overflow-auto h-screen">
        <header className="flex justify-between items-center mb-8 sticky top-0 bg-slate-50/90 backdrop-blur-sm py-4 z-20 border-b border-slate-200/50">
           <div>
             <h2 className="text-2xl font-bold text-slate-800 capitalize">
               {activeTab === 'bugs' ? 'Bug Listesi' : activeTab === 'backlog' ? 'Backlog' : activeTab === 'settings' ? 'Ayarlar' : 'Dashboard'}
             </h2>
             <p className="text-slate-500 text-sm">Bugün, {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-orange-400'} animate-pulse`}></div>
                  <span className="text-sm font-medium text-slate-600">{isConnected ? 'Online' : 'Demo Mode'}</span>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 border border-indigo-200">
                  <UserCircle size={24} />
              </div>
           </div>
        </header>

        <div className="pb-8">
            {activeTab === 'dashboard' && <DashboardView issues={issues} isConnected={isConnected} onIssueClick={setSelectedIssue} />}
            {activeTab === 'bugs' && <BugListView issues={issues} onIssueClick={setSelectedIssue} />}
            {activeTab === 'backlog' && <BacklogView issues={issues} onIssueClick={setSelectedIssue} />}
            {activeTab === 'settings' && <SettingsView isConnected={isConnected} setIsConnected={setIsConnected} setIssues={setIssues} />}
        </div>
      </main>

      {/* Modal */}
      <IssueModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </div>
  );
}