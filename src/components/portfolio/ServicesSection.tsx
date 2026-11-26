import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ServiceItem } from '../../types/portfolio';

interface ServicesSectionProps {
  services: ServiceItem[];
  loading: boolean;
  onInquireService: (serviceTitle: string) => void;
}

export function ServicesSection({
  services,
  loading,
  onInquireService,
}: ServicesSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="services"
      className="py-20 md:py-24 border-b border-[#26343A] bg-[#080D12]"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium tracking-wide text-[#00D6A3]">
            04. Services
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F7F6] [text-wrap:balance]">
            Focused engineering engagements.
          </h2>
          <p className="mt-3 text-base text-[#91A39E] leading-relaxed">
            Scoped around real business milestones—from marketing launchpads to
            full-stack Firebase operations consoles.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 bg-[#111C22] border border-[#26343A] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="bg-[#111C22] border border-[#26343A] rounded-2xl p-10 text-center">
            <p className="text-sm text-[#91A39E]">
              Service offerings are currently being updated.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#26343A] border-t border-b border-[#26343A]">
            {services.map((service, index) => {
              const numeral = String(index + 1).padStart(2, '0');
              return (
                <motion.div
                  key={service.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="py-7 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start hover:bg-[#111C22]/50 transition-colors px-2 -mx-2 rounded-xl"
                >
                  <div className="lg:col-span-5 flex items-baseline gap-4">
                    <span className="font-mono text-sm text-[#00D6A3] tabular-nums shrink-0">
                      {numeral}.
                    </span>
                    <h3 className="text-xl font-semibold text-[#F4F7F6]">
                      {service.title}
                    </h3>
                  </div>

                  <div className="lg:col-span-5 space-y-2.5">
                    <p className="text-sm text-[#91A39E] leading-relaxed">
                      {service.description}
                    </p>
                    <p className="text-xs font-mono text-[#B5F5E5]/85">
                      {service.deliverables.join(' · ')}
                    </p>
                  </div>

                  <div className="lg:col-span-2 flex lg:justify-end">
                    <button
                      type="button"
                      onClick={() => onInquireService(service.title)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-[#26343A] bg-[#111C22] text-[#F4F7F6] hover:border-[#00D6A3] hover:text-[#00D6A3] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Inquire</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
