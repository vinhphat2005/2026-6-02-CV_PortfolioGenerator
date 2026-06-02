import type { Profile, ProfileDocument, Project } from "./types";
import { projectCollaborationLabels } from "./schema";

export function flattenProfileText(document: ProfileDocument) {
  const { profile } = document;
  return [
    profile.personal.name,
    profile.personal.title,
    profile.summary,
    profile.personal.links.map((link) => `${link.label} ${link.url}`).join(" "),
    profile.skills.map((group) => `${group.category} ${group.items.join(" ")}`).join(" "),
    profile.experience
      .map((item) =>
        [
          item.company,
          item.role,
          item.technologies.join(" "),
          item.highlights.join(" ")
        ].join(" ")
      )
      .join(" "),
    profile.projects.map(projectText).join(" "),
    profile.education.map((item) => `${item.school} ${item.degree} ${item.highlights.join(" ")}`).join(" "),
    profile.certifications.map((item) => `${item.name} ${item.issuer}`).join(" "),
    profile.languages.map((item) => `${item.name} ${item.level}`).join(" "),
    profile.interests.join(" "),
    profile.customSections.map((section) => `${section.title} ${section.items.join(" ")}`).join(" ")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function sectionText(profile: Profile, section: "skills" | "experience" | "projects" | "summary") {
  if (section === "summary") {
    return profile.summary.toLowerCase();
  }
  if (section === "skills") {
    return profile.skills.map((group) => `${group.category} ${group.items.join(" ")}`).join(" ").toLowerCase();
  }
  if (section === "experience") {
    return profile.experience
      .map((item) => `${item.role} ${item.company} ${item.technologies.join(" ")} ${item.highlights.join(" ")}`)
      .join(" ")
      .toLowerCase();
  }
  return profile.projects.map(projectText).join(" ").toLowerCase();
}

export function projectText(project: Project) {
  return [
    project.name,
    project.description,
    projectCollaborationLabels[project.collaboration || "personal"],
    project.role,
    project.url,
    project.repo,
    project.demo,
    project.video,
    project.technologies.join(" "),
    project.highlights.join(" "),
    project.impact
  ]
    .filter(Boolean)
    .join(" ");
}

export function containsAny(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function countMetricEvidence(text: string) {
  const matches = text.match(/\b(\d+%|\d+x|\d+k|\d+\s?(users|requests|events|ms|minutes|hours|days|projects|screens|tests))\b/gi);
  return matches?.length ?? 0;
}

export function allBullets(profile: Profile) {
  return [
    ...profile.experience.flatMap((item) => item.highlights),
    ...profile.projects.flatMap((item) => item.highlights),
    ...profile.education.flatMap((item) => item.highlights),
    ...profile.customSections.flatMap((item) => item.items)
  ];
}
