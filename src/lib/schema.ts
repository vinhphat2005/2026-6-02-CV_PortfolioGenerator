import { z } from "zod";
import { createPortfolioDeck } from "./portfolioModel";
import { isSafeHttpUrl } from "./safeUrl";
import type { PresentationSettings, ProjectCollaboration, SectionId, TargetRole } from "./types";

export const portfolioDeckTemplateIds = [
  "editorial-blue",
  "architectural-minimal",
  "bold-studio-orange",
  "digital-agency-noir",
  "swiss-editorial-coral",
  "playful-product-grid"
] as const;

export const targetRoles = [
  "software-engineer-intern",
  "frontend-developer",
  "backend-developer",
  "fullstack-developer",
  "game-developer",
  "ai-automation-developer",
  "data-analyst"
] as const satisfies readonly TargetRole[];

export const roleLabels: Record<TargetRole, string> = {
  "software-engineer-intern": "Software Engineer Intern",
  "frontend-developer": "Frontend Developer",
  "backend-developer": "Backend Developer",
  "fullstack-developer": "Full-stack Developer",
  "game-developer": "Game Developer",
  "ai-automation-developer": "AI Automation Developer",
  "data-analyst": "Data Analyst"
};

export const projectCollaborations = [
  "personal",
  "team-member",
  "team-lead"
] as const satisfies readonly ProjectCollaboration[];

export const projectCollaborationLabels: Record<ProjectCollaboration, string> = {
  personal: "Personal Project",
  "team-member": "Team Project",
  "team-lead": "Team Project / Lead"
};

export const sectionIds = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "languages",
  "interests",
  "custom"
] as const satisfies readonly SectionId[];

export const defaultSectionLabels: Record<SectionId, string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages",
  interests: "Interests",
  custom: "Additional"
};

export const defaultPresentationSettings: PresentationSettings = {
  language: "en",
  sectionLabels: defaultSectionLabels,
  hiddenSections: [],
  sectionOrder: [...sectionIds],
  themeColor: "#365144",
  sidebarColor: "#174f93",
  fontPreset: "modern",
  targetRole: "fullstack-developer"
};

const shortText = z.string().trim().max(160);
const longText = z.string().trim().max(2000);
const bulletText = z.string().trim().max(500);
const urlText = z.string().trim().max(2048).url().refine(isSafeHttpUrl, {
  message: "Only http and https URLs are supported."
});
const httpsUrlText = urlText.refine((value) => value.startsWith("https://"), {
  message: "Portfolio images must use HTTPS."
});

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((value) => (value === "" ? undefined : value));

const optionalUrl = z
  .union([urlText, z.literal("")])
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const nonEmptyShort = shortText.min(1);
const nonEmptyLong = longText.min(1);
const nonEmptyBullet = bulletText.min(1);

export const LinkSchema = z.object({
  label: nonEmptyShort,
  url: urlText
});

export const SkillGroupSchema = z.object({
  category: nonEmptyShort,
  items: z.array(nonEmptyShort).min(1).max(30)
});

export const ExperienceSchema = z.object({
  company: nonEmptyShort,
  role: nonEmptyShort,
  location: optionalText(160),
  startDate: nonEmptyShort,
  endDate: optionalText(80),
  current: z.boolean().optional(),
  technologies: z.array(nonEmptyShort).max(30).default([]),
  highlights: z.array(nonEmptyBullet).min(1).max(12)
});

export const ProjectSchema = z.object({
  name: nonEmptyShort,
  description: nonEmptyLong,
  collaboration: z.enum(projectCollaborations).default("personal"),
  role: optionalText(160),
  url: optionalUrl,
  repo: optionalUrl,
  demo: optionalUrl,
  video: optionalUrl,
  technologies: z.array(nonEmptyShort).max(30).default([]),
  highlights: z.array(nonEmptyBullet).min(1).max(12),
  impact: optionalText(500)
});

export const EducationSchema = z.object({
  school: nonEmptyShort,
  degree: nonEmptyShort,
  location: optionalText(160),
  startDate: optionalText(80),
  endDate: optionalText(80),
  gpa: optionalText(120),
  highlights: z.array(nonEmptyBullet).max(8).default([])
});

export const CertificationSchema = z.object({
  name: nonEmptyShort,
  issuer: nonEmptyShort,
  date: optionalText(80),
  url: optionalUrl
});

export const LanguageSchema = z.object({
  name: nonEmptyShort,
  level: nonEmptyShort
});

export const CustomSectionSchema = z.object({
  id: nonEmptyShort,
  title: nonEmptyShort,
  items: z.array(nonEmptyBullet).max(20).default([])
});

export const PortfolioImageRefSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("url"),
    url: httpsUrlText,
    alt: optionalText(160)
  }),
  z.object({
    kind: z.literal("asset"),
    assetId: z.string().trim().min(8).max(100).regex(/^[a-zA-Z0-9._:-]+$/),
    alt: optionalText(160)
  })
]);

export const PortfolioMetricSchema = z.object({
  label: nonEmptyShort,
  value: nonEmptyShort
});

export const PortfolioCaseStudySchema = z.object({
  id: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9._:-]+$/),
  title: nonEmptyShort,
  subtitle: optionalText(320),
  role: optionalText(160),
  context: optionalText(320),
  year: optionalText(40),
  challenge: nonEmptyLong,
  goals: z.array(nonEmptyBullet).max(8).default([]),
  process: z.array(nonEmptyBullet).max(12).default([]),
  solution: nonEmptyLong,
  deliverables: z.array(nonEmptyShort).max(16).default([]),
  outcomes: z.array(nonEmptyBullet).max(12).default([]),
  metrics: z.array(PortfolioMetricSchema).max(8).default([]),
  tools: z.array(nonEmptyShort).max(30).default([]),
  coverImage: PortfolioImageRefSchema.optional(),
  gallery: z.array(PortfolioImageRefSchema).max(8).default([]),
  links: z.array(LinkSchema).max(8).default([]),
  includeInDeck: z.boolean().default(true)
});

export const PortfolioDeckSchema = z.object({
  templateId: z.enum(portfolioDeckTemplateIds).default("editorial-blue"),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#58b7d1"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#142b36"),
  title: nonEmptyShort,
  subtitle: nonEmptyShort,
  intro: nonEmptyLong,
  year: nonEmptyShort,
  audience: nonEmptyShort,
  capabilities: z.array(nonEmptyShort).max(20).default([]),
  contactCta: nonEmptyLong,
  caseStudies: z.array(PortfolioCaseStudySchema).max(12).default([])
});

export const ProfileSchema = z.object({
  personal: z.object({
    name: nonEmptyShort,
    title: nonEmptyShort,
    email: z.string().trim().email().max(254),
    phone: optionalText(80),
    location: optionalText(160),
    website: optionalUrl,
    photoUrl: optionalUrl,
    links: z.array(LinkSchema).max(8).default([])
  }),
  summary: nonEmptyLong,
  skills: z.array(SkillGroupSchema).min(1).max(16),
  experience: z.array(ExperienceSchema).max(12).default([]),
  projects: z.array(ProjectSchema).max(16).default([]),
  education: z.array(EducationSchema).max(8).default([]),
  certifications: z.array(CertificationSchema).max(12).default([]),
  languages: z.array(LanguageSchema).max(8).default([]),
  interests: z.array(nonEmptyShort).max(20).default([]),
  customSections: z.array(CustomSectionSchema).max(8).default([])
});

export const PresentationSettingsSchema = z.object({
  language: z.enum(["en", "vi", "custom"]).default("en"),
  sectionLabels: z.record(z.string().trim().max(40)).default(defaultSectionLabels),
  hiddenSections: z.array(z.string().trim().max(40)).max(20).default([]),
  sectionOrder: z.array(z.string().trim().max(40)).max(20).default([...sectionIds]),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#365144"),
  sidebarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#174f93"),
  fontPreset: z.enum(["modern", "classic", "compact", "serif"]).default("modern"),
  targetRole: z.enum(targetRoles).default("fullstack-developer")
});

export const ProfileDocumentSchema = z.object({
  profile: ProfileSchema,
  settings: PresentationSettingsSchema.default(defaultPresentationSettings),
  portfolio: PortfolioDeckSchema.default(createPortfolioDeck())
});

export function normalizeDocument(input: unknown) {
  const parsed = ProfileDocumentSchema.parse(input);
  return {
    ...parsed,
    settings: {
      ...defaultPresentationSettings,
      ...parsed.settings,
      sectionLabels: {
        ...defaultSectionLabels,
        ...parsed.settings.sectionLabels
      },
      sectionOrder: ensureAllSections(parsed.settings.sectionOrder)
    }
  };
}

export function ensureAllSections(order: string[]) {
  const known = order.filter((section): section is SectionId =>
    sectionIds.includes(section as SectionId)
  );
  const missing = sectionIds.filter((section) => !known.includes(section));
  return [...known, ...missing];
}
