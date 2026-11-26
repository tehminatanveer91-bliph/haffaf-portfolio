import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDashboardMetrics,
  filterProjectsByCategory,
  groupSkillsByCategory,
  isSafeHttpUrl,
  validateContactInput,
  validateProjectInput,
  validateSkillInput,
} from './validation';
import type { ContactMessage, Project, Skill } from '../types/portfolio';

test('isSafeHttpUrl blocks javascript: and data: XSS URLs while allowing safe https and local assets', () => {
  assert.equal(isSafeHttpUrl('https://github.com/haffaf'), true);
  assert.equal(isSafeHttpUrl('http://localhost:3000'), true);
  assert.equal(isSafeHttpUrl('/src/assets/images/hero.jpg', true), true);
  assert.equal(isSafeHttpUrl('/src/assets/images/hero.jpg', false), false);
  assert.equal(isSafeHttpUrl('javascript:alert(1)', true), false);
  assert.equal(isSafeHttpUrl('data:text/html,<script>alert(1)</script>', true), false);
});

test('validateContactInput enforces field bounds, email syntax, honeypot, and cooldown', () => {
  const validResult = validateContactInput({
    name: 'Amina Farooq',
    email: 'amina@example.com',
    subject: 'Architecture Advisory',
    message: 'We would love to discuss a Next.js and Firebase platform build.',
    honeypot: '',
    lastSubmittedAt: null,
    now: 100_000,
  });
  assert.equal(validResult.valid, true);

  const invalidEmail = validateContactInput({
    name: 'Amina',
    email: 'not-an-email',
    subject: 'Hi there',
    message: 'This is a valid message body.',
  });
  assert.equal(invalidEmail.valid, false);
  assert.ok(invalidEmail.errors.email);

  const honeypotTriggered = validateContactInput({
    name: 'Bot',
    email: 'bot@example.com',
    subject: 'Spam offer',
    message: 'Click this link for free traffic!',
    honeypot: 'http://spam.example.com',
  });
  assert.equal(honeypotTriggered.valid, false);
  assert.ok(honeypotTriggered.errors.form);

  const cooldownBlocked = validateContactInput({
    name: 'Amina',
    email: 'amina@example.com',
    subject: 'Follow up',
    message: 'Sending another quick inquiry right away.',
    lastSubmittedAt: 95_000,
    now: 100_000,
  });
  assert.equal(cooldownBlocked.valid, false);
  assert.ok(cooldownBlocked.errors.form);
});

test('validateProjectInput and validateSkillInput enforce schema constraints', () => {
  const validProject = validateProjectInput({
    title: 'LedgerFlow Analytics',
    description: 'Real-time treasury telemetry dashboard with role-based permissions.',
    category: 'Full-Stack',
    technologies: ['TypeScript', 'React', 'Firebase'],
    thumbnailUrl: '/src/assets/images/project_fintech_ledger_1795686527155.jpg',
    liveUrl: 'https://ledgerflow.example.com',
    githubUrl: 'https://github.com/haffaf/ledgerflow',
    published: true,
    featured: true,
    order: 1,
  });
  assert.equal(validProject.valid, true);

  const badProject = validateProjectInput({
    title: 'X',
    description: 'Too short',
    category: 'Full-Stack',
    technologies: [],
    thumbnailUrl: 'javascript:alert(1)',
    liveUrl: 'ftp://invalid.com',
    githubUrl: '',
    published: true,
    featured: false,
    order: 1,
  });
  assert.equal(badProject.valid, false);
  assert.ok(badProject.errors.title);
  assert.ok(badProject.errors.technologies);
  assert.ok(badProject.errors.thumbnailUrl);
  assert.ok(badProject.errors.liveUrl);

  const badSkill = validateSkillInput({
    name: 'TypeScript',
    category: 'Frontend Development',
    proficiency: 105,
    order: 1,
  });
  assert.equal(badSkill.valid, false);
  assert.ok(badSkill.errors.proficiency);
});

test('filterProjectsByCategory, groupSkillsByCategory, and computeDashboardMetrics work deterministically', () => {
  const projects: Project[] = [
    {
      id: 'p2',
      title: 'Edge Cloud Console',
      description: 'Cloud monitoring plane',
      category: 'Cloud & APIs',
      technologies: ['Go', 'Docker'],
      thumbnailUrl: '',
      liveUrl: '',
      githubUrl: '',
      published: false,
      featured: false,
      order: 2,
    },
    {
      id: 'p1',
      title: 'Merchant Core',
      description: 'Headless storefront',
      category: 'Full-Stack',
      technologies: ['Next.js', 'TypeScript'],
      thumbnailUrl: '',
      liveUrl: '',
      githubUrl: '',
      published: true,
      featured: true,
      order: 1,
    },
  ];

  const allFiltered = filterProjectsByCategory(projects, 'All');
  assert.equal(allFiltered[0].id, 'p1');
  assert.equal(filterProjectsByCategory(projects, 'Cloud & APIs').length, 1);

  const skills: Skill[] = [
    { id: 's1', name: 'React', category: 'Frontend Development', proficiency: 95, order: 1 },
    { id: 's2', name: 'Node.js', category: 'Backend Development', proficiency: 90, order: 1 },
  ];
  const grouped = groupSkillsByCategory(skills);
  assert.equal(grouped['Frontend Development'].length, 1);
  assert.equal(grouped['Backend Development'].length, 1);
  assert.equal(grouped['Database & Cloud'].length, 0);

  const messages: ContactMessage[] = [
    { id: 'm1', name: 'A', email: 'a@b.com', subject: 'Hello', message: 'Long enough body', read: false },
    { id: 'm2', name: 'B', email: 'b@b.com', subject: 'Quote', message: 'Another valid body', read: true },
  ];

  const metrics = computeDashboardMetrics({ projects, skills, messages });
  assert.deepEqual(metrics, {
    totalProjects: 2,
    publishedProjects: 1,
    totalSkills: 2,
    totalMessages: 2,
    unreadMessages: 1,
  });
});
