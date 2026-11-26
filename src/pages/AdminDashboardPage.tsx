import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Cpu,
  ExternalLink,
  FileEdit,
  LayoutDashboard,
  LogOut,
  Mail,
} from 'lucide-react';
import { AdminContentPanel } from '../components/admin/AdminContentPanel';
import { AdminMessagesPanel } from '../components/admin/AdminMessagesPanel';
import { AdminOverviewPanel } from '../components/admin/AdminOverviewPanel';
import { AdminProjectsPanel } from '../components/admin/AdminProjectsPanel';
import { AdminSkillsPanel } from '../components/admin/AdminSkillsPanel';
import { useAuth } from '../context/AuthContext';
import { subscribeAdminDashboard } from '../services/portfolioService';
import type {
  ContactMessage,
  Project,
  ServiceItem,
  SiteSettings,
  Skill,
} from '../types/portfolio';

type AdminTab = 'overview' | 'projects' | 'skills' | 'messages' | 'content';

const TABS: Array<{
  id: AdminTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Cpu },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'content', label: 'Site Content & Services', icon: FileEdit },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin, authReady, adminChecked, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [dashboardError, setDashboardError] = useState('');

  useEffect(() => {
    if (!authReady || !adminChecked || !isAdmin) return;

    const unsubscribe = subscribeAdminDashboard({
      onSettings: setSettings,
      onProjects: setProjects,
      onSkills: setSkills,
      onServices: setServices,
      onMessages: setMessages,
      onError: (err) => setDashboardError(err.message),
    });

    return () => unsubscribe();
  }, [authReady, adminChecked, isAdmin]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-[#080D12] text-[#F4F7F6] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-[#26343A] bg-[#111C22]/60 flex flex-col justify-between">
        <div>
          <div className="h-16 px-6 border-b border-[#26343A] flex items-center justify-between">
            <span className="text-base font-bold tracking-tight text-[#F4F7F6]">
              HAFFAF Admin
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs text-[#91A39E] hover:text-[#00D6A3] transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <nav
            aria-label="Admin dashboard navigation"
            className="p-3 flex lg:flex-col gap-1 overflow-x-auto"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#00D6A3] text-[#080D12] font-semibold'
                      : 'text-[#91A39E] hover:text-[#F4F7F6] hover:bg-[#080D12]/50'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </span>
                  {tab.id === 'messages' && unreadCount > 0 && (
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        active ? 'text-[#080D12]' : 'text-[#00D6A3]'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#26343A] hidden lg:flex flex-col gap-3">
          <div className="text-xs">
            <p className="text-[#91A39E]">Signed in as</p>
            <p className="text-[#F4F7F6] font-medium truncate">
              {user?.email ?? 'Administrator'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-[#26343A] bg-[#080D12] text-[#91A39E] hover:text-rose-300 hover:border-rose-500/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 border-b border-[#26343A] flex items-center justify-between gap-4">
          <div className="text-xs text-[#91A39E]">
            <span>Admin</span>
            <span aria-hidden="true" className="mx-2 text-[#26343A]">
              /
            </span>
            <span className="text-[#F4F7F6] font-medium">
              {TABS.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#26343A] text-[#91A39E] hover:text-rose-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {dashboardError && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-200 break-words"
            >
              {dashboardError}
            </div>
          )}

          {activeTab === 'overview' && (
            <AdminOverviewPanel
              projects={projects}
              skills={skills}
              messages={messages}
              onSelectMessage={(msgId) => {
                setSelectedMessageId(msgId);
                setActiveTab('messages');
              }}
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjectsPanel projects={projects} />
          )}

          {activeTab === 'skills' && <AdminSkillsPanel skills={skills} />}

          {activeTab === 'messages' && (
            <AdminMessagesPanel
              messages={messages}
              selectedId={selectedMessageId}
              onSelectId={setSelectedMessageId}
            />
          )}

          {activeTab === 'content' && (
            <AdminContentPanel settings={settings} services={services} />
          )}
        </main>
      </div>
    </div>
  );
}
