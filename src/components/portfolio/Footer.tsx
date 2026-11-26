import { Link } from 'react-router-dom';
import type { SiteSettings } from '../../types/portfolio';
import { sanitizeExternalUrl } from '../../utils/validation';

interface FooterProps {
  settings: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear();
  const githubUrl = sanitizeExternalUrl(settings.githubUrl);
  const linkedinUrl = sanitizeExternalUrl(settings.linkedinUrl);
  const twitterUrl = sanitizeExternalUrl(settings.twitterUrl);

  return (
    <footer className="bg-[#080D12] py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="text-xs text-[#91A39E]">
          <span className="font-semibold text-[#F4F7F6]">
            {settings.brandName}
          </span>
          <span aria-hidden="true" className="mx-2 text-[#26343A]">
            ·
          </span>
          <span>© {year} All rights reserved.</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-[#91A39E]">
          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="hover:text-[#00D6A3] transition-colors"
            >
              {settings.contactEmail}
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00D6A3] transition-colors"
            >
              GitHub
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00D6A3] transition-colors"
            >
              LinkedIn
            </a>
          )}
          {twitterUrl && (
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00D6A3] transition-colors"
            >
              X / Twitter
            </a>
          )}
          <Link
            to="/admin/login"
            className="text-[#91A39E] hover:text-[#F4F7F6] transition-colors"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
