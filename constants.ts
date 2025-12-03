import { Issue } from './types';

export const MOCK_ISSUES: Issue[] = [
  { id: 'PRJ-101', type: 'Bug', summary: 'Login sayfasında 404 hatası alınıyor', priority: 'Critical', status: 'To Do', assignee: 'Ahmet Y.', created: '2023-10-25' },
  { id: 'PRJ-102', type: 'Story', summary: 'Kullanıcı profil fotoğrafı yükleme özelliği', priority: 'High', status: 'In Progress', assignee: 'Ayşe K.', created: '2023-10-26' },
  { id: 'PRJ-103', type: 'Bug', summary: 'Sepet toplamı yanlış hesaplanıyor', priority: 'High', status: 'In Progress', assignee: 'Mehmet T.', created: '2023-10-27' },
  { id: 'PRJ-104', type: 'Story', summary: 'Ödeme sayfasının mobil uyumluluğu', priority: 'Medium', status: 'Backlog', assignee: 'Unassigned', created: '2023-10-28' },
  { id: 'PRJ-105', type: 'Bug', summary: 'Footer linkleri çalışmıyor', priority: 'Low', status: 'Done', assignee: 'Ahmet Y.', created: '2023-10-29' },
  { id: 'PRJ-106', type: 'Story', summary: 'Dark mode desteği ekle', priority: 'Low', status: 'Backlog', assignee: 'Ayşe K.', created: '2023-10-30' },
  { id: 'PRJ-107', type: 'Bug', summary: 'API zaman aşımı sorunu', priority: 'Critical', status: 'To Do', assignee: 'Mehmet T.', created: '2023-11-01' },
];

export const PRIORITY_COLORS: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low: 'bg-blue-100 text-blue-700 border-blue-200',
};

export const STATUS_COLORS: Record<string, string> = {
  'To Do': 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  'Done': 'bg-green-50 text-green-700',
  'Backlog': 'bg-gray-100 text-gray-500',
};