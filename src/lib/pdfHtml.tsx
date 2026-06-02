import { projectCollaborationLabels, roleLabels } from "./schema";
import type { ProfileDocument, Project } from "./types";

function escapeHtml(value: string | undefined) {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return { r: 23, g: 79, b: 147 };
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

function contrastText(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#17201b" : "#ffffff";
}

function tint(hex: string, amount = 0.9) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function label(document: ProfileDocument, id: string) {
  return escapeHtml(document.settings.sectionLabels[id] || id);
}

function projectTypeLabel(project: Project) {
  return projectCollaborationLabels[project.collaboration || "personal"];
}

function educationMeta(item: ProfileDocument["profile"]["education"][number]) {
  const academicResult = item.gpa?.trim();
  return [[item.startDate, item.endDate].filter(Boolean).join(" - "), academicResult]
    .filter(Boolean)
    .join(" / ");
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
        <div class="project-type">${escapeHtml(projectTypeLabel(project))}${project.role ? ` / ${escapeHtml(project.role)}` : ""}</div>
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
      (item) => `<article><div class="row"><div><h3>${escapeHtml(item.degree)}</h3><strong>${escapeHtml(item.school)}</strong></div><span>${escapeHtml(educationMeta(item))}</span></div>${list(item.highlights)}</article>`
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

function photo(document: ProfileDocument, className = "photo") {
  const { personal } = document.profile;
  const content = personal.photoUrl
    ? `<img src="${escapeHtml(personal.photoUrl)}" alt="${escapeHtml(personal.name)}" />`
    : `<span>${escapeHtml(personal.name.slice(0, 1))}</span>`;
  return `<div class="${className}">${content}</div>`;
}

function icon(name: "mail" | "phone" | "pin" | "globe" | "github" | "link") {
  const paths = {
    mail: `<path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/>`,
    phone: `<path d="M6 5h4l2 5-3 2c1 2 3 4 5 5l2-3 5 2v4c0 1-1 2-2 2A17 17 0 0 1 4 7c0-1 1-2 2-2z"/>`,
    pin: `<path d="M12 21s7-5 7-11a7 7 0 0 0-14 0c0 6 7 11 7 11z"/><circle cx="12" cy="10" r="2"/>`,
    globe: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>`,
    github: `<path d="M9 19c-5 1-5-2-7-3m14 6v-4c0-1 0-2-1-3 3 0 6-1 6-6 0-1 0-3-1-4 0-1 0-2 0-4 0 0-1 0-4 2a13 13 0 0 0-7 0C6 1 5 1 5 1c0 2 0 3 0 4-1 1-1 3-1 4 0 5 3 6 6 6-1 1-1 2-1 3v4"/>`,
    link: `<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>`
  };
  return `<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}

function linkIcon(labelText: string) {
  if (/github/i.test(labelText)) return "github";
  if (/portfolio|website|site/i.test(labelText)) return "globe";
  return "link";
}

function fineTitle(title: string, className = "") {
  return `<h2 class="fine-title ${className}">${title}</h2>`;
}

function slimEducation(document: ProfileDocument) {
  if (!isVisible(document, "education")) return "";
  return `<section>${fineTitle(label(document, "education"))}${document.profile.education
    .map(
      (item) => `<article class="slim-item">
        <h3>${escapeHtml(item.school)}</h3>
        <strong>${escapeHtml(item.degree)}</strong>
        <p>${escapeHtml(educationMeta(item))}</p>
      </article>`
    )
    .join("")}</section>`;
}

function slimSkills(document: ProfileDocument) {
  if (!isVisible(document, "skills")) return "";
  const items = document.profile.skills.flatMap((group) => group.items.map((item) => `${group.category}-${item}`));
  const labels = document.profile.skills.flatMap((group) => group.items);
  return `<section>${fineTitle(label(document, "skills"))}<ul class="slim-list">${labels
    .map((item, index) => `<li data-key="${escapeHtml(items[index])}">${escapeHtml(item)}</li>`)
    .join("")}</ul></section>`;
}

function slimLanguages(document: ProfileDocument) {
  if (!isVisible(document, "languages") || document.profile.languages.length === 0) return "";
  return `<section>${fineTitle(label(document, "languages"))}<ul class="slim-list">${document.profile.languages
    .map((item) => `<li>${escapeHtml(item.name)} - ${escapeHtml(item.level)}</li>`)
    .join("")}</ul></section>`;
}

function slimCertifications(document: ProfileDocument) {
  if (!isVisible(document, "certifications") || document.profile.certifications.length === 0) return "";
  return `<section>${fineTitle(label(document, "certifications"))}<ul class="cert-list">${document.profile.certifications
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.issuer)} ${escapeHtml(item.date)}</span></li>`
    )
    .join("")}</ul></section>`;
}

function slimCustomSections(document: ProfileDocument) {
  if (!isVisible(document, "custom") || document.profile.customSections.length === 0) return "";
  return document.profile.customSections
    .map((section) => `<section>${fineTitle(escapeHtml(section.title))}${list(section.items)}</section>`)
    .join("");
}

function timelineExperience(document: ProfileDocument) {
  if (!isVisible(document, "experience")) return "";
  return `<section>${fineTitle(label(document, "experience"))}<div class="timeline-list">${document.profile.experience
    .map(
      (item) => `<article class="timeline-item">
        <div class="row"><div><h3>${escapeHtml(item.role)}</h3><strong>${escapeHtml(item.company)}</strong></div><span>${escapeHtml(item.startDate)} - ${escapeHtml(item.current ? "Present" : item.endDate)}</span></div>
        ${list(item.highlights)}
      </article>`
    )
    .join("")}</div></section>`;
}

function timelineProjects(document: ProfileDocument) {
  if (!isVisible(document, "projects") || document.profile.projects.length === 0) return "";
  return `<section>${fineTitle(label(document, "projects"))}${document.profile.projects
    .map(
      (project) => `<article class="project-slim">
        <div class="row"><h3>${escapeHtml(project.name)}</h3><span>${escapeHtml(project.technologies.slice(0, 4).join(" / "))}</span></div>
        <div class="project-type">${escapeHtml(projectTypeLabel(project))}${project.role ? ` / ${escapeHtml(project.role)}` : ""}</div>
        <p>${escapeHtml(project.description)}</p>
        ${list(project.highlights.slice(0, 2))}
      </article>`
    )
    .join("")}</section>`;
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

function executiveTimeline(document: ProfileDocument) {
  const personal = document.profile.personal;
  return `<article class="page executive">
    <header class="executive-header">
      <div>
        <h1>${escapeHtml(personal.name)}</h1>
        <p class="title">${escapeHtml(personal.title)}</p>
        <div class="rule"></div>
        <p class="contact">${escapeHtml([personal.phone, personal.email, personal.website].filter(Boolean).join(" | "))}</p>
      </div>
      ${photo(document, "photo")}
    </header>
    <div class="executive-columns">
      <main>
        ${isVisible(document, "summary") ? `<section>${fineTitle(label(document, "summary"))}<p>${escapeHtml(document.profile.summary)}</p></section>` : ""}
        ${timelineExperience(document)}
        ${timelineProjects(document)}
        ${slimCustomSections(document)}
      </main>
      <aside>
        ${slimEducation(document)}
        ${slimSkills(document)}
        ${slimCertifications(document)}
        ${slimLanguages(document)}
      </aside>
    </div>
  </article>`;
}

function geometricSidebar(document: ProfileDocument) {
  const personal = document.profile.personal;
  return `<article class="page geometric">
    <div class="geo-top"></div>
    <div class="geo-top-accent"></div>
    <div class="geo-bottom"></div>
    <div class="geo-bottom-accent"></div>
    <div class="geo-grid">
      <aside>
        ${photo(document, "photo geo-photo")}
        <section>
          ${fineTitle("Contact", "with-line")}
          <p class="contact">${escapeHtml([personal.phone, personal.email, personal.location, personal.website].filter(Boolean).join("\n"))}</p>
          <p class="contact">${escapeHtml(personal.links.slice(0, 2).map((link) => `${link.label}: ${link.url}`).join("\n"))}</p>
        </section>
        ${slimEducation(document)}
        ${slimSkills(document)}
      </aside>
      <main>
        <header>
          <h1>${escapeHtml(personal.name)}</h1>
          <p class="title">${escapeHtml(personal.title)}</p>
        </header>
        ${isVisible(document, "summary") ? `<section>${fineTitle(label(document, "summary"), "with-line")}<p>${escapeHtml(document.profile.summary)}</p></section>` : ""}
        ${timelineExperience(document)}
        ${timelineProjects(document)}
        <div class="small-columns">${slimCertifications(document)}${slimLanguages(document)}</div>
      </main>
    </div>
  </article>`;
}

function deepGreenSidebar(document: ProfileDocument) {
  const personal = document.profile.personal;
  const details = [
    personal.email && `<div class="side-row">${icon("mail")}<span>${escapeHtml(personal.email)}</span></div>`,
    personal.phone && `<div class="side-row">${icon("phone")}<span>${escapeHtml(personal.phone)}</span></div>`,
    personal.location && `<div class="side-row">${icon("pin")}<span>${escapeHtml(personal.location)}</span></div>`,
    personal.website && `<div class="side-row">${icon("globe")}<span>Portfolio</span></div>`,
    ...personal.links.slice(0, 3).map((link) => `<div class="side-row">${icon(linkIcon(link.label))}<span>${escapeHtml(link.label)}</span></div>`)
  ]
    .filter(Boolean)
    .join("");
  const skillsMarkup = isVisible(document, "skills")
    ? `<section><h2 class="side-title">${label(document, "skills")}</h2>${document.profile.skills
        .map(
          (group) => `<div class="deep-skill-group">
            <h3>${escapeHtml(group.category)}</h3>
            <ul>${group.items.map((item) => `<li><span></span>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>`
        )
        .join("")}</section>`
    : "";
  const experienceMarkup = isVisible(document, "experience")
    ? `<section><h2 class="green-title">${label(document, "experience")}</h2>${document.profile.experience
        .map(
          (item) => `<article class="green-item">
            <div class="row"><div><h3>${escapeHtml(item.role)}</h3><strong>${escapeHtml(item.company)}</strong></div><span>${escapeHtml(item.startDate)} - ${escapeHtml(item.current ? "Present" : item.endDate)}</span></div>
            ${list(item.highlights)}
          </article>`
        )
        .join("")}</section>`
    : "";
  const projectMarkup = isVisible(document, "projects")
    ? `<section><h2 class="green-title">${label(document, "projects")}</h2>${document.profile.projects
        .map(
          (project) => `<article class="green-item">
            <div class="row"><div><h3>${escapeHtml(project.name)}</h3><div class="project-type">${escapeHtml(projectTypeLabel(project))}${project.role ? ` / ${escapeHtml(project.role)}` : ""}</div></div><span>${escapeHtml(project.technologies.slice(0, 3).join(" / "))}</span></div>
            <p>${escapeHtml(project.description)}</p>
            ${list(project.highlights.slice(0, 2))}
          </article>`
        )
        .join("")}</section>`
    : "";
  return `<article class="page deep-green">
    <aside>
      <h1>${escapeHtml(personal.name)}</h1>
      <p class="title">${escapeHtml(personal.title)}</p>
      <div class="side-rule"></div>
      <section>
        <h2 class="side-title">Details</h2>
        <div class="side-details">${details}</div>
      </section>
      ${skillsMarkup}
    </aside>
    <main>
      <header>
        <h1>${escapeHtml(roleLabels[document.settings.targetRole])}</h1>
        <p>${escapeHtml(personal.location || personal.title)}</p>
      </header>
      ${isVisible(document, "summary") ? `<section><h2 class="green-title">${label(document, "summary")}</h2><p>${escapeHtml(document.profile.summary)}</p></section>` : ""}
      ${experienceMarkup}
      ${projectMarkup}
      <div class="deep-small">${education(document)}${certifications(document)}</div>
    </main>
  </article>`;
}

function ribbonBlock(title: string, color: string, content: string) {
  return `<section class="ribbon-block">
    <div class="ribbon-title" style="background:${color};color:${contrastText(color)}">${title}<span style="border-left-color:${color}"></span></div>
    <div class="ribbon-content" style="background:${tint(color, 0.91)}">${content}</div>
  </section>`;
}

function ribbonProfile(document: ProfileDocument) {
  const personal = document.profile.personal;
  const sidebarColor = document.settings.sidebarColor || document.settings.themeColor;
  const contact = ribbonBlock(
    "Contact",
    sidebarColor,
    [
      personal.phone && `<div><strong>Phone</strong><br>${escapeHtml(personal.phone)}</div>`,
      personal.email && `<div><strong>Email</strong><br>${escapeHtml(personal.email)}</div>`,
      personal.location && `<div><strong>Address</strong><br>${escapeHtml(personal.location)}</div>`,
      personal.website && `<div><strong>Website</strong><br>${escapeHtml(personal.website)}</div>`
    ]
      .filter(Boolean)
      .join("")
  );
  const educationBlock = isVisible(document, "education")
    ? ribbonBlock(
        label(document, "education"),
        sidebarColor,
        document.profile.education
          .map((item) => `<article><h3>${escapeHtml(item.degree)}</h3><p>${escapeHtml(item.school)}</p><p>${escapeHtml(educationMeta(item))}</p></article>`)
          .join("")
      )
    : "";
  const skillsBlock = isVisible(document, "skills")
    ? ribbonBlock(
        label(document, "skills"),
        sidebarColor,
        `<ul>${document.profile.skills.flatMap((group) => group.items).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      )
    : "";
  const languageBlock = isVisible(document, "languages") && document.profile.languages.length > 0
    ? ribbonBlock(
        label(document, "languages"),
        sidebarColor,
        `<ul>${document.profile.languages.map((item) => `<li>${escapeHtml(item.name)}</li>`).join("")}</ul>`
      )
    : "";
  const experienceBlock = isVisible(document, "experience")
    ? `<section><h2 class="ribbon-main-title">Professional Experience</h2>${document.profile.experience
        .map(
          (item) => `<article class="ribbon-timeline">
            <div class="ribbon-date"><span>${escapeHtml(item.startDate)}</span><span>-</span><span>${escapeHtml(item.current ? "Present" : item.endDate)}</span></div>
            <div class="ribbon-job"><h3>${escapeHtml(item.role)}</h3><p>${escapeHtml(item.company)}${item.location ? `, ${escapeHtml(item.location)}` : ""}</p>${list(item.highlights)}</div>
          </article>`
        )
        .join("")}</section>`
    : "";
  const projectBlock = isVisible(document, "projects") && document.profile.projects.length > 0
    ? `<section><h2 class="ribbon-main-title">${label(document, "projects")}</h2><div class="ribbon-projects">${document.profile.projects
        .slice(0, 4)
        .map(
          (project) => `<article><h3>${escapeHtml(project.name)}</h3><div class="project-type">${escapeHtml(projectTypeLabel(project))}${project.role ? ` / ${escapeHtml(project.role)}` : ""}</div><p>${escapeHtml(project.description)}</p></article>`
        )
        .join("")}</div></section>`
    : "";
  return `<article class="page ribbon-profile">
    <aside style="background:${tint(sidebarColor, 0.91)}">
      ${photo(document, "photo ribbon-photo")}
      ${contact}
      ${educationBlock}
      ${skillsBlock}
      ${languageBlock}
    </aside>
    <main>
      <div class="ribbon-deco deco-a" style="background:${tint(sidebarColor, 0.9)}"></div>
      <div class="ribbon-deco deco-b" style="background:${tint(sidebarColor, 0.9)}"></div>
      <div class="ribbon-deco deco-c" style="background:${tint(sidebarColor, 0.9)}"></div>
      <header>
        <h1>${escapeHtml(personal.name)}</h1>
        <p>${escapeHtml(personal.title)}</p>
      </header>
      ${experienceBlock}
      ${projectBlock}
    </main>
  </article>`;
}

function standardResume(document: ProfileDocument, templateId: string) {
  if (templateId === "executive-timeline") {
    return executiveTimeline(document);
  }
  if (templateId === "geometric-sidebar") {
    return geometricSidebar(document);
  }
  if (templateId === "deep-green-sidebar") {
    return deepGreenSidebar(document);
  }
  if (templateId === "ribbon-profile") {
    return ribbonProfile(document);
  }
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
    .project-type { margin: 2px 0 4px; color: #64748b; font-size: 10.5px; font-style: italic; }
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
    .photo { display: grid; place-items: center; width: 96px; height: 96px; border-radius: 999px; overflow: hidden; background: #e2e8f0; color: #64748b; font-size: 38px; font-weight: 900; }
    .photo img { width: 100%; height: 100%; object-fit: cover; }
    .fine-title { margin: 0 0 9px; padding: 0; border: 0; color: #475569; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0; }
    .slim-item { margin-bottom: 10px; }
    .slim-item h3 { color: #1f2937; font-size: 11.5px; }
    .slim-item strong { color: #475569; font-size: 10.5px; }
    .slim-item p { color: #64748b; font-size: 10px; }
    .slim-list { margin-top: 0; color: #334155; font-size: 10.5px; line-height: 1.42; }
    .cert-list { margin: 0; padding: 0; list-style: none; color: #334155; font-size: 10.5px; }
    .cert-list li { margin-bottom: 8px; }
    .cert-list strong, .cert-list span { display: block; }
    .timeline-list { margin-left: 0; }
    .timeline-item { position: relative; margin: 0; padding: 0 0 13px 18px; border-left: 1px solid #cbd5e1; }
    .timeline-item:before { content: ""; position: absolute; left: -4px; top: 4px; width: 7px; height: 7px; border-radius: 999px; border: 1px solid #475569; background: #fff; }
    .project-slim { margin-bottom: 11px; }
    .project-slim p, .executive p, .geometric p { color: #334155; font-size: 11px; line-height: 1.48; }
    .executive { padding: 28px; }
    .executive-header { display: grid; grid-template-columns: 1fr 104px; gap: 20px; align-items: start; padding-bottom: 15px; border-bottom: 1px solid #cbd5e1; }
    .executive h1 { color: #475569; font-size: 31px; text-transform: uppercase; }
    .executive .title { color: #64748b; font-size: 13px; }
    .executive .rule { height: 1px; margin: 15px 0 7px; background: #cbd5e1; }
    .executive-columns { display: grid; grid-template-columns: 64% 30%; gap: 9%; padding-top: 20px; }
    .executive-columns main, .executive-columns aside { display: flex; flex-direction: column; gap: 18px; }
    .geometric { position: relative; padding: 0; overflow: hidden; }
    .geo-top { position: absolute; left: 0; top: 0; width: 100%; height: 56px; background: #263f55; }
    .geo-top-accent { position: absolute; right: 0; top: 0; width: 61%; height: 72px; background: #4f8fc3; clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%); }
    .geo-bottom { position: absolute; right: 0; bottom: 0; width: 34%; height: 48px; background: #263f55; clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%); }
    .geo-bottom-accent { position: absolute; left: 0; bottom: 0; width: 78%; height: 16px; background: #4f8fc3; }
    .geo-grid { position: relative; display: grid; grid-template-columns: 31% 69%; padding: 52px 32px 36px; }
    .geo-grid aside { padding-right: 24px; padding-top: 4px; }
    .geo-grid main { padding-left: 16px; padding-top: 24px; }
    .geo-photo { width: 116px; height: 116px; margin: 0 auto 28px; border: 6px solid #fff; box-shadow: 0 1px 4px rgba(15, 23, 42, .18); }
    .geometric h1 { color: #475569; font-size: 30px; text-transform: uppercase; }
    .geometric main header { margin-bottom: 28px; }
    .geometric main header .title { padding-bottom: 8px; border-bottom: 1px solid #94a3b8; color: #475569; font-size: 13px; }
    .geometric main > section, .geometric main > .timeline-list, .geometric main > article { margin-bottom: 18px; }
    .geometric section { margin-bottom: 18px; }
    .with-line { padding-bottom: 4px; border-bottom: 1px solid #94a3b8; }
    .small-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
    .deep-green { display: grid; grid-template-columns: 34% 66%; padding: 0; color: #173729; background: #f8faf7; }
    .deep-green aside { min-height: 297mm; padding: 30px 24px; background: #173d2b; color: #d9eadc; }
    .deep-green aside h1 { color: #fff; font-size: 28px; line-height: 1.08; }
    .deep-green aside .title { color: #82b894; font-size: 11px; letter-spacing: .14em; }
    .deep-green main { padding: 30px 34px; }
    .deep-green main header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #c8d9cd; }
    .deep-green main header h1 { color: #173729; font-size: 18px; }
    .deep-green main header p { color: #68836f; font-size: 12px; }
    .side-rule { height: 1px; margin: 18px 0 30px; background: #4f7f66; }
    .side-title { margin: 0 0 10px; padding: 0 0 8px; border: 0; border-bottom: 1px solid #4f7f66; color: #82b894; font-size: 11px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
    .side-details { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
    .side-row { display: grid; grid-template-columns: 16px 1fr; gap: 10px; color: #a8c7b3; font-size: 10.5px; line-height: 1.45; }
    .side-icon { width: 14px; height: 14px; color: #86c79a; }
    .deep-skill-group { margin-bottom: 12px; }
    .deep-skill-group h3 { margin-bottom: 4px; color: #74b286; font-size: 10px; text-transform: uppercase; letter-spacing: .14em; }
    .deep-skill-group ul { margin: 0; padding: 0; list-style: none; color: #b6d1bf; font-size: 10.5px; }
    .deep-skill-group li { display: flex; gap: 8px; align-items: center; margin: 0; padding: 4px 0; border-bottom: 1px solid #244f39; }
    .deep-skill-group li span { width: 4px; height: 4px; border-radius: 999px; background: #82b894; flex: 0 0 auto; }
    .green-title { margin: 0 0 10px; padding: 0 0 8px; border: 0; border-bottom: 1px solid #b8d1c0; color: #1f3d2d; font-size: 11px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
    .green-item { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #d6e2d9; }
    .green-item h3 { color: #173729; font-size: 13px; }
    .green-item strong, .green-item .row span { color: #68836f; font-size: 10.5px; }
    .green-item p, .deep-green main p { color: #344f3d; font-size: 11px; }
    .deep-small { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
    .ribbon-profile { display: grid; grid-template-columns: 34% 66%; padding: 0; color: #0f172a; }
    .ribbon-profile aside { min-height: 297mm; padding-top: 34px; overflow: visible; }
    .ribbon-profile main { position: relative; padding: 38px 38px; }
    .ribbon-profile main header { margin-bottom: 34px; padding-right: 42px; }
    .ribbon-profile main header h1 { color: ${color}; font-size: 31px; line-height: .9; text-transform: uppercase; }
    .ribbon-profile main header p { color: #334155; font-size: 12px; font-weight: 700; }
    .ribbon-photo { width: 108px; height: 108px; margin: 0 auto 18px; border: 5px solid #fff; box-shadow: 0 0 0 4px rgba(15, 23, 42, .08); }
    .ribbon-block { margin: 0 0 15px; }
    .ribbon-title { position: relative; height: 32px; padding: 8px 20px; font-size: 13px; font-weight: 900; text-transform: uppercase; }
    .ribbon-title span { position: absolute; right: -14px; top: 0; width: 0; height: 0; border-top: 16px solid transparent; border-bottom: 16px solid transparent; border-left: 14px solid; }
    .ribbon-content { padding: 14px 20px; color: #1f2937; font-size: 10.5px; line-height: 1.45; }
    .ribbon-content article { margin-bottom: 10px; }
    .ribbon-content h3, .ribbon-content strong { font-size: 10.8px; color: #111827; }
    .ribbon-content ul { margin: 0; padding-left: 15px; }
    .ribbon-main-title { margin: 0 0 16px; padding: 0; border: 0; color: ${color}; font-size: 16px; font-weight: 900; text-transform: none; letter-spacing: 0; }
    .ribbon-timeline { display: grid; grid-template-columns: 52px 1fr; gap: 20px; margin-bottom: 18px; }
    .ribbon-date { display: flex; flex-direction: column; align-items: center; color: #334155; font-size: 10px; font-weight: 900; line-height: 1.45; }
    .ribbon-job { border-left: 1px solid #cbd5e1; padding-left: 22px; }
    .ribbon-job h3 { color: #111827; font-size: 12.5px; }
    .ribbon-job p, .ribbon-job li { color: #334155; font-size: 10.5px; }
    .ribbon-projects { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .ribbon-projects h3 { color: #111827; font-size: 12px; }
    .ribbon-projects p { color: #334155; font-size: 10.5px; }
    .ribbon-deco { position: absolute; right: 28px; width: 28px; }
    .deco-a { top: 28px; height: 96px; }
    .deco-b { top: 150px; height: 36px; }
    .deco-c { bottom: 28px; height: 36px; }
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
