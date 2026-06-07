import JSZip from "jszip";
import { projectCollaborationLabels, roleLabels } from "./schema";
import { safeHref } from "./safeUrl";
import type { ProfileDocument } from "./types";

function escapeHtml(value: string | undefined) {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function projectCards(document: ProfileDocument) {
  return document.profile.projects
    .map(
      (project) => `
        <article class="card">
          <div class="eyebrow">${escapeHtml(projectCollaborationLabels[project.collaboration || "personal"])}${project.role ? ` / ${escapeHtml(project.role)}` : ""}</div>
          <h3>${escapeHtml(project.name)}</h3>
          <p>${escapeHtml(project.description)}</p>
          <p class="muted">${escapeHtml(project.technologies.join(" / "))}</p>
          <ul>${project.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <div class="links">
            ${portfolioLink(project.repo, "Repository")}
            ${portfolioLink(project.demo, "Demo")}
            ${portfolioLink(project.video, "Video")}
          </div>
        </article>
      `
    )
    .join("");
}

function portfolioLink(url: string | undefined, label: string) {
  const href = safeHref(url);
  return href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>` : "";
}

export function generatePortfolioHtml(document: ProfileDocument, templateId: string) {
  const { profile, settings } = document;
  const color = settings.themeColor;
  const terminal = templateId === "terminal-dev";
  const caseGrid = templateId === "case-study-grid";
  const title = `${profile.personal.name} - ${profile.personal.title}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https:; font-src data:; connect-src 'none'; script-src 'none'; base-uri 'none'; form-action 'none'" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { --accent: ${color}; --ink: #17201b; --muted: #5d6b62; --bg: ${terminal ? "#101511" : "#f6f7f4"}; --card: ${terminal ? "#17201b" : "#ffffff"}; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, Arial, sans-serif; color: var(--ink); background: var(--bg); line-height: 1.55; }
    ${terminal ? "body { color: #e7f0e8; } a { color: #9be7b4; } .muted { color: #aab8ad; }" : "a { color: var(--accent); }"}
    main { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 48px 0; }
    header { min-height: 56vh; display: grid; align-content: center; border-bottom: 1px solid rgba(90, 105, 93, 0.22); }
    h1 { font-size: clamp(2.4rem, 8vw, 5.8rem); line-height: 0.95; margin: 0 0 18px; letter-spacing: 0; }
    h2 { margin-top: 48px; font-size: 1.9rem; }
    h3 { margin: 8px 0 10px; font-size: 1.35rem; }
    .subtitle { max-width: 740px; font-size: 1.2rem; color: var(--muted); }
    .eyebrow { color: var(--accent); text-transform: uppercase; font-size: .78rem; letter-spacing: .08em; font-weight: 700; }
    .grid { display: grid; grid-template-columns: ${caseGrid ? "repeat(auto-fit, minmax(280px, 1fr))" : "1fr"}; gap: 18px; }
    .card { background: var(--card); border: 1px solid rgba(90, 105, 93, 0.2); border-radius: 8px; padding: 22px; box-shadow: 0 10px 24px rgba(20, 30, 20, .08); }
    .links { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 14px; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; list-style: none; }
    .skills li { border: 1px solid rgba(90, 105, 93, 0.24); border-radius: 999px; padding: 6px 10px; background: rgba(255,255,255,.45); }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="eyebrow">${escapeHtml(roleLabels[settings.targetRole])}</div>
      <h1>${escapeHtml(profile.personal.name)}</h1>
      <p class="subtitle">${escapeHtml(profile.summary)}</p>
      <p>${profile.personal.links.map((link) => portfolioLink(link.url, link.label)).filter(Boolean).join(" / ")}</p>
    </header>
    <section>
      <h2>Selected Work</h2>
      <div class="grid">${projectCards(document)}</div>
    </section>
    <section>
      <h2>Skills</h2>
      <ul class="skills">${profile.skills.flatMap((group) => group.items).map((skill) => `<li>${escapeHtml(skill)}</li>`).join("")}</ul>
    </section>
    <section>
      <h2>Contact</h2>
      <p>${escapeHtml(profile.personal.email)} ${profile.personal.location ? ` / ${escapeHtml(profile.personal.location)}` : ""}</p>
    </section>
  </main>
</body>
</html>`;
}

export async function buildPortfolioZip(document: ProfileDocument, templateId: string) {
  const zip = new JSZip();
  zip.file("index.html", generatePortfolioHtml(document, templateId));
  zip.file(
    "README.txt",
    "Open index.html in a browser, or host the folder on GitHub Pages, Netlify, Vercel, or any static host."
  );
  return zip.generateAsync({ type: "blob" });
}
