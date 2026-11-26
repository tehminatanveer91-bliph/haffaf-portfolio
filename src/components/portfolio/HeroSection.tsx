import { useState } from 'react';
import { ArrowDownRight, Code2 } from 'lucide-react';
import { motion } from 'motion/react';
import { HERO_VISUAL_URL } from '../../data/defaults';
import type { SiteSettings } from '../../types/portfolio';

interface HeroSectionProps {
  settings: SiteSettings;
  onExploreWork: () => void;
  onContactMe: () => void;
}

export function HeroSection({
  settings,
  onExploreWork,
  onContactMe,
}: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-[#26343A] pt-14 pb-16 md:pt-20 md:pb-24"
    >
      {/* Subtle Midnight Emerald ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 right-1/4 w-[460px] h-[460px] rounded-full bg-[#00D6A3]/8 blur-[120px]"
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium tracking-wide text-[#00D6A3]"
            >
              <span>
                {settings.availableForWork
                  ? settings.availabilityText
                  : 'Currently booked · Accepting inquiries'}
              </span>
              <span aria-hidden="true" className="text-[#26343A]">
                /
              </span>
              <span className="text-[#91A39E] whitespace-nowrap">
                {settings.location}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08] text-[#F4F7F6] [text-wrap:balance] max-w-2xl"
            >
              {settings.heroHeading}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14 }}
              className="mt-6 text-base sm:text-lg text-[#91A39E] leading-relaxed max-w-xl"
            >
              {settings.heroIntro}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <button
                type="button"
                onClick={onExploreWork}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5F5E5]"
              >
                <span>Explore My Work</span>
                <ArrowDownRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onContactMe}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg border border-[#26343A] bg-[#111C22] text-[#F4F7F6] hover:border-[#00D6A3]/60 hover:text-[#B5F5E5] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D6A3]"
              >
                Contact Me
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="lg:col-span-5 flex"
          >
            <div className="relative w-full rounded-2xl overflow-hidden border border-[#26343A] bg-[#111C22] aspect-[4/3] lg:aspect-auto lg:min-h-[360px]">
              {!imgError ? (
                <img
                  src={HERO_VISUAL_URL}
                  alt="HAFFAF software engineering workstation in midnight emerald lighting"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8 bg-gradient-to-br from-[#111C22] to-[#080D12] text-[#91A39E]">
                  <Code2 className="w-10 h-10 text-[#00D6A3]" />
                  <span className="text-sm font-medium text-[#F4F7F6]">
                    Full-Stack Architecture & UI Engineering
                  </span>
                </div>
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080D12]/60 via-transparent to-transparent"
              />
            </div>
          </motion.div>
        </div>

        {/* Full-width metric strip below split hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
          className="mt-12 pt-8 border-t border-[#26343A] grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <div>
            <p className="text-xs font-medium text-[#91A39E]">Experience</p>
            <p className="mt-1 text-xl font-semibold text-[#F4F7F6] tabular-nums">
              {settings.yearsExperience}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#91A39E]">Delivery</p>
            <p className="mt-1 text-xl font-semibold text-[#F4F7F6] tabular-nums">
              {settings.projectsDelivered}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#91A39E]">Core Stack</p>
            <p className="mt-1 text-xl font-semibold text-[#F4F7F6]">
              Next.js · TypeScript · Firebase
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
