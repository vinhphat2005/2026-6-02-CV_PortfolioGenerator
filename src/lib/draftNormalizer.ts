import { defaultPresentationSettings, ensureAllSections } from "./schema";
import { createPortfolioDeck } from "./portfolioModel";
import type {
  Link,
  PortfolioCaseStudy,
  PortfolioDeck,
  PortfolioImageRef,
  PortfolioMetric,
  Profile,
  ProfileDocument
} from "./types";

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function optionalText(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function bool(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function color(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function array(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function strings(value: unknown) {
  return array(value).filter((item): item is string => typeof item === "string");
}

function links(value: unknown): Link[] {
  return array(value).map((item) => {
    const source = record(item);
    return { label: text(source.label), url: text(source.url) };
  });
}

function imageRef(value: unknown): PortfolioImageRef | undefined {
  const source = record(value);
  if (source.kind === "url" && typeof source.url === "string") {
    return { kind: "url", url: source.url, alt: optionalText(source.alt) };
  }
  if (source.kind === "asset" && typeof source.assetId === "string") {
    return { kind: "asset", assetId: source.assetId, alt: optionalText(source.alt) };
  }
  return undefined;
}

function metrics(value: unknown): PortfolioMetric[] {
  return array(value).map((item) => {
    const source = record(item);
    return { label: text(source.label), value: text(source.value) };
  });
}

function normalizeProfile(value: unknown): Profile {
  const source = record(value);
  const personal = record(source.personal);
  return {
    personal: {
      name: text(personal.name),
      title: text(personal.title),
      email: text(personal.email),
      phone: optionalText(personal.phone),
      location: optionalText(personal.location),
      website: optionalText(personal.website),
      photoUrl: optionalText(personal.photoUrl),
      links: links(personal.links)
    },
    summary: text(source.summary),
    skills: array(source.skills).map((item) => {
      const skill = record(item);
      return { category: text(skill.category), items: strings(skill.items) };
    }),
    experience: array(source.experience).map((item) => {
      const experience = record(item);
      return {
        company: text(experience.company),
        role: text(experience.role),
        location: optionalText(experience.location),
        startDate: text(experience.startDate),
        endDate: optionalText(experience.endDate),
        current: typeof experience.current === "boolean" ? experience.current : undefined,
        technologies: strings(experience.technologies),
        highlights: strings(experience.highlights)
      };
    }),
    projects: array(source.projects).map((item) => {
      const project = record(item);
      const collaboration = ["personal", "team-member", "team-lead"].includes(text(project.collaboration))
        ? text(project.collaboration) as "personal" | "team-member" | "team-lead"
        : "personal";
      return {
        name: text(project.name),
        description: text(project.description),
        collaboration,
        role: optionalText(project.role),
        url: optionalText(project.url),
        repo: optionalText(project.repo),
        demo: optionalText(project.demo),
        video: optionalText(project.video),
        technologies: strings(project.technologies),
        highlights: strings(project.highlights),
        impact: optionalText(project.impact)
      };
    }),
    education: array(source.education).map((item) => {
      const education = record(item);
      return {
        school: text(education.school),
        degree: text(education.degree),
        location: optionalText(education.location),
        startDate: optionalText(education.startDate),
        endDate: optionalText(education.endDate),
        gpa: optionalText(education.gpa),
        highlights: strings(education.highlights)
      };
    }),
    certifications: array(source.certifications).map((item) => {
      const certification = record(item);
      return {
        name: text(certification.name),
        issuer: text(certification.issuer),
        date: optionalText(certification.date),
        url: optionalText(certification.url)
      };
    }),
    languages: array(source.languages).map((item) => {
      const language = record(item);
      return { name: text(language.name), level: text(language.level) };
    }),
    interests: strings(source.interests),
    customSections: array(source.customSections).map((item, index) => {
      const section = record(item);
      return {
        id: text(section.id, `custom-${index + 1}`),
        title: text(section.title),
        items: strings(section.items)
      };
    })
  };
}

function normalizeCaseStudies(value: unknown): PortfolioCaseStudy[] {
  return array(value).map((item, index) => {
    const study = record(item);
    return {
      id: text(study.id, `case-study-${index + 1}`),
      title: text(study.title),
      subtitle: optionalText(study.subtitle),
      role: optionalText(study.role),
      context: optionalText(study.context),
      year: optionalText(study.year),
      challenge: text(study.challenge),
      goals: strings(study.goals),
      process: strings(study.process),
      solution: text(study.solution),
      deliverables: strings(study.deliverables),
      outcomes: strings(study.outcomes),
      metrics: metrics(study.metrics),
      tools: strings(study.tools),
      coverImage: imageRef(study.coverImage),
      gallery: array(study.gallery).map(imageRef).filter((image): image is PortfolioImageRef => Boolean(image)),
      links: links(study.links),
      includeInDeck: bool(study.includeInDeck, true)
    };
  });
}

function normalizePortfolio(value: unknown, profile: Profile): PortfolioDeck {
  const defaults = createPortfolioDeck(profile);
  const source = record(value);
  const templateId = [
    "editorial-blue",
    "architectural-minimal",
    "bold-studio-orange",
    "digital-agency-noir",
    "swiss-editorial-coral",
    "playful-product-grid"
  ].includes(text(source.templateId))
    ? text(source.templateId) as PortfolioDeck["templateId"]
    : defaults.templateId;
  return {
    templateId,
    primaryColor: color(source.primaryColor, defaults.primaryColor),
    secondaryColor: color(source.secondaryColor, defaults.secondaryColor),
    title: text(source.title, defaults.title),
    subtitle: text(source.subtitle, defaults.subtitle),
    intro: text(source.intro, defaults.intro),
    year: text(source.year, defaults.year),
    audience: text(source.audience, defaults.audience),
    capabilities: Array.isArray(source.capabilities) ? strings(source.capabilities) : defaults.capabilities,
    contactCta: text(source.contactCta, defaults.contactCta),
    caseStudies: Array.isArray(source.caseStudies) ? normalizeCaseStudies(source.caseStudies) : defaults.caseStudies
  };
}

export function normalizeStoredDraft(value: unknown): ProfileDocument {
  const source = record(value);
  const profile = normalizeProfile(source.profile);
  const settings = record(source.settings);
  const labels = record(settings.sectionLabels);
  return {
    profile,
    settings: {
      ...defaultPresentationSettings,
      language: ["en", "vi", "custom"].includes(text(settings.language))
        ? text(settings.language) as ProfileDocument["settings"]["language"]
        : defaultPresentationSettings.language,
      sectionLabels: Object.fromEntries(
        Object.entries({ ...defaultPresentationSettings.sectionLabels, ...labels })
          .filter(([, item]) => typeof item === "string")
      ) as Record<string, string>,
      hiddenSections: strings(settings.hiddenSections),
      sectionOrder: ensureAllSections(strings(settings.sectionOrder)),
      themeColor: color(settings.themeColor, defaultPresentationSettings.themeColor),
      sidebarColor: color(settings.sidebarColor, defaultPresentationSettings.sidebarColor),
      fontPreset: ["modern", "classic", "compact", "serif"].includes(text(settings.fontPreset))
        ? text(settings.fontPreset) as ProfileDocument["settings"]["fontPreset"]
        : defaultPresentationSettings.fontPreset,
      targetRole: [
        "software-engineer-intern", "frontend-developer", "backend-developer", "fullstack-developer",
        "game-developer", "ai-automation-developer", "data-analyst"
      ].includes(text(settings.targetRole))
        ? text(settings.targetRole) as ProfileDocument["settings"]["targetRole"]
        : defaultPresentationSettings.targetRole
    },
    portfolio: normalizePortfolio(source.portfolio, profile)
  };
}
