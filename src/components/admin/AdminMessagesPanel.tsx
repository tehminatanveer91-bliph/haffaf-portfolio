import { useState } from 'react';
import { Check, Mail, MailOpen, Trash2 } from 'lucide-react';
import {
  deleteContactMessage,
  markMessageRead,
} from '../../services/portfolioService';
import type { ContactMessage } from '../../types/portfolio';

interface AdminMessagesPanelProps {
  messages: ContactMessage[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
}

export function AdminMessagesPanel({
  messages,
  selectedId,
  onSelectId,
}: AdminMessagesPanelProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const selectedMessage =
    messages.find((m) => m.id === selectedId) ?? messages[0] ?? null;

  const handleToggleRead = async (msg: ContactMessage) => {
    setError('');
    try {
      await markMessageRead(msg.id, !msg.read);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update message status.'
      );
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await deleteContactMessage(id);
      setConfirmDeleteId(null);
      if (selectedId === id) {
        onSelectId(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to delete message.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F7F6]">Messages</h1>
        <p className="mt-1 text-sm text-[#91A39E]">
          Review visitor inquiries submitted through the public contact form.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-xs text-rose-200"
        >
          {error}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="bg-[#111C22] border border-[#26343A] rounded-xl p-12 text-center text-sm text-[#91A39E]">
          Inbox is empty. Visitor inquiries submitted on the portfolio will
          appear here in real time.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-[#111C22] border border-[#26343A] rounded-xl overflow-hidden divide-y divide-[#26343A]">
            {messages.map((msg) => {
              const active = selectedMessage?.id === msg.id;
              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => {
                    onSelectId(msg.id);
                    if (!msg.read) {
                      void markMessageRead(msg.id, true);
                    }
                  }}
                  className={`w-full text-left p-4 transition-colors ${
                    active
                      ? 'bg-[#080D12] border-r-2 border-[#00D6A3]'
                      : 'hover:bg-[#080D12]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-medium">
                      {msg.read ? (
                        <MailOpen className="w-3.5 h-3.5 text-[#91A39E]" />
                      ) : (
                        <Mail className="w-3.5 h-3.5 text-[#00D6A3]" />
                      )}
                      <span
                        className={
                          msg.read ? 'text-[#91A39E]' : 'text-[#00D6A3]'
                        }
                      >
                        {msg.read ? 'Read' : 'Unread'}
                      </span>
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-[#F4F7F6] truncate">
                    {msg.subject}
                  </p>
                  <p className="mt-0.5 text-xs text-[#91A39E] truncate">
                    {msg.name} · {msg.email}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedMessage && (
            <div className="lg:col-span-7 bg-[#111C22] border border-[#26343A] rounded-xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#26343A]">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-[#F4F7F6]">
                    {selectedMessage.subject}
                  </h2>
                  <p className="text-xs text-[#91A39E]">
                    From{' '}
                    <span className="text-[#F4F7F6] font-medium">
                      {selectedMessage.name}
                    </span>{' '}
                    ·{' '}
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-[#00D6A3] hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleRead(selectedMessage)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#26343A] bg-[#080D12] text-[#F4F7F6] hover:border-[#00D6A3]/50"
                  >
                    <Check className="w-3.5 h-3.5 text-[#00D6A3]" />
                    <span>
                      {selectedMessage.read ? 'Mark Unread' : 'Mark as Read'}
                    </span>
                  </button>

                  {confirmDeleteId === selectedMessage.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500 text-white"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1.5 text-xs text-[#91A39E]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(selectedMessage.id)}
                      aria-label="Delete selected message"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#26343A] bg-[#080D12] text-rose-300 hover:border-rose-500/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="text-sm text-[#F4F7F6] leading-relaxed whitespace-pre-line">
                {selectedMessage.message}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
