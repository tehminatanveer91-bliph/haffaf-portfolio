import { motion } from 'motion/react';
import { Github, Linkedin, Mail, MapPin, Twitter } from 'lucide-react';
import type { SiteSettings } from '../../types/portfolio';
import { sanitizeExternalUrl } from '../../utils/validation';

interface AboutSectionProps {
  settings: SiteSettings;
}

export function AboutSection({ settings }: AboutSectionProps) {
  const githubUrl = sanitizeExternalUrl(settings.githubUrl);
  const linkedinUrl = sanitizeExternalUrl(settings.linkedinUrl);
  const twitterUrl = sanitizeExternalUrl(settings.twitterUrl);

  return (
    <section
      id="about"
      className="py-20 md:py-24 border-b border-[#26343A] bg-[#080D12]"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-medium tracking-wide text-[#00D6A3]">
              01. About
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F7F6] [text-wrap:balance]">
              {settings.aboutTitle}
            </h2>
            <div className="pt-4 space-y-3 border-t border-[#26343A] text-sm">
              <div className="flex items-center justify-between gap-4 py-1.5">
                <span className="text-[#91A39E] inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00D6A3]" />
                  <span>Location</span>
                </span>
                <span className="text-[#F4F7F6] font-medium">
                  {settings.location}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1.5">
                <span className="text-[#91A39E] inline-flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#00D6A3]" />
                  <span>Direct Email</span>
                </span>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-[#F4F7F6] hover:text-[#00D6A3] font-medium transition-colors"
                >
                  {settings.contactEmail}
                </a>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-5 text-sm">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#91A39E] hover:text-[#00D6A3] transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#91A39E] hover:text-[#00D6A3] transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#91A39E] hover:text-[#00D6A3] transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span>X / Twitter</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#111C22] border border-[#26343A] rounded-2xl p-8 md:p-10 space-y-5">
            <p className="text-lg sm:text-xl font-medium text-[#F4F7F6] leading-relaxed">
              {settings.aboutLead}
            </p>
            <p className="text-base text-[#91A39E] leading-relaxed whitespace-pre-line">
              {settings.aboutBody}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
