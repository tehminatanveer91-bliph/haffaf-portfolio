import { motion, useReducedMotion } from 'motion/react';
import type { Skill } from '../../types/portfolio';
import { SKILL_CATEGORIES, groupSkillsByCategory } from '../../utils/validation';

interface SkillsSectionProps {
  skills: Skill[];
  loading: boolean;
}

export function SkillsSection({ skills, loading }: SkillsSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const grouped = groupSkillsByCategory(skills);

  return (
    <section
      id="skills"
      className="py-20 md:py-24 border-b border-[#26343A] bg-[#080D12]"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium tracking-wide text-[#00D6A3]">
            02. Technical Capabilities
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F7F6] [text-wrap:balance]">
            Core stack and engineering depth.
          </h2>
          <p className="mt-3 text-base text-[#91A39E] leading-relaxed">
            Production-tested tools across frontend architecture, API design,
            database modeling, and delivery workflows.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SKILL_CATEGORIES.map((category) => (
              <div
                key={category}
                className="bg-[#111C22] border border-[#26343A] rounded-2xl p-6 space-y-4 animate-pulse"
              >
                <div className="h-5 w-44 bg-[#26343A] rounded" />
                <div className="space-y-3">
                  <div className="h-3 w-full bg-[#26343A]/70 rounded" />
                  <div className="h-3 w-5/6 bg-[#26343A]/70 rounded" />
                  <div className="h-3 w-4/5 bg-[#26343A]/70 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="bg-[#111C22] border border-[#26343A] rounded-2xl p-10 text-center">
            <p className="text-sm text-[#91A39E]">
              No technical skills are published yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SKILL_CATEGORIES.map((category, idx) => {
              const items = grouped[category];
              return (
                <motion.div
                  key={category}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="bg-[#111C22] border border-[#26343A] rounded-2xl p-6 sm:p-7"
                >
                  <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-[#26343A]">
                    <h3 className="text-lg font-semibold text-[#F4F7F6]">
                      {category}
                    </h3>
                    <span className="text-xs font-mono text-[#91A39E] tabular-nums">
                      {items.length} {items.length === 1 ? 'skill' : 'skills'}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-sm text-[#91A39E]">
                      No entries added in this category.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {items.map((skill) => (
                        <div key={skill.id} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="font-medium text-[#F4F7F6]">
                              {skill.name}
                            </span>
                            <span className="font-mono text-xs text-[#B5F5E5] tabular-nums">
                              {skill.proficiency}%
                            </span>
                          </div>
                          <div
                            className="h-1.5 w-full rounded-full bg-[#080D12] overflow-hidden"
                            role="progressbar"
                            aria-valuenow={skill.proficiency}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${skill.name} proficiency`}
                          >
                            <motion.div
                              initial={
                                prefersReducedMotion
                                  ? { scaleX: skill.proficiency / 100 }
                                  : { scaleX: 0 }
                              }
                              whileInView={{ scaleX: skill.proficiency / 100 }}
                              viewport={{ once: true, amount: 0.2 }}
                              transition={{
                                duration: 0.65,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              style={{ transformOrigin: 'left' }}
                              className="h-full w-full rounded-full bg-[#00D6A3]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
