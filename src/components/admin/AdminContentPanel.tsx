import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../../data/defaults';
import {
  deleteService,
  saveService,
  saveSiteSettings,
} from '../../services/portfolioService';
import type { ServiceItem, SiteSettings } from '../../types/portfolio';

interface AdminContentPanelProps {
  settings: SiteSettings | null;
  services: ServiceItem[];
}

export function AdminContentPanel({
  settings,
  services,
}: AdminContentPanelProps) {
  const [siteForm, setSiteForm] = useState<Omit<SiteSettings, 'updatedAt'>>(
    settings ?? DEFAULT_SITE_SETTINGS
  );
  const [savingSite, setSavingSite] = useState(false);
  const [siteNotice, setSiteNotice] = useState('');
  const [siteError, setSiteError] = useState('');

  // Service Editor state
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceDeliverables, setServiceDeliverables] = useState('');
  const [serviceOrder, setServiceOrder] = useState(1);
  const [serviceActive, setServiceActive] = useState(true);
  const [savingService, setSavingService] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState('');

  useEffect(() => {
    if (settings) {
      setSiteForm({
        brandName: settings.brandName,
        heroHeading: settings.heroHeading,
        heroIntro: settings.heroIntro,
        availabilityText: settings.availabilityText,
        availableForWork: settings.availableForWork,
        aboutTitle: settings.aboutTitle,
        aboutLead: settings.aboutLead,
        aboutBody: settings.aboutBody,
        yearsExperience: settings.yearsExperience,
        projectsDelivered: settings.projectsDelivered,
        location: settings.location,
        contactEmail: settings.contactEmail,
        githubUrl: settings.githubUrl,
        linkedinUrl: settings.linkedinUrl,
        twitterUrl: settings.twitterUrl,
      });
    }
  }, [settings]);

  const handleSaveSite = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSiteError('');
    setSiteNotice('');
    setSavingSite(true);
    try {
      await saveSiteSettings(siteForm);
      setSiteNotice('Website content and settings updated.');
    } catch (err) {
      setSiteError(
        err instanceof Error ? err.message : 'Unable to save site settings.'
      );
    } finally {
      setSavingSite(false);
    }
  };

  const openNewService = () => {
    setEditingServiceId(null);
    setServiceTitle('');
    setServiceDesc('');
    setServiceDeliverables('Architecture, Implementation, QA');
    setServiceOrder(services.length + 1);
    setServiceActive(true);
    setServiceError('');
    setServiceFormOpen(true);
  };

  const openEditService = (svc: ServiceItem) => {
    setEditingServiceId(svc.id);
    setServiceTitle(svc.title);
    setServiceDesc(svc.description);
    setServiceDeliverables(svc.deliverables.join(', '));
    setServiceOrder(svc.order);
    setServiceActive(svc.active);
    setServiceError('');
    setServiceFormOpen(true);
  };

  const handleSaveService = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServiceError('');
    setSavingService(true);
    const deliverables = serviceDeliverables
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    try {
      await saveService(
        {
          title: serviceTitle,
          description: serviceDesc,
          deliverables,
          order: serviceOrder,
          active: serviceActive,
        },
        editingServiceId ?? undefined
      );
      setServiceFormOpen(false);
      setEditingServiceId(null);
    } catch (err) {
      setServiceError(
        err instanceof Error ? err.message : 'Unable to save service.'
      );
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    setServiceError('');
    try {
      await deleteService(id);
      setConfirmDeleteId(null);
    } catch (err) {
      setServiceError(
        err instanceof Error ? err.message : 'Unable to delete service.'
      );
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F7F6]">
          Website Content & Services
        </h1>
        <p className="mt-1 text-sm text-[#91A39E]">
          Update hero copy, about narrative, availability, social links, and
          service offerings. Changes reflect immediately on the public site.
        </p>
      </div>

      <form
        onSubmit={handleSaveSite}
        className="bg-[#111C22] border border-[#26343A] rounded-xl p-6 space-y-6"
      >
        <h2 className="text-base font-semibold text-[#F4F7F6] border-b border-[#26343A] pb-3">
          Hero, About & Social Settings
        </h2>

        {siteError && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-xs text-rose-200"
          >
            {siteError}
          </div>
        )}
        {siteNotice && (
          <div
            role="status"
            className="p-3.5 rounded-lg bg-[#00D6A3]/10 border border-[#00D6A3]/40 text-xs text-[#B5F5E5]"
          >
            {siteNotice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="site-brand"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              Brand Wordmark
            </label>
            <input
              id="site-brand"
              type="text"
              required
              value={siteForm.brandName}
              onChange={(e) =>
                setSiteForm({ ...siteForm, brandName: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="site-availability"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              Availability Status Text
            </label>
            <input
              id="site-availability"
              type="text"
              required
              value={siteForm.availabilityText}
              onChange={(e) =>
                setSiteForm({ ...siteForm, availabilityText: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
            />
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-[#F4F7F6] cursor-pointer">
          <input
            type="checkbox"
            checked={siteForm.availableForWork}
            onChange={(e) =>
              setSiteForm({ ...siteForm, availableForWork: e.target.checked })
            }
            className="accent-[#00D6A3]"
          />
          <span>Available for new client work</span>
        </label>

        <div className="space-y-1.5">
          <label
            htmlFor="site-hero-heading"
            className="block text-xs font-medium text-[#F4F7F6]"
          >
            Hero Heading
          </label>
          <input
            id="site-hero-heading"
            type="text"
            required
            value={siteForm.heroHeading}
            onChange={(e) =>
              setSiteForm({ ...siteForm, heroHeading: e.target.value })
            }
            className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="site-hero-intro"
            className="block text-xs font-medium text-[#F4F7F6]"
          >
            Hero Introduction
          </label>
          <textarea
            id="site-hero-intro"
            rows={2}
            required
            value={siteForm.heroIntro}
            onChange={(e) =>
              setSiteForm({ ...siteForm, heroIntro: e.target.value })
            }
            className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="site-about-title"
            className="block text-xs font-medium text-[#F4F7F6]"
          >
            About Section Title
          </label>
          <input
            id="site-about-title"
            type="text"
            required
            value={siteForm.aboutTitle}
            onChange={(e) =>
              setSiteForm({ ...siteForm, aboutTitle: e.target.value })
            }
            className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="site-about-lead"
            className="block text-xs font-medium text-[#F4F7F6]"
          >
            About Lead Statement
          </label>
          <textarea
            id="site-about-lead"
            rows={2}
            required
            value={siteForm.aboutLead}
            onChange={(e) =>
              setSiteForm({ ...siteForm, aboutLead: e.target.value })
            }
            className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="site-about-body"
            className="block text-xs font-medium text-[#F4F7F6]"
          >
            About Journey & Bio
          </label>
          <textarea
            id="site-about-body"
            rows={4}
            required
            value={siteForm.aboutBody}
            onChange={(e) =>
              setSiteForm({ ...siteForm, aboutBody: e.target.value })
            }
            className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="site-exp"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              Experience Label
            </label>
            <input
              id="site-exp"
              type="text"
              required
              value={siteForm.yearsExperience}
              onChange={(e) =>
                setSiteForm({ ...siteForm, yearsExperience: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="site-deliv"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              Delivery Label
            </label>
            <input
              id="site-deliv"
              type="text"
              required
              value={siteForm.projectsDelivered}
              onChange={(e) =>
                setSiteForm({ ...siteForm, projectsDelivered: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="site-loc"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              Location
            </label>
            <input
              id="site-loc"
              type="text"
              required
              value={siteForm.location}
              onChange={(e) =>
                setSiteForm({ ...siteForm, location: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="site-email"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              Contact Email
            </label>
            <input
              id="site-email"
              type="email"
              required
              value={siteForm.contactEmail}
              onChange={(e) =>
                setSiteForm({ ...siteForm, contactEmail: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="site-github"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              GitHub URL
            </label>
            <input
              id="site-github"
              type="url"
              value={siteForm.githubUrl}
              onChange={(e) =>
                setSiteForm({ ...siteForm, githubUrl: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="site-linkedin"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              LinkedIn URL
            </label>
            <input
              id="site-linkedin"
              type="url"
              value={siteForm.linkedinUrl}
              onChange={(e) =>
                setSiteForm({ ...siteForm, linkedinUrl: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="site-twitter"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              X / Twitter URL
            </label>
            <input
              id="site-twitter"
              type="url"
              value={siteForm.twitterUrl}
              onChange={(e) =>
                setSiteForm({ ...siteForm, twitterUrl: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#26343A]">
          <button
            type="submit"
            disabled={savingSite}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] disabled:opacity-60 transition-colors"
          >
            {savingSite && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Website Settings</span>
          </button>
        </div>
      </form>

      {/* Services Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#F4F7F6]">
            Services Management
          </h2>
          <button
            type="button"
            onClick={openNewService}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        {serviceError && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-xs text-rose-200"
          >
            {serviceError}
          </div>
        )}

        {serviceFormOpen && (
          <form
            onSubmit={handleSaveService}
            className="bg-[#111C22] border border-[#26343A] rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#26343A] pb-3">
              <h3 className="text-sm font-semibold text-[#F4F7F6]">
                {editingServiceId ? 'Edit Service' : 'New Service'}
              </h3>
              <button
                type="button"
                onClick={() => setServiceFormOpen(false)}
                aria-label="Close service editor"
                className="p-1.5 text-[#91A39E] hover:text-[#F4F7F6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label
                  htmlFor="svc-title"
                  className="block text-xs font-medium text-[#F4F7F6]"
                >
                  Service Title
                </label>
                <input
                  id="svc-title"
                  type="text"
                  required
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="svc-order"
                  className="block text-xs font-medium text-[#F4F7F6]"
                >
                  Order
                </label>
                <input
                  id="svc-order"
                  type="number"
                  min={0}
                  max={10000}
                  value={serviceOrder}
                  onChange={(e) => setServiceOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] tabular-nums focus:outline-none focus:border-[#00D6A3]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="svc-desc"
                className="block text-xs font-medium text-[#F4F7F6]"
              >
                Description
              </label>
              <textarea
                id="svc-desc"
                rows={2}
                required
                value={serviceDesc}
                onChange={(e) => setServiceDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="svc-deliv"
                className="block text-xs font-medium text-[#F4F7F6]"
              >
                Deliverables (comma-separated, max 8)
              </label>
              <input
                id="svc-deliv"
                type="text"
                required
                value={serviceDeliverables}
                onChange={(e) => setServiceDeliverables(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] focus:outline-none focus:border-[#00D6A3]"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-[#F4F7F6] cursor-pointer">
              <input
                type="checkbox"
                checked={serviceActive}
                onChange={(e) => setServiceActive(e.target.checked)}
                className="accent-[#00D6A3]"
              />
              <span>Visible on public portfolio</span>
            </label>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#26343A]">
              <button
                type="button"
                onClick={() => setServiceFormOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#26343A] text-[#91A39E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingService}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] disabled:opacity-60"
              >
                {savingService && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>{editingServiceId ? 'Save Service' : 'Create Service'}</span>
              </button>
            </div>
          </form>
        )}

        <div className="bg-[#111C22] border border-[#26343A] rounded-xl divide-y divide-[#26343A]">
          {services.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#91A39E]">
              No services stored in Firestore yet.
            </div>
          ) : (
            services.map((svc) => (
              <div
                key={svc.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-[#00D6A3] tabular-nums">
                      #{svc.order}
                    </span>
                    <span className="text-[#26343A]">·</span>
                    <span
                      className={
                        svc.active ? 'text-[#B5F5E5]' : 'text-[#91A39E]'
                      }
                    >
                      {svc.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[#F4F7F6]">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-[#91A39E] line-clamp-1">
                    {svc.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditService(svc)}
                    aria-label={`Edit ${svc.title}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#26343A] bg-[#080D12] text-[#F4F7F6] hover:border-[#00D6A3]/50"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  {confirmDeleteId === svc.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDeleteService(svc.id)}
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
                      onClick={() => setConfirmDeleteId(svc.id)}
                      aria-label={`Delete ${svc.title}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#26343A] bg-[#080D12] text-rose-300 hover:border-rose-500/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
