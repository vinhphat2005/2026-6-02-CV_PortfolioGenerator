import type { ProfileDocument } from "./types";

function escapeHtml(value: string | undefined) {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function label(document: ProfileDocument, id: string) {
  return escapeHtml(document.settings.sectionLabels[id] || id);
}

function isVisible(document: ProfileDocument, id: string) {
  return !document.settings.hiddenSections.includes(id);
}

function list(items: string[]) {
  if (items.length === 0) return "";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function skills(document: ProfileDocument) {
  if (!isVisible(document, "skills")) return "";
  return `<section><h2>${label(document, "skills")}</h2><div class="skills">${document.profile.skills
    .map(
      (group) =>
        `<div><strong>${escapeHtml(group.category)}</strong><p>${escapeHtml(group.items.join(" / "))}</p></div>`
    )
    .join("")}</div></section>`;
}

function summary(document: ProfileDocument) {
  if (!isVisible(document, "summary")) return "";
  return `<section><h2>${label(document, "summary")}</h2><p>${escapeHtml(document.profile.summary)}</p></section>`;
}

function experience(document: ProfileDocument) {
  if (!isVisible(document, "experience")) return "";
  return `<section><h2>${label(document, "experience")}</h2>${document.profile.experience
    .map(
      (item) => `<article>
        <div class="row"><div><h3>${escapeHtml(item.role)}</h3><strong>${escapeHtml(item.company)}</strong></div><span>${escapeHtml(item.startDate)} - ${escapeHtml(item.current ? "Present" : item.endDate)}</span></div>
        <div class="tech">${escapeHtml(item.technologies.join(" / "))}</div>
        ${list(item.highlights)}
      </article>`
    )
    .join("")}</section>`;
}

function projects(document: ProfileDocument) {
  if (!isVisible(document, "projects")) return "";
  return `<section><h2>${label(document, "projects")}</h2>${document.profile.projects
    .map(
      (project) => `<article>
        <div class="row"><h3>${escapeHtml(project.name)}</h3><span>${escapeHtml(project.technologies.join(" / "))}</span></div>
        <p>${escapeHtml(project.description)}</p>
        ${list(project.highlights)}
      </article>`
    )
    .join("")}</section>`;
}

function education(document: ProfileDocument) {
  if (!isVisible(document, "education")) return "";
  return `<section><h2>${label(document, "education")}</h2>${document.profile.education
    .map(
      (item) => `<article><div class="row"><div><h3>${escapeHtml(item.degree)}</h3><strong>${escapeHtml(item.school)}</strong></div><span>${escapeHtml([item.startDate, item.endDate].filter(Boolean).join(" - "))}</span></div>${list(item.highlights)}</article>`
    )
    .join("")}</section>`;
}

function certifications(document: ProfileDocument) {
  if (!isVisible(document, "certifications") || document.profile.certifications.length === 0) return "";
  return `<section><h2>${label(document, "certifications")}</h2>${list(
    document.profile.certifications.map((item) => `${item.name} - ${item.issuer} ${item.date ?? ""}`)
  )}</section>`;
}

function languages(document: ProfileDocument) {
  if (!isVisible(document, "languages") || document.profile.languages.length === 0) return "";
  return `<section><h2>${label(document, "languages")}</h2>${list(
    document.profile.languages.map((item) => `${item.name} - ${item.level}`)
  )}</section>`;
}

function interests(document: ProfileDocument) {
  if (!isVisible(document, "interests")) return "";
  return `<section><h2>${label(document, "interests")}</h2>${list(document.profile.interests)}</section>`;
}

function customSections(document: ProfileDocument) {
  if (!isVisible(document, "custom")) return "";
  return document.profile.customSections
    .map((section) => `<section><h2>${escapeHtml(section.title)}</h2>${list(section.items)}</section>`)
    .join("");
}

function orderedSections(document: ProfileDocument, skip: string[] = []) {
  const renderers: Record<string, () => string> = {
    summary: () => summary(document),
    skills: () => skills(document),
    experience: () => experience(document),
    projects: () => projects(document),
    education: () => education(document),
    certifications: () => certifications(document),
    languages: () => languages(document),
    interests: () => interests(document),
    custom: () => customSections(document)
  };
  return document.settings.sectionOrder
    .filter((section) => !skip.includes(section))
    .map((section) => renderers[section]?.() ?? "")
    .join("");
}

function header(document: ProfileDocument, centered = false) {
  const { personal } = document.profile;
  return `<header class="${centered ? "center" : ""}">
    <h1>${escapeHtml(personal.name)}</h1>
    <p class="title">${escapeHtml(personal.title)}</p>
    <p class="contact">${escapeHtml([personal.email, personal.phone, personal.location, personal.website].filter(Boolean).join(" | "))}</p>
  </header>`;
}

function classicSidebar(document: ProfileDocument) {
  const personal = document.profile.personal;
  return `<article class="page classic">
    <aside>
      <div class="avatar">${escapeHtml(personal.name.slice(0, 1))}</div>
      <h1>${escapeHtml(personal.name)}</h1>
      <p class="title">${escapeHtml(personal.title)}</p>
      <p class="contact">${escapeHtml([personal.email, personal.phone, personal.location, personal.website].filter(Boolean).join("\n"))}</p>
      ${skills(document)}
      ${interests(document)}
    </aside>
    <main>${orderedSections(document, ["skills", "interests"])}</main>
  </article>`;
}

function standardResume(document: ProfileDocument, templateId: string) {
  if (templateId === "modern-engineering") {
    return `<article class="page modern">${header(document)}<div class="columns"><main>${experience(document)}${projects(document)}</main><aside>${summary(document)}${skills(document)}${education(document)}${certifications(document)}</aside></div></article>`;
  }
  if (templateId === "compact-one-page") {
    return `<article class="page compact">${header(document)}<div class="columns compact-columns"><aside>${summary(document)}${skills(document)}${education(document)}${languages(document)}</aside><main>${experience(document)}${projects(document)}</main></div></article>`;
  }
  const centered = templateId === "ats-minimal";
  return `<article class="page ${centered ? "ats" : "clean"}">${header(document, centered)}${orderedSections(document)}</article>`;
}

function styles(document: ProfileDocument) {
  const color = document.settings.themeColor;
  const font =
    document.settings.fontPreset === "serif"
      ? "Georgia, 'Times New Roman', serif"
      : "Inter, Arial, sans-serif";
  const baseSize = document.settings.fontPreset === "compact" ? "11px" : "12px";
  return `
    * { box-sizing: border-box; }
    body { margin: 0; background: #fff; color: #17201b; font-family: ${font}; font-size: ${baseSize}; }
    .page { width: 210mm; min-height: 297mm; margin: 0; padding: 28px 34px; background: #fff; }
    h1 { margin: 0; color: ${color}; font-size: 32px; line-height: 1; letter-spacing: 0; }
    h2 { margin: 16px 0 7px; color: #111827; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; border-bottom: 1px solid #d8ded5; padding-bottom: 4px; }
    h3 { margin: 0 0 2px; font-size: 13px; }
    p { margin: 4px 0; line-height: 1.48; }
    ul { margin: 5px 0 0; padding-left: 16px; }
    li { margin: 2px 0; line-height: 1.42; }
    article { margin-bottom: 10px; }
    .title { margin-top: 5px; color: #4b5563; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; }
    .contact { color: #4b5563; font-size: 10.5px; white-space: pre-line; }
    .row { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
    .row span { color: #647064; font-size: 10.5px; text-align: right; }
    .tech { color: #647064; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; margin-top: 3px; }
    .skills { display: grid; grid-template-columns: 1fr 1fr; gap: 7px 12px; }
    .skills p { color: #4b5563; font-size: 10.8px; }
    .center { text-align: center; }
    .classic { display: grid; grid-template-columns: 32% 68%; padding: 0; }
    .classic aside { min-height: 297mm; padding: 24px; color: #fff; background: ${color}; }
    .classic aside h1, .classic aside h2 { color: #fff; border-color: rgba(255,255,255,.24); }
    .classic aside p, .classic aside .contact, .classic aside .skills p { color: rgba(255,255,255,.82); }
    .classic main { padding: 28px 34px; }
    .avatar { display: grid; place-items: center; width: 145px; height: 145px; margin: 0 auto 22px; border-radius: 999px; background: rgba(255,255,255,.18); color: #fff; font-size: 54px; font-weight: 900; }
    .columns { display: grid; grid-template-columns: 62% 38%; gap: 22px; }
    .columns aside { background: #f5f7f3; border: 1px solid #d8ded5; border-radius: 8px; padding: 14px; }
    .compact { padding: 22px 28px; font-size: 10.6px; }
    .compact h1 { font-size: 27px; }
    .compact-columns { grid-template-columns: 36% 64%; }
    @page { size: A4; margin: 0; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;
}

export function renderResumeHtml(document: ProfileDocument, templateId: string) {
  const markup =
    templateId === "classic-sidebar"
      ? classicSidebar(document)
      : standardResume(document, templateId);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${styles(document)}</style>
  <title>${document.profile.personal.name} Resume</title>
</head>
<body>${markup}</body>
</html>`;
}
