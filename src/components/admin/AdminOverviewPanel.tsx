import { useState } from 'react';
import { DatabaseZap, Loader2, Mail, MailOpen } from 'lucide-react';
import { seedStarterPortfolioContent } from '../../services/portfolioService';
import type {
  ContactMessage,
  Project,
  Skill,
} from '../../types/portfolio';
import { computeDashboardMetrics } from '../../utils/validation';

interface AdminOverviewPanelProps {
  projects: Project[];
  skills: Skill[];
  messages: ContactMessage[];
  onSelectMessage: (msgId: string) => void;
}

export function AdminOverviewPanel({
  projects,
  skills,
  messages,
  onSelectMessage,
}: AdminOverviewPanelProps) {
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState('');
  const [seedSuccess, setSeedSuccess] = useState(false);

  const metrics = computeDashboardMetrics({ projects, skills, messages });
  const recentMessages = messages.slice(0, 5);
  const isDatabaseEmpty = projects.length === 0 && skills.length === 0;

  const handleSeed = async () => {
    setSeeding(true);
    setSeedError('');
    setSeedSuccess(false);
    try {
      await seedStarterPortfolioContent();
      setSeedSuccess(true);
    } catch (err) {
      setSeedError(
        err instanceof Error ? err.message : 'Failed to initialize Firestore.'
      );
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F7F6]">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-[#91A39E]">
          Live metrics synchronized directly from Cloud Firestore.
        </p>
      </div>

      {isDatabaseEmpty && (
        <div className="bg-[#111C22] border border-[#00D6A3]/40 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#F4F7F6]">
              Initialize Starter Firestore Data
            </h2>
            <p className="text-xs text-[#91A39E] max-w-xl">
              Your Firestore collections are currently empty. Populate your
              starter projects, skills, services, and site settings with one
              click so you can edit or extend them immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] disabled:opacity-60 whitespace-nowrap shrink-0 transition-colors"
          >
            {seeding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <DatabaseZap className="w-4 h-4" />
            )}
            <span>{seeding ? 'Populating...' : 'Populate Starter Content'}</span>
          </button>
        </div>
      )}

      {seedError && (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-xs text-rose-200"
        >
          {seedError}
        </div>
      )}

      {seedSuccess && (
        <div
          role="status"
          className="p-3.5 rounded-lg bg-[#00D6A3]/10 border border-[#00D6A3]/40 text-xs text-[#B5F5E5]"
        >
          Starter portfolio collections saved to Cloud Firestore.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111C22] border border-[#26343A] rounded-xl p-5">
          <p className="text-xs font-medium text-[#91A39E]">Total Projects</p>
          <p className="mt-2 text-3xl font-bold text-[#F4F7F6] tabular-nums">
            {metrics.totalProjects}
          </p>
        </div>
        <div className="bg-[#111C22] border border-[#26343A] rounded-xl p-5">
          <p className="text-xs font-medium text-[#91A39E]">
            Published Projects
          </p>
          <p className="mt-2 text-3xl font-bold text-[#00D6A3] tabular-nums">
            {metrics.publishedProjects}
          </p>
        </div>
        <div className="bg-[#111C22] border border-[#26343A] rounded-xl p-5">
          <p className="text-xs font-medium text-[#91A39E]">Total Skills</p>
          <p className="mt-2 text-3xl font-bold text-[#F4F7F6] tabular-nums">
            {metrics.totalSkills}
          </p>
        </div>
        <div className="bg-[#111C22] border border-[#26343A] rounded-xl p-5">
          <p className="text-xs font-medium text-[#91A39E]">Total Messages</p>
          <p className="mt-2 text-3xl font-bold text-[#F4F7F6] tabular-nums">
            {metrics.totalMessages}
          </p>
          <p className="mt-1 text-xs text-[#B5F5E5] tabular-nums">
            {metrics.unreadMessages} unread
          </p>
        </div>
      </div>

      <div className="bg-[#111C22] border border-[#26343A] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#26343A] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#F4F7F6]">
            Recent Messages
          </h2>
          <span className="text-xs text-[#91A39E] tabular-nums">
            Showing latest {recentMessages.length}
          </span>
        </div>

        {recentMessages.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#91A39E]">
            No visitor messages have been submitted yet.
          </div>
        ) : (
          <div className="divide-y divide-[#26343A]">
            {recentMessages.map((msg) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => onSelectMessage(msg.id)}
                className="w-full text-left px-6 py-4 hover:bg-[#080D12]/60 transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    {msg.read ? (
                      <MailOpen className="w-4 h-4 text-[#91A39E] shrink-0" />
                    ) : (
                      <Mail className="w-4 h-4 text-[#00D6A3] shrink-0" />
                    )}
                    <span className="font-semibold text-[#F4F7F6] truncate">
                      {msg.subject}
                    </span>
                  </div>
                  <p className="text-xs text-[#91A39E] truncate">
                    {msg.name} · {msg.email}
                  </p>
                </div>

                <span
                  className={`text-xs font-medium whitespace-nowrap shrink-0 ${
                    msg.read ? 'text-[#91A39E]' : 'text-[#00D6A3]'
                  }`}
                >
                  {msg.read ? 'Read' : 'Unread'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
