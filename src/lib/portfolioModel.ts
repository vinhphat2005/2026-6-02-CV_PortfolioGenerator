import type { PortfolioCaseStudy, PortfolioDeck, Profile, Project } from "./types";

function projectId(project: Project, index: number) {
  const slug = project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "project"}-${index + 1}`;
}

export function caseStudyFromProject(project: Project, index: number): PortfolioCaseStudy {
  return {
    id: projectId(project, index),
    title: project.name,
    subtitle: project.description,
    role: project.role,
    context: project.collaboration === "personal" ? "Personal project" : "Team project",
    year: new Date().getFullYear().toString(),
    challenge: project.description,
    goals: project.highlights.slice(0, 2),
    process: project.highlights,
    solution: project.impact || project.description,
    deliverables: project.technologies.slice(0, 6),
    outcomes: [project.impact || project.highlights.at(-1) || project.description],
    metrics: [],
    tools: project.technologies,
    gallery: [],
    links: [
      project.repo && { label: "Repository", url: project.repo },
      project.demo && { label: "Live demo", url: project.demo },
      project.video && { label: "Video", url: project.video }
    ].filter((link): link is { label: string; url: string } => Boolean(link)),
    includeInDeck: true
  };
}

export function createPortfolioDeck(profile?: Profile): PortfolioDeck {
  return {
    title: profile ? `${profile.personal.name} Portfolio` : "My Portfolio",
    subtitle: profile?.personal.title || "Technology Project Case Studies",
    intro: profile?.summary || "A curated collection of projects, decisions, and measurable outcomes.",
    year: new Date().getFullYear().toString(),
    audience: profile?.personal.title || "Technology teams and hiring managers",
    capabilities: profile?.skills.flatMap((group) => group.items).slice(0, 8) || [],
    contactCta: profile ? `Let's discuss how I can contribute as a ${profile.personal.title}.` : "Let's work together.",
    caseStudies: profile?.projects.map(caseStudyFromProject) || []
  };
}

