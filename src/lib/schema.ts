import { z } from "zod";
import type { PresentationSettings, ProjectCollaboration, SectionId, TargetRole } from "./types";

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

const optionalUrl = z
  .union([z.string().url(), z.literal("")])
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const nonEmptyString = z.string().trim().min(1);

export const LinkSchema = z.object({
  label: nonEmptyString,
  url: z.string().url()
});

export const SkillGroupSchema = z.object({
  category: nonEmptyString,
  items: z.array(nonEmptyString).min(1)
});

export const ExperienceSchema = z.object({
  company: nonEmptyString,
  role: nonEmptyString,
  location: z.string().optional(),
  startDate: nonEmptyString,
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  technologies: z.array(nonEmptyString).default([]),
  highlights: z.array(nonEmptyString).min(1)
});

export const ProjectSchema = z.object({
  name: nonEmptyString,
  description: nonEmptyString,
  collaboration: z.enum(projectCollaborations).default("personal"),
  role: z.string().optional(),
  url: optionalUrl,
  repo: optionalUrl,
  demo: optionalUrl,
  video: optionalUrl,
  technologies: z.array(nonEmptyString).default([]),
  highlights: z.array(nonEmptyString).min(1),
  impact: z.string().optional()
});

export const EducationSchema = z.object({
  school: nonEmptyString,
  degree: nonEmptyString,
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  highlights: z.array(nonEmptyString).default([])
});

export const CertificationSchema = z.object({
  name: nonEmptyString,
  issuer: nonEmptyString,
  date: z.string().optional(),
  url: optionalUrl
});

export const LanguageSchema = z.object({
  name: nonEmptyString,
  level: nonEmptyString
});

export const CustomSectionSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  items: z.array(nonEmptyString).default([])
});

export const ProfileSchema = z.object({
  personal: z.object({
    name: nonEmptyString,
    title: nonEmptyString,
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: optionalUrl,
    photoUrl: optionalUrl,
    links: z.array(LinkSchema).default([])
  }),
  summary: nonEmptyString,
  skills: z.array(SkillGroupSchema).min(1),
  experience: z.array(ExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  education: z.array(EducationSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  interests: z.array(nonEmptyString).default([]),
  customSections: z.array(CustomSectionSchema).default([])
});

export const PresentationSettingsSchema = z.object({
  language: z.enum(["en", "vi", "custom"]).default("en"),
  sectionLabels: z.record(z.string()).default(defaultSectionLabels),
  hiddenSections: z.array(z.string()).default([]),
  sectionOrder: z.array(z.string()).default([...sectionIds]),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#365144"),
  sidebarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#174f93"),
  fontPreset: z.enum(["modern", "classic", "compact", "serif"]).default("modern"),
  targetRole: z.enum(targetRoles).default("fullstack-developer")
});

export const ProfileDocumentSchema = z.object({
  profile: ProfileSchema,
  settings: PresentationSettingsSchema.default(defaultPresentationSettings)
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
