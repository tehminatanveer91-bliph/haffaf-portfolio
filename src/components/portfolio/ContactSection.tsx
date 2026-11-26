import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { submitContactMessage } from '../../services/portfolioService';
import type { SiteSettings } from '../../types/portfolio';
import { validateContactInput } from '../../utils/validation';

interface ContactSectionProps {
  settings: SiteSettings;
  prefilledSubject?: string;
}

export function ContactSection({
  settings,
  prefilledSubject = '',
}: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(prefilledSubject);
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (prefilledSubject) {
      setSubject(prefilledSubject);
    }
  }, [prefilledSubject]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage('');

    const validation = validateContactInput({
      name,
      email,
      subject,
      message,
      honeypot,
      lastSubmittedAt,
    });

    if (!validation.valid) {
      setFieldErrors(validation.errors);
      if (validation.errors.form) {
        setSubmitState('error');
        setStatusMessage(validation.errors.form);
      }
      return;
    }

    setFieldErrors({});
    setSubmitState('submitting');

    try {
      await submitContactMessage({
        name,
        email,
        subject,
        message,
        honeypot,
        lastSubmittedAt,
      });
      setLastSubmittedAt(Date.now());
      setSubmitState('success');
      setStatusMessage(
        'Message received. Thank you for reaching out—I will reply shortly.'
      );
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setSubmitState('error');
      setStatusMessage(
        err instanceof Error
          ? err.message
          : 'Unable to send your message right now. Please try again.'
      );
    }
  };

  return (
    <section
      id="contact"
      className="py-20 md:py-24 border-b border-[#26343A] bg-[#080D12]"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-medium tracking-wide text-[#00D6A3]">
              05. Contact
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F7F6] [text-wrap:balance]">
              Let&apos;s build something dependable.
            </h2>
            <p className="text-base text-[#91A39E] leading-relaxed">
              Share your project scope, timeline, or technical goals. Inquiries
              go directly to my Firestore inbox and I respond within one business
              day.
            </p>

            <div className="pt-4 border-t border-[#26343A] space-y-3 text-sm">
              <div>
                <p className="text-xs text-[#91A39E]">Direct Email</p>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-[#F4F7F6] hover:text-[#00D6A3] font-medium transition-colors"
                >
                  {settings.contactEmail}
                </a>
              </div>
              <div>
                <p className="text-xs text-[#91A39E]">Availability</p>
                <p className="text-[#B5F5E5] font-medium">
                  {settings.availableForWork
                    ? settings.availabilityText
                    : 'Scheduled for next quarter'}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#111C22] border border-[#26343A] rounded-2xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Honeypot anti-spam trap */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-[#F4F7F6]"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] placeholder:text-[#91A39E]/60 focus:outline-none focus:border-[#00D6A3]"
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-rose-400">{fieldErrors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-[#F4F7F6]"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] placeholder:text-[#91A39E]/60 focus:outline-none focus:border-[#00D6A3]"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-400">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-medium text-[#F4F7F6]"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Full-Stack Web Platform Inquiry"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] placeholder:text-[#91A39E]/60 focus:outline-none focus:border-[#00D6A3]"
                />
                {fieldErrors.subject && (
                  <p className="text-xs text-rose-400">{fieldErrors.subject}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-[#F4F7F6]"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me about your product goals, timeline, and technical requirements..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] placeholder:text-[#91A39E]/60 focus:outline-none focus:border-[#00D6A3] resize-y"
                />
                {fieldErrors.message && (
                  <p className="text-xs text-rose-400">{fieldErrors.message}</p>
                )}
              </div>

              {submitState === 'success' && statusMessage && (
                <div
                  role="status"
                  className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#00D6A3]/10 border border-[#00D6A3]/40 text-sm text-[#B5F5E5]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#00D6A3] shrink-0 mt-0.5" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {submitState === 'error' && statusMessage && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-sm text-rose-200"
                >
                  {statusMessage}
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submitState === 'submitting'}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {submitState === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
