export type TargetRole =
  | "software-engineer-intern"
  | "frontend-developer"
  | "backend-developer"
  | "fullstack-developer"
  | "game-developer"
  | "ai-automation-developer"
  | "data-analyst";

export type LanguageMode = "en" | "vi" | "custom";
export type FontPreset = "modern" | "classic" | "compact" | "serif";
export type ProjectCollaboration = "personal" | "team-member" | "team-lead";
export type SectionId =
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "languages"
  | "interests"
  | "custom";

export type PresentationSettings = {
  language: LanguageMode;
  sectionLabels: Record<string, string>;
  hiddenSections: string[];
  sectionOrder: string[];
  themeColor: string;
  sidebarColor: string;
  fontPreset: FontPreset;
  targetRole: TargetRole;
};

export type TemplateMeta = {
  id: string;
  name: string;
  kind: "resume" | "portfolio";
  description: string;
  recommendedFor: TargetRole[];
  supportsPhoto: boolean;
  atsFriendly: boolean;
};

export type RoleCriterion = {
  id: string;
  label: string;
  keywords: string[];
  weight: number;
  evidenceSections: Array<"skills" | "experience" | "projects" | "summary">;
  suggestion: string;
};

export type JobMatchResult = {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  weakMatches: string[];
  recommendedProjectOrder: string[];
  suggestions: string[];
};

export type Link = {
  label: string;
  url: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type Experience = {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  technologies: string[];
  highlights: string[];
};

export type Project = {
  name: string;
  description: string;
  collaboration?: ProjectCollaboration;
  role?: string;
  url?: string;
  repo?: string;
  demo?: string;
  video?: string;
  technologies: string[];
  highlights: string[];
  impact?: string;
};

export type Education = {
  school: string;
  degree: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  highlights: string[];
};

export type Certification = {
  name: string;
  issuer: string;
  date?: string;
  url?: string;
};

export type Language = {
  name: string;
  level: string;
};

export type CustomSection = {
  id: string;
  title: string;
  items: string[];
};

export type Profile = {
  personal: {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    photoUrl?: string;
    links: Link[];
  };
  summary: string;
  skills: SkillGroup[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  interests: string[];
  customSections: CustomSection[];
};

export type ProfileDocument = {
  profile: Profile;
  settings: PresentationSettings;
};

export type ScoreGroup = {
  id: string;
  label: string;
  score: number;
  max: number;
  suggestions: string[];
};

export type ScoreResult = {
  total: number;
  groups: ScoreGroup[];
  suggestions: string[];
  warnings: string[];
};
