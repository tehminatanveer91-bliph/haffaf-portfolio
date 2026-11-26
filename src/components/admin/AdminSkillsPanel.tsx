import { useState, type FormEvent } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { deleteSkill, saveSkill } from '../../services/portfolioService';
import type { Skill, SkillCategory } from '../../types/portfolio';
import { SKILL_CATEGORIES, groupSkillsByCategory } from '../../utils/validation';

interface AdminSkillsPanelProps {
  skills: Skill[];
}

export function AdminSkillsPanel({ skills }: AdminSkillsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillCategory>('Frontend Development');
  const [proficiency, setProficiency] = useState(90);
  const [order, setOrder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const grouped = groupSkillsByCategory(skills);

  const openNew = () => {
    setEditingId(null);
    setName('');
    setCategory('Frontend Development');
    setProficiency(90);
    setOrder(skills.length + 1);
    setError('');
    setIsFormOpen(true);
  };

  const openEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setName(skill.name);
    setCategory(skill.category);
    setProficiency(skill.proficiency);
    setOrder(skill.order);
    setError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await saveSkill(
        { name, category, proficiency, order },
        editingId ?? undefined
      );
      setIsFormOpen(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save skill.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await deleteSkill(id);
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F7F6]">Skills</h1>
          <p className="mt-1 text-sm text-[#91A39E]">
            Organize engineering capabilities across the four portfolio domains.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
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

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#111C22] border border-[#26343A] rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#26343A] pb-3">
            <h2 className="text-base font-semibold text-[#F4F7F6]">
              {editingId ? 'Edit Skill' : 'New Skill'}
            </h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              aria-label="Close skill form"
              className="p-1.5 text-[#91A39E] hover:text-[#F4F7F6]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="skill-name"
                className="block text-xs font-medium text-[#F4F7F6]"
              >
                Skill Name
              </label>
              <input
                id="skill-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="TypeScript"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="skill-category"
                className="block text-xs font-medium text-[#F4F7F6]"
              >
                Category
              </label>
              <select
                id="skill-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as SkillCategory)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
              >
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="skill-proficiency"
                className="block text-xs font-medium text-[#F4F7F6]"
              >
                Proficiency ({proficiency}%)
              </label>
              <input
                id="skill-proficiency"
                type="range"
                min={1}
                max={100}
                value={proficiency}
                onChange={(e) => setProficiency(Number(e.target.value))}
                className="w-full accent-[#00D6A3]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="skill-order"
                className="block text-xs font-medium text-[#F4F7F6]"
              >
                Display Order
              </label>
              <input
                id="skill-order"
                type="number"
                min={0}
                max={10000}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] tabular-nums focus:outline-none focus:border-[#00D6A3]"
              />
            </div>
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
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingId ? 'Save Skill' : 'Create Skill'}</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SKILL_CATEGORIES.map((cat) => {
          const items = grouped[cat];
          return (
            <div
              key={cat}
              className="bg-[#111C22] border border-[#26343A] rounded-xl overflow-hidden"
            >
              <div className="px-5 py-3.5 border-b border-[#26343A] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#F4F7F6]">{cat}</h2>
                <span className="text-xs font-mono text-[#91A39E] tabular-nums">
                  {items.length}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="p-6 text-xs text-[#91A39E]">
                  No skills in this category yet.
                </div>
              ) : (
                <div className="divide-y divide-[#26343A]">
                  {items.map((skill) => (
                    <div
                      key={skill.id}
                      className="px-5 py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#F4F7F6] truncate">
                          {skill.name}
                        </p>
                        <p className="text-xs font-mono text-[#00D6A3] tabular-nums">
                          {skill.proficiency}%
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(skill)}
                          aria-label={`Edit ${skill.name}`}
                          className="p-1.5 rounded-lg border border-[#26343A] text-[#91A39E] hover:text-[#F4F7F6] hover:border-[#00D6A3]/50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {confirmDeleteId === skill.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(skill.id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500 text-white"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-xs text-[#91A39E]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(skill.id)}
                            aria-label={`Delete ${skill.name}`}
                            className="p-1.5 rounded-lg border border-[#26343A] text-rose-300 hover:border-rose-500/50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
