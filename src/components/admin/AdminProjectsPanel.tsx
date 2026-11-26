import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  deleteProject,
  saveProject,
  uploadProjectThumbnail,
} from '../../services/portfolioService';
import type { Project, ProjectCategory } from '../../types/portfolio';
import { PROJECT_CATEGORIES } from '../../utils/validation';

interface AdminProjectsPanelProps {
  projects: Project[];
}

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Full-Stack' as ProjectCategory,
  technologiesText: 'Next.js, TypeScript, Firebase',
  thumbnailUrl: '',
  liveUrl: '',
  githubUrl: '',
  published: true,
  featured: false,
  order: 1,
};

export function AdminProjectsPanel({ projects }: AdminProjectsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const openNewForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order: projects.length + 1 });
    setError('');
    setNotice('');
    setIsFormOpen(true);
  };

  const openEditForm = (project: Project) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      category: project.category,
      technologiesText: project.technologies.join(', '),
      thumbnailUrl: project.thumbnailUrl,
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
      published: project.published,
      featured: project.featured,
      order: project.order,
    });
    setError('');
    setNotice('');
    setIsFormOpen(true);
  };

  const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadProjectThumbnail(file);
      setForm((prev) => ({ ...prev, thumbnailUrl: url }));
      setNotice('Thumbnail uploaded to Firebase Storage.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Storage upload failed. You can also paste an image URL.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);

    const technologies = form.technologiesText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await saveProject(
        {
          title: form.title,
          description: form.description,
          category: form.category,
          technologies,
          thumbnailUrl: form.thumbnailUrl,
          liveUrl: form.liveUrl,
          githubUrl: form.githubUrl,
          published: form.published,
          featured: form.featured,
          order: Number(form.order) || 1,
        },
        editingId ?? undefined
      );
      setIsFormOpen(false);
      setEditingId(null);
      setNotice(editingId ? 'Project updated.' : 'Project created.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (project: Project) => {
    setError('');
    try {
      await saveProject(
        {
          title: project.title,
          description: project.description,
          category: project.category,
          technologies: project.technologies,
          thumbnailUrl: project.thumbnailUrl,
          liveUrl: project.liveUrl,
          githubUrl: project.githubUrl,
          published: !project.published,
          featured: project.featured,
          order: project.order,
        },
        project.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle visibility.');
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await deleteProject(id);
      setConfirmDeleteId(null);
      setNotice('Project deleted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F7F6]">Projects</h1>
          <p className="mt-1 text-sm text-[#91A39E]">
            Manage case studies, thumbnails, technology tags, and publish states.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewForm}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-xs text-rose-200"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="p-3.5 rounded-lg bg-[#00D6A3]/10 border border-[#00D6A3]/40 text-xs text-[#B5F5E5]"
        >
          {notice}
        </div>
      )}

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#111C22] border border-[#26343A] rounded-xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#26343A] pb-4">
            <h2 className="text-base font-semibold text-[#F4F7F6]">
              {editingId ? 'Edit Project' : 'New Project'}
            </h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              aria-label="Close project editor"
              className="p-1.5 rounded-lg text-[#91A39E] hover:text-[#F4F7F6]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="proj-title"
                className="block text-xs font-medium text-[#F4F7F6]"
              >
                Title
              </label>
              <input
                id="proj-title"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="proj-category"
                  className="block text-xs font-medium text-[#F4F7F6]"
                >
                  Category
                </label>
                <select
                  id="proj-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value as ProjectCategory,
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
                >
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="proj-order"
                  className="block text-xs font-medium text-[#F4F7F6]"
                >
                  Display Order
                </label>
                <input
                  id="proj-order"
                  type="number"
                  min={0}
                  max={10000}
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] tabular-nums focus:outline-none focus:border-[#00D6A3]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="proj-desc"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              Description
            </label>
            <textarea
              id="proj-desc"
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="proj-tech"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              Technologies (comma-separated, max 12)
            </label>
            <input
              id="proj-tech"
              type="text"
              required
              value={form.technologiesText}
              onChange={(e) =>
                setForm({ ...form, technologiesText: e.target.value })
              }
              placeholder="Next.js, TypeScript, Firebase, Tailwind CSS"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="proj-live"
                className="block text-xs font-medium text-[#F4F7F6]"
              >
                Live Demo URL
              </label>
              <input
                id="proj-live"
                type="url"
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                placeholder="https://example.vercel.app"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="proj-github"
                className="block text-xs font-medium text-[#F4F7F6]"
              >
                GitHub URL
              </label>
              <input
                id="proj-github"
                type="url"
                value={form.githubUrl}
                onChange={(e) =>
                  setForm({ ...form, githubUrl: e.target.value })
                }
                placeholder="https://github.com/haffaf/project"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="proj-thumb"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              Thumbnail URL or Upload Image to Firebase Storage
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="proj-thumb"
                type="text"
                value={form.thumbnailUrl}
                onChange={(e) =>
                  setForm({ ...form, thumbnailUrl: e.target.value })
                }
                placeholder="https://... or /src/assets/images/..."
                className="flex-1 px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
              />
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border border-[#26343A] bg-[#080D12] text-[#F4F7F6] hover:border-[#00D6A3] cursor-pointer whitespace-nowrap shrink-0">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#00D6A3]" />
                ) : (
                  <Upload className="w-4 h-4 text-[#00D6A3]" />
                )}
                <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleThumbnailUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-[#F4F7F6] cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm({ ...form, published: e.target.checked })
                }
                className="rounded border-[#26343A] accent-[#00D6A3]"
              />
              <span>Published on public portfolio</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-[#F4F7F6] cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
                className="rounded border-[#26343A] accent-[#00D6A3]"
              />
              <span>Featured project</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#26343A]">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#26343A] text-[#91A39E] hover:text-[#F4F7F6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingId ? 'Save Changes' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#111C22] border border-[#26343A] rounded-xl overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#91A39E]">
            No projects stored in Firestore yet. Click &ldquo;Add Project&rdquo;
            to create one.
          </div>
        ) : (
          <div className="divide-y divide-[#26343A]">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-[#00D6A3]">
                      {project.category}
                    </span>
                    <span className="text-[#26343A]">·</span>
                    <span
                      className={
                        project.published ? 'text-[#B5F5E5]' : 'text-[#91A39E]'
                      }
                    >
                      {project.published ? 'Published' : 'Draft'}
                    </span>
                    {project.featured && (
                      <>
                        <span className="text-[#26343A]">·</span>
                        <span className="text-[#F4F7F6]">Featured</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-[#F4F7F6] truncate">
                    {project.title}
                  </h3>
                  <p className="text-xs font-mono text-[#91A39E] truncate">
                    {project.technologies.join(' · ')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePublished(project)}
                    aria-label={
                      project.published
                        ? `Unpublish ${project.title}`
                        : `Publish ${project.title}`
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#26343A] bg-[#080D12] text-[#91A39E] hover:text-[#F4F7F6] hover:border-[#00D6A3]/50"
                  >
                    {project.published ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-[#00D6A3]" />
                    )}
                    <span>{project.published ? 'Unpublish' : 'Publish'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditForm(project)}
                    aria-label={`Edit ${project.title}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#26343A] bg-[#080D12] text-[#F4F7F6] hover:border-[#00D6A3]/50"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {confirmDeleteId === project.id ? (
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(project.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-600"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1.5 text-xs text-[#91A39E] hover:text-[#F4F7F6]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(project.id)}
                      aria-label={`Delete ${project.title}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#26343A] bg-[#080D12] text-rose-300 hover:border-rose-500/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
