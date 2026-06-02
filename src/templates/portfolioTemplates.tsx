import React from "react";
import { projectCollaborationLabels } from "@/lib/schema";
import type { ProfileDocument, TemplateMeta } from "@/lib/types";

export type PortfolioTemplateComponent = (props: { document: ProfileDocument }) => React.ReactElement;

function ProjectGrid({ document, compact = false }: { document: ProfileDocument; compact?: boolean }) {
  return (
    <div className={compact ? "space-y-3" : "grid gap-4 md:grid-cols-2"}>
      {document.profile.projects.map((project, index) => (
        <article key={`${project.name}-${index}`} className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
            {projectCollaborationLabels[project.collaboration || "personal"]}
            {project.role ? ` / ${project.role}` : ""}
          </div>
          <h3 className="mt-1 text-xl font-bold">{project.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{project.description}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {project.technologies.map((tech, techIndex) => (
              <span key={`${tech}-${techIndex}`} className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600">
                {tech}
              </span>
            ))}
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-700">
            {project.highlights.slice(0, compact ? 2 : 3).map((highlight, highlightIndex) => (
              <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export function TerminalDevPortfolio({ document }: { document: ProfileDocument }) {
  return (
    <article className="min-h-[760px] rounded-[8px] bg-[#101511] p-8 font-mono text-[#e7f0e8]">
      <div className="text-sm text-[#9be7b4]">$ whoami</div>
      <h1 className="mt-2 text-5xl font-black tracking-normal">{document.profile.personal.name}</h1>
      <p className="mt-3 max-w-2xl text-[#aab8ad]">{document.profile.summary}</p>
      <div className="mt-8 text-sm text-[#9be7b4]">$ ls selected-work</div>
      <div className="mt-4 space-y-4">
        <ProjectGrid document={document} compact />
      </div>
    </article>
  );
}

export function CleanProductEngineerPortfolio({ document }: { document: ProfileDocument }) {
  return (
    <article className="min-h-[760px] bg-[#f7f8f4] p-8 text-slate-900">
      <header className="grid min-h-[280px] content-center border-b border-slate-200">
        <p className="text-sm font-bold uppercase tracking-[0.08em]" style={{ color: document.settings.themeColor }}>
          {document.profile.personal.title}
        </p>
        <h1 className="mt-2 text-6xl font-black tracking-normal">{document.profile.personal.name}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{document.profile.summary}</p>
      </header>
      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Selected Work</h2>
        <ProjectGrid document={document} />
      </section>
    </article>
  );
}

export function CaseStudyGridPortfolio({ document }: { document: ProfileDocument }) {
  return (
    <article className="min-h-[760px] bg-white p-8 text-slate-900">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-5xl font-black tracking-normal">{document.profile.personal.name}</h1>
        <p className="mt-3 text-lg text-slate-600">{document.profile.summary}</p>
      </header>
      <ProjectGrid document={document} />
    </article>
  );
}

export function ResumeLandingPortfolio({ document }: { document: ProfileDocument }) {
  return (
    <article className="min-h-[760px] bg-[#f6f7f4] p-8 text-slate-900">
      <div className="grid gap-6 md:grid-cols-[36%_64%]">
        <aside className="rounded-[8px] p-5 text-white" style={{ backgroundColor: document.settings.themeColor }}>
          <h1 className="text-4xl font-black tracking-normal">{document.profile.personal.name}</h1>
          <p className="mt-2 text-white/80">{document.profile.personal.title}</p>
          <div className="mt-6 space-y-1 text-sm text-white/85">
            <div>{document.profile.personal.email}</div>
            <div>{document.profile.personal.location}</div>
            {document.profile.personal.links.map((link, index) => (
              <div key={`${link.url}-${index}`}>{link.label}</div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {document.profile.skills.flatMap((group) => group.items).slice(0, 14).map((skill, index) => (
              <span key={`${skill}-${index}`} className="rounded-full bg-white/15 px-2 py-1 text-xs">
                {skill}
              </span>
            ))}
          </div>
        </aside>
        <main>
          <p className="mb-5 text-lg leading-relaxed text-slate-700">{document.profile.summary}</p>
          <ProjectGrid document={document} compact />
        </main>
      </div>
    </article>
  );
}

export const portfolioTemplateMetas: TemplateMeta[] = [
  {
    id: "terminal-dev",
    name: "Terminal Dev",
    kind: "portfolio",
    description: "Developer-focused terminal aesthetic for technical projects.",
    recommendedFor: ["backend-developer", "game-developer", "ai-automation-developer"],
    supportsPhoto: false,
    atsFriendly: false
  },
  {
    id: "clean-product-engineer",
    name: "Clean Product Engineer",
    kind: "portfolio",
    description: "Quiet product engineering layout with strong project summaries.",
    recommendedFor: ["frontend-developer", "fullstack-developer"],
    supportsPhoto: false,
    atsFriendly: false
  },
  {
    id: "case-study-grid",
    name: "Case Study Grid",
    kind: "portfolio",
    description: "Grid layout for project case studies and measurable outcomes.",
    recommendedFor: ["data-analyst", "fullstack-developer", "ai-automation-developer"],
    supportsPhoto: false,
    atsFriendly: false
  },
  {
    id: "resume-landing",
    name: "Resume Landing",
    kind: "portfolio",
    description: "Single-page portfolio derived directly from resume data.",
    recommendedFor: ["software-engineer-intern", "frontend-developer", "backend-developer"],
    supportsPhoto: false,
    atsFriendly: false
  }
];

export const portfolioTemplateComponents: Record<string, PortfolioTemplateComponent> = {
  "terminal-dev": TerminalDevPortfolio,
  "clean-product-engineer": CleanProductEngineerPortfolio,
  "case-study-grid": CaseStudyGridPortfolio,
  "resume-landing": ResumeLandingPortfolio
};
