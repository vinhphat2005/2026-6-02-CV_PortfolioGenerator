import { matchJobDescription } from "../jdMatcher";
import { allBullets, containsAny, countMetricEvidence, flattenProfileText, sectionText } from "../profileText";
import type { ProfileDocument, ScoreGroup, ScoreResult } from "../types";
import { roleCriteria } from "./roleCriteria";

function clamp(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function group(id: string, label: string, score: number, max: number, suggestions: string[] = []): ScoreGroup {
  return { id, label, score: clamp(score, max), max, suggestions };
}

function scoreCompleteness(document: ProfileDocument) {
  const { profile } = document;
  const checks = [
    Boolean(profile.personal.name),
    Boolean(profile.personal.email),
    Boolean(profile.personal.title),
    Boolean(profile.summary && profile.summary.length > 80),
    profile.skills.length > 0,
    profile.experience.length > 0,
    profile.projects.length > 0,
    profile.education.length > 0,
    profile.personal.links.some((link) => /github/i.test(link.label)),
    profile.projects.some((project) => project.repo || project.demo || project.url)
  ];
  const missing = [
    !profile.personal.links.some((link) => /github/i.test(link.label)) && "Add a GitHub link.",
    !profile.projects.some((project) => project.repo || project.demo || project.url) &&
      "Add at least one project repo or live demo.",
    profile.summary.length < 80 && "Make the summary specific enough to explain your target and strengths."
  ].filter(Boolean) as string[];
  return group("completeness", "Completeness", (checks.filter(Boolean).length / checks.length) * 18, 18, missing);
}

function scoreImpact(document: ProfileDocument) {
  const bullets = allBullets(document.profile);
  const metricCount = countMetricEvidence(bullets.join(" "));
  const actionCount = bullets.filter((bullet) =>
    /^(built|created|implemented|designed|improved|reduced|increased|optimized|automated|led|shipped|added)/i.test(
      bullet.trim()
    )
  ).length;
  const score = Math.min(20, metricCount * 4 + actionCount * 1.6);
  const suggestions = [];
  if (metricCount < 2) {
    suggestions.push("Add measurable outcomes such as %, users, time saved, latency, volume, or test coverage.");
  }
  if (actionCount < Math.max(2, bullets.length / 3)) {
    suggestions.push("Rewrite weak bullets with Action + Technical Detail + Result/Impact.");
  }
  return group("impact", "Impact", score, 20, suggestions);
}

function scoreAts(document: ProfileDocument) {
  const hidden = new Set(document.settings.hiddenSections);
  const hasClearSections = ["summary", "skills", "experience", "projects"].every((section) => !hidden.has(section));
  const text = flattenProfileText(document);
  const risky = /table layout|infographic|chart only/i.test(text);
  const score = (hasClearSections ? 9 : 5) + (risky ? 0 : 6);
  const suggestions = [];
  if (!hasClearSections) {
    suggestions.push("Keep Summary, Skills, Experience, and Projects visible for ATS-friendly resumes.");
  }
  return group("ats", "ATS Readiness", score, 15, suggestions);
}

function scoreReadability(document: ProfileDocument) {
  const bullets = allBullets(document.profile);
  const longBullets = bullets.filter((bullet) => bullet.split(/\s+/).length > 32);
  const repeatedStarts = new Set<string>();
  const duplicateStartCount = bullets.filter((bullet) => {
    const start = bullet.trim().split(/\s+/)[0]?.toLowerCase();
    if (!start) return false;
    if (repeatedStarts.has(start)) return true;
    repeatedStarts.add(start);
    return false;
  }).length;
  const score = 15 - longBullets.length * 2 - duplicateStartCount;
  const suggestions = [];
  if (longBullets.length > 0) {
    suggestions.push("Shorten long bullets so each one is easy to scan.");
  }
  if (duplicateStartCount > 2) {
    suggestions.push("Vary bullet openings to avoid repetitive wording.");
  }
  return group("readability", "Readability", score, 15, suggestions);
}

function scoreRoleFit(document: ProfileDocument) {
  const criteria = roleCriteria[document.settings.targetRole];
  const profile = document.profile;
  let earned = 0;
  const max = criteria.reduce((total, criterion) => total + criterion.weight, 0);
  const suggestions: string[] = [];

  criteria.forEach((criterion) => {
    const evidence = criterion.evidenceSections
      .map((section) => sectionText(profile, section))
      .join(" ");
    const matched = containsAny(evidence, criterion.keywords);
    if (matched) {
      earned += criterion.weight;
    } else {
      suggestions.push(criterion.suggestion);
    }
  });

  return group("role-fit", "Role Fit", max === 0 ? 0 : (earned / max) * 20, 20, suggestions.slice(0, 4));
}

function scorePortfolioQuality(document: ProfileDocument) {
  const projects = document.profile.projects;
  const hasDemo = projects.some((project) => project.demo || project.url || project.video);
  const hasRepo = projects.some((project) => project.repo);
  const hasTech = projects.every((project) => project.technologies.length > 0);
  const hasImpact = projects.some((project) => project.impact || countMetricEvidence(project.highlights.join(" ")) > 0);
  const checks = [hasDemo, hasRepo, hasTech, hasImpact, projects.length >= 2];
  const suggestions = [
    !hasDemo && "Add live demos, screenshots, or gameplay videos for portfolio projects.",
    !hasRepo && "Add GitHub repository links where possible.",
    !hasImpact && "Add project impact so readers understand why the work matters."
  ].filter(Boolean) as string[];
  return group("portfolio", "Portfolio Quality", (checks.filter(Boolean).length / checks.length) * 12, 12, suggestions);
}

function scoreJdMatch(document: ProfileDocument, jobDescription?: string) {
  if (!jobDescription?.trim()) {
    return group("jd-match", "JD Match", 0, 0, []);
  }
  const result = matchJobDescription(document, jobDescription);
  return group("jd-match", "JD Match", (result.matchScore / 100) * 10, 10, result.suggestions.slice(0, 3));
}

export function scoreProfile(document: ProfileDocument, jobDescription?: string): ScoreResult {
  const groups = [
    scoreCompleteness(document),
    scoreImpact(document),
    scoreAts(document),
    scoreReadability(document),
    scoreRoleFit(document),
    scorePortfolioQuality(document),
    scoreJdMatch(document, jobDescription)
  ];
  const max = groups.reduce((total, item) => total + item.max, 0);
  const raw = groups.reduce((total, item) => total + item.score, 0);
  const warnings = [
    !document.profile.personal.links.some((link) => /github/i.test(link.label)) && "Missing GitHub link.",
    document.profile.projects.some((project) => project.technologies.length === 0) && "Some projects lack tech stacks.",
    !flattenProfileText(document).includes("test") && "Testing evidence is weak or missing."
  ].filter(Boolean) as string[];
  return {
    total: max === 0 ? 0 : Math.round((raw / max) * 100),
    groups,
    suggestions: groups.flatMap((item) => item.suggestions).slice(0, 10),
    warnings
  };
}
