import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { AboutSection } from '../components/portfolio/AboutSection';
import { ContactSection } from '../components/portfolio/ContactSection';
import { Footer } from '../components/portfolio/Footer';
import { HeroSection } from '../components/portfolio/HeroSection';
import { ProjectsSection } from '../components/portfolio/ProjectsSection';
import { ServicesSection } from '../components/portfolio/ServicesSection';
import { SkillsSection } from '../components/portfolio/SkillsSection';
import {
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SKILLS,
} from '../data/defaults';
import { subscribePublicPortfolio } from '../services/portfolioService';
import type {
  Project,
  ServiceItem,
  SiteSettings,
  Skill,
} from '../types/portfolio';

export function PortfolioPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [services, setServices] = useState<ServiceItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefilledSubject, setPrefilledSubject] = useState('');

  useEffect(() => {
    let settledCount = 0;
    const markSettled = () => {
      settledCount += 1;
      if (settledCount >= 4) {
        setLoading(false);
      }
    };

    const unsubscribe = subscribePublicPortfolio({
      onSettings: (data) => {
        setSettings(data);
        markSettled();
      },
      onProjects: (items) => {
        setProjects(items);
        markSettled();
      },
      onSkills: (items) => {
        setSkills(items);
        markSettled();
      },
      onServices: (items) => {
        setServices(items);
        markSettled();
      },
      onError: () => {
        setLoading(false);
      },
    });

    const fallbackTimer = window.setTimeout(() => setLoading(false), 1800);

    return () => {
      window.clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  const activeSettings = settings ?? DEFAULT_SITE_SETTINGS;
  const activeProjects =
    projects && projects.length > 0 ? projects : DEFAULT_PROJECTS;
  const activeSkills = skills && skills.length > 0 ? skills : DEFAULT_SKILLS;
  const activeServices =
    services && services.length > 0 ? services : DEFAULT_SERVICES;

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInquireService = (serviceTitle: string) => {
    setPrefilledSubject(`Inquiry: ${serviceTitle}`);
    scrollToSection('contact');
  };

  return (
    <div className="min-h-screen bg-[#080D12] text-[#F4F7F6]">
      <Navbar
        brandName={activeSettings.brandName}
        onNavigateSection={scrollToSection}
      />

      <main>
        <HeroSection
          settings={activeSettings}
          onExploreWork={() => scrollToSection('projects')}
          onContactMe={() => scrollToSection('contact')}
        />
        <AboutSection settings={activeSettings} />
        <SkillsSection
          skills={activeSkills}
          loading={loading && skills === null}
        />
        <ProjectsSection
          projects={activeProjects}
          loading={loading && projects === null}
        />
        <ServicesSection
          services={activeServices}
          loading={loading && services === null}
          onInquireService={handleInquireService}
        />
        <ContactSection
          settings={activeSettings}
          prefilledSubject={prefilledSubject}
        />
      </main>

      <Footer settings={activeSettings} />
    </div>
  );
}
