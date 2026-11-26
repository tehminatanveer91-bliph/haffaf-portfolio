import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  FolderGit2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Project, ProjectCategory } from '../../types/portfolio';
import {
  PROJECT_CATEGORIES,
  filterProjectsByCategory,
  sanitizeExternalUrl,
} from '../../utils/validation';

interface ProjectsSectionProps {
  projects: Project[];
  loading: boolean;
}

export function ProjectsSection({ projects, loading }: ProjectsSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>(
    'All'
  );
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const visibleProjects = filterProjectsByCategory(projects, selectedCategory);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveProject(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const categories: Array<'All' | ProjectCategory> = [
    'All',
    ...PROJECT_CATEGORIES,
  ];

  return (
    <section
      id="projects"
      className="py-20 md:py-24 border-b border-[#26343A] bg-[#080D12]"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-[#00D6A3]">
              03. Selected Work
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F7F6] [text-wrap:balance]">
              Production systems and client platforms.
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter projects by category"
            className="flex flex-wrap items-center gap-1.5 p-1 bg-[#111C22] border border-[#26343A] rounded-xl self-start lg:self-auto"
          >
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D6A3] ${
                    active
                      ? 'bg-[#00D6A3] text-[#080D12]'
                      : 'text-[#91A39E] hover:text-[#F4F7F6]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((skeleton) => (
              <div
                key={skeleton}
                className="bg-[#111C22] border border-[#26343A] rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-[#26343A]/40" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-28 bg-[#26343A] rounded" />
                  <div className="h-6 w-2/3 bg-[#26343A] rounded" />
                  <div className="h-4 w-full bg-[#26343A]/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="bg-[#111C22] border border-[#26343A] rounded-2xl p-12 text-center space-y-3">
            <p className="text-base font-medium text-[#F4F7F6]">
              No projects match the {selectedCategory} category yet.
            </p>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#26343A] text-[#00D6A3] hover:border-[#00D6A3] transition-colors"
              >
                Show All Projects
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleProjects.map((project, index) => {
              const liveUrl = sanitizeExternalUrl(project.liveUrl);
              const githubUrl = sanitizeExternalUrl(project.githubUrl);
              const thumbUrl = sanitizeExternalUrl(project.thumbnailUrl);
              const showFallback = !thumbUrl || brokenImages[project.id];

              return (
                <motion.article
                  key={project.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="group bg-[#111C22] border border-[#26343A] rounded-2xl overflow-hidden flex flex-col hover:border-[#00D6A3]/45 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveProject(project)}
                    aria-label={`Inspect ${project.title} details`}
                    className="relative aspect-[4/3] w-full overflow-hidden bg-[#080D12] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D6A3]"
                  >
                    {!showFallback ? (
                      <img
                        src={thumbUrl}
                        alt={`${project.title} preview`}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [project.id]: true,
                          }))
                        }
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-[#111C22] to-[#080D12]">
                        <Code2 className="w-9 h-9 text-[#00D6A3]" />
                        <span className="text-sm font-medium text-[#91A39E]">
                          {project.title}
                        </span>
                      </div>
                    )}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080D12]/60 via-transparent to-transparent"
                    />
                  </button>

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-[#91A39E]">
                        <span className="text-[#00D6A3] font-medium">
                          {project.category}
                        </span>
                        {project.featured && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Featured Case Study</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-[#F4F7F6] tracking-tight">
                        {project.title}
                      </h3>

                      <p className="text-sm text-[#91A39E] leading-relaxed line-clamp-3">
                        {project.description}
                      </p>

                      <p className="pt-1 text-xs font-mono text-[#B5F5E5]/85">
                        {project.technologies.join(' · ')}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#26343A] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        {liveUrl && (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D6A3] hover:text-[#B5F5E5] transition-colors whitespace-nowrap"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {githubUrl && (
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#91A39E] hover:text-[#F4F7F6] transition-colors whitespace-nowrap"
                          >
                            <FolderGit2 className="w-3.5 h-3.5" />
                            <span>GitHub</span>
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveProject(project)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#F4F7F6] hover:text-[#00D6A3] transition-colors whitespace-nowrap"
                      >
                        <span>Read Overview</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Detail Lightbox Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#080D12]/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#111C22] border border-[#26343A] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#26343A]">
                <div className="text-xs font-medium text-[#00D6A3]">
                  {activeProject.category}
                </div>
                <button
                  type="button"
                  aria-label="Close project details"
                  onClick={() => setActiveProject(null)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#26343A] text-[#91A39E] hover:text-[#F4F7F6] hover:border-[#00D6A3]/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-6">
                {sanitizeExternalUrl(activeProject.thumbnailUrl) &&
                  !brokenImages[activeProject.id] && (
                    <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-[#26343A] bg-[#080D12]">
                      <img
                        src={sanitizeExternalUrl(activeProject.thumbnailUrl)}
                        alt={activeProject.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                <div className="space-y-3">
                  <h3
                    id="project-modal-title"
                    className="text-2xl font-bold text-[#F4F7F6]"
                  >
                    {activeProject.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#91A39E] leading-relaxed">
                    {activeProject.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#26343A] space-y-2">
                  <p className="text-xs font-medium text-[#91A39E]">
                    Technologies Used
                  </p>
                  <p className="text-sm font-mono text-[#B5F5E5]">
                    {activeProject.technologies.join(' · ')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {sanitizeExternalUrl(activeProject.liveUrl) && (
                    <a
                      href={sanitizeExternalUrl(activeProject.liveUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] transition-colors"
                    >
                      <span>Open Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {sanitizeExternalUrl(activeProject.githubUrl) && (
                    <a
                      href={sanitizeExternalUrl(activeProject.githubUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border border-[#26343A] bg-[#080D12] text-[#F4F7F6] hover:border-[#00D6A3]/60 transition-colors"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>View Source on GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
