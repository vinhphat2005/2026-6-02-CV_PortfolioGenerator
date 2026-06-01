import React from "react";
import type { ProfileDocument, SectionId, TemplateMeta } from "@/lib/types";
import { defaultSectionLabels, roleLabels, sectionIds } from "@/lib/schema";

export type ResumeTemplateComponent = (props: { document: ProfileDocument }) => React.ReactElement;

function label(document: ProfileDocument, id: SectionId) {
  return document.settings.sectionLabels[id] || defaultSectionLabels[id];
}

function visible(document: ProfileDocument, id: SectionId) {
  return !document.settings.hiddenSections.includes(id);
}

function orderedSections(document: ProfileDocument) {
  return document.settings.sectionOrder.filter((id): id is SectionId =>
    sectionIds.includes(id as SectionId)
  );
}

function fontClass(document: ProfileDocument) {
  switch (document.settings.fontPreset) {
    case "classic":
      return "font-sans";
    case "compact":
      return "font-sans text-[12px]";
    case "serif":
      return "font-serif";
    default:
      return "font-sans";
  }
}

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h2 className="mb-2 mt-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em]">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </h2>
  );
}

function ContactBlock({ document }: { document: ProfileDocument }) {
  const { personal } = document.profile;
  return (
    <div className="space-y-1 text-[11px] leading-relaxed">
      {personal.email && <div>{personal.email}</div>}
      {personal.phone && <div>{personal.phone}</div>}
      {personal.location && <div>{personal.location}</div>}
      {personal.website && <div>{personal.website}</div>}
      {personal.links.map((link) => (
        <div key={link.url}>{link.label}: {link.url}</div>
      ))}
    </div>
  );
}

function SkillsSection({ document, compact = false }: { document: ProfileDocument; compact?: boolean }) {
  if (!visible(document, "skills")) return null;
  return (
    <section>
      <SectionTitle color={document.settings.themeColor}>{label(document, "skills")}</SectionTitle>
      <div className={compact ? "space-y-2" : "grid grid-cols-2 gap-2"}>
        {document.profile.skills.map((group) => (
          <div key={group.category}>
            <div className="font-semibold">{group.category}</div>
            <div className="text-[11px] leading-relaxed text-slate-700">{group.items.join(" / ")}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExperienceSection({ document }: { document: ProfileDocument }) {
  if (!visible(document, "experience")) return null;
  return (
    <section>
      <SectionTitle color={document.settings.themeColor}>{label(document, "experience")}</SectionTitle>
      <div className="space-y-3">
        {document.profile.experience.map((item) => (
          <article key={`${item.company}-${item.role}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[13px] font-bold">{item.role}</h3>
                <div className="font-semibold text-slate-700">{item.company}</div>
              </div>
              <div className="whitespace-nowrap text-[11px] text-slate-600">
                {item.startDate} - {item.current ? "Present" : item.endDate}
              </div>
            </div>
            {item.technologies.length > 0 && (
              <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
                {item.technologies.join(" / ")}
              </div>
            )}
            <ul className="mt-1 list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed">
              {item.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectsSection({ document }: { document: ProfileDocument }) {
  if (!visible(document, "projects")) return null;
  return (
    <section>
      <SectionTitle color={document.settings.themeColor}>{label(document, "projects")}</SectionTitle>
      <div className="space-y-3">
        {document.profile.projects.map((project) => (
          <article key={project.name}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[13px] font-bold">{project.name}</h3>
              <div className="text-right text-[10px] text-slate-500">
                {[project.repo && "Repo", project.demo && "Demo", project.video && "Video"].filter(Boolean).join(" / ")}
              </div>
            </div>
            <p className="text-[11.5px] leading-relaxed text-slate-700">{project.description}</p>
            {project.technologies.length > 0 && (
              <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
                {project.technologies.join(" / ")}
              </div>
            )}
            <ul className="mt-1 list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed">
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function EducationSection({ document }: { document: ProfileDocument }) {
  if (!visible(document, "education")) return null;
  return (
    <section>
      <SectionTitle color={document.settings.themeColor}>{label(document, "education")}</SectionTitle>
      {document.profile.education.map((item) => (
        <article key={`${item.school}-${item.degree}`}>
          <div className="flex justify-between gap-2">
            <div>
              <h3 className="text-[13px] font-bold">{item.degree}</h3>
              <div className="font-semibold text-slate-700">{item.school}</div>
            </div>
            <div className="whitespace-nowrap text-[11px] text-slate-600">
              {[item.startDate, item.endDate].filter(Boolean).join(" - ")}
            </div>
          </div>
          {item.highlights.length > 0 && (
            <ul className="mt-1 list-disc pl-4 text-[11.5px] leading-relaxed">
              {item.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  );
}

function SimpleListSection({
  document,
  id,
  items
}: {
  document: ProfileDocument;
  id: SectionId;
  items: string[];
}) {
  if (!visible(document, id) || items.length === 0) return null;
  return (
    <section>
      <SectionTitle color={document.settings.themeColor}>{label(document, id)}</SectionTitle>
      <ul className="list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function CertificationsSection({ document }: { document: ProfileDocument }) {
  if (!visible(document, "certifications") || document.profile.certifications.length === 0) return null;
  return (
    <section>
      <SectionTitle color={document.settings.themeColor}>{label(document, "certifications")}</SectionTitle>
      <ul className="space-y-1 text-[11.5px]">
        {document.profile.certifications.map((item) => (
          <li key={`${item.name}-${item.issuer}`}>
            <span className="font-semibold">{item.name}</span> - {item.issuer} {item.date}
          </li>
        ))}
      </ul>
    </section>
  );
}

function LanguagesSection({ document }: { document: ProfileDocument }) {
  if (!visible(document, "languages") || document.profile.languages.length === 0) return null;
  return (
    <section>
      <SectionTitle color={document.settings.themeColor}>{label(document, "languages")}</SectionTitle>
      <ul className="space-y-1 text-[11.5px]">
        {document.profile.languages.map((item) => (
          <li key={item.name}>
            <span className="font-semibold">{item.name}</span> - {item.level}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CustomSections({ document }: { document: ProfileDocument }) {
  if (!visible(document, "custom")) return null;
  return (
    <>
      {document.profile.customSections.map((section) => (
        <section key={section.id}>
          <SectionTitle color={document.settings.themeColor}>{section.title}</SectionTitle>
          <ul className="list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function SummarySection({ document }: { document: ProfileDocument }) {
  if (!visible(document, "summary")) return null;
  return (
    <section>
      <SectionTitle color={document.settings.themeColor}>{label(document, "summary")}</SectionTitle>
      <p className="text-[11.5px] leading-relaxed text-slate-700">{document.profile.summary}</p>
    </section>
  );
}

function RenderOrderedSections({ document }: { document: ProfileDocument }) {
  const renderers: Record<SectionId, React.ReactNode> = {
    summary: <SummarySection document={document} />,
    skills: <SkillsSection document={document} />,
    experience: <ExperienceSection document={document} />,
    projects: <ProjectsSection document={document} />,
    education: <EducationSection document={document} />,
    certifications: <CertificationsSection document={document} />,
    languages: <LanguagesSection document={document} />,
    interests: <SimpleListSection document={document} id="interests" items={document.profile.interests} />,
    custom: <CustomSections document={document} />
  };
  return <>{orderedSections(document).map((id) => <div key={id}>{renderers[id]}</div>)}</>;
}

function Header({ document, centered = false }: { document: ProfileDocument; centered?: boolean }) {
  const { personal } = document.profile;
  return (
    <header className={centered ? "text-center" : ""}>
      <h1 className="text-[30px] font-black leading-none tracking-normal" style={{ color: document.settings.themeColor }}>
        {personal.name}
      </h1>
      <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-600">{personal.title}</p>
      <div className="mt-2 text-[10.5px] text-slate-600">
        {[personal.email, personal.phone, personal.location, personal.website].filter(Boolean).join(" | ")}
      </div>
    </header>
  );
}

export function ClassicSidebarResume({ document }: { document: ProfileDocument }) {
  const { personal } = document.profile;
  return (
    <article className={`resume-page grid grid-cols-[32%_68%] overflow-hidden bg-white text-slate-900 ${fontClass(document)}`}>
      <aside className="p-6 text-white" style={{ backgroundColor: document.settings.themeColor }}>
        <div className="mb-6 flex aspect-square items-center justify-center overflow-hidden rounded-full bg-white/18 text-center text-5xl font-black">
          {personal.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={personal.photoUrl} alt={personal.name} className="h-full w-full object-cover" />
          ) : (
            personal.name.slice(0, 1)
          )}
        </div>
        <h1 className="text-[28px] font-black leading-tight">{personal.name}</h1>
        <p className="mb-6 mt-2 text-[14px] text-white/82">{personal.title}</p>
        <ContactBlock document={document} />
        <div className="mt-6 border-t border-white/25 pt-4">
          <h2 className="mb-2 text-[14px] font-bold">{roleLabels[document.settings.targetRole]}</h2>
          {visible(document, "skills") && (
            <div className="space-y-3 text-[11px]">
              {document.profile.skills.map((group) => (
                <div key={group.category}>
                  <div className="font-bold">{group.category}</div>
                  <div className="text-white/82">{group.items.join(" / ")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {visible(document, "interests") && document.profile.interests.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-[14px] font-bold">{label(document, "interests")}</h2>
            <ul className="list-disc space-y-1 pl-4 text-[11px] text-white/82">
              {document.profile.interests.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>
      <main className="p-7">
        <RenderOrderedSections
          document={{
            ...document,
            settings: {
              ...document.settings,
              hiddenSections: [...document.settings.hiddenSections, "skills", "interests"]
            }
          }}
        />
      </main>
    </article>
  );
}

export function AtsMinimalResume({ document }: { document: ProfileDocument }) {
  return (
    <article className={`resume-page bg-white p-8 text-slate-900 ${fontClass(document)}`}>
      <Header document={document} centered />
      <div className="mt-4 border-t border-slate-300 pt-1">
        <RenderOrderedSections document={document} />
      </div>
    </article>
  );
}

export function ModernEngineeringResume({ document }: { document: ProfileDocument }) {
  return (
    <article className={`resume-page bg-white p-8 text-slate-900 ${fontClass(document)}`}>
      <Header document={document} />
      <div className="mt-4 grid grid-cols-[62%_38%] gap-6">
        <main>
          <ExperienceSection document={document} />
          <ProjectsSection document={document} />
        </main>
        <aside className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
          <SummarySection document={document} />
          <SkillsSection document={document} compact />
          <EducationSection document={document} />
          <CertificationsSection document={document} />
        </aside>
      </div>
    </article>
  );
}

export function CompactOnePageResume({ document }: { document: ProfileDocument }) {
  const compactDocument = {
    ...document,
    settings: {
      ...document.settings,
      fontPreset: "compact" as const
    }
  };
  return (
    <article className={`resume-page bg-white p-6 text-slate-900 ${fontClass(compactDocument)}`}>
      <Header document={compactDocument} />
      <div className="mt-2 grid grid-cols-[36%_64%] gap-4">
        <aside>
          <SummarySection document={compactDocument} />
          <SkillsSection document={compactDocument} compact />
          <EducationSection document={compactDocument} />
          <LanguagesSection document={compactDocument} />
        </aside>
        <main>
          <ExperienceSection document={compactDocument} />
          <ProjectsSection document={compactDocument} />
        </main>
      </div>
    </article>
  );
}

export function ProfessionalCleanResume({ document }: { document: ProfileDocument }) {
  return (
    <article className={`resume-page bg-white p-8 text-slate-900 ${fontClass(document)}`}>
      <div className="border-b-4 pb-4" style={{ borderColor: document.settings.themeColor }}>
        <Header document={document} />
      </div>
      <RenderOrderedSections document={document} />
    </article>
  );
}

export const resumeTemplateMetas: TemplateMeta[] = [
  {
    id: "classic-sidebar",
    name: "Classic Sidebar",
    kind: "resume",
    description: "Two-column CV with a strong sidebar, profile photo area, and dense content.",
    recommendedFor: ["frontend-developer", "fullstack-developer", "game-developer"],
    supportsPhoto: true,
    atsFriendly: false
  },
  {
    id: "ats-minimal",
    name: "ATS Minimal",
    kind: "resume",
    description: "Single-column structure optimized for parsers and recruiter scanning.",
    recommendedFor: ["software-engineer-intern", "backend-developer", "data-analyst"],
    supportsPhoto: false,
    atsFriendly: true
  },
  {
    id: "modern-engineering",
    name: "Modern Engineering",
    kind: "resume",
    description: "Project-forward layout for engineers with measurable product work.",
    recommendedFor: ["fullstack-developer", "backend-developer", "ai-automation-developer"],
    supportsPhoto: false,
    atsFriendly: true
  },
  {
    id: "compact-one-page",
    name: "Compact One Page",
    kind: "resume",
    description: "Dense layout for fitting high-signal content on one page.",
    recommendedFor: ["software-engineer-intern", "frontend-developer"],
    supportsPhoto: false,
    atsFriendly: true
  },
  {
    id: "professional-clean",
    name: "Professional Clean",
    kind: "resume",
    description: "Polished international format with conservative spacing and typography.",
    recommendedFor: ["backend-developer", "fullstack-developer", "data-analyst"],
    supportsPhoto: false,
    atsFriendly: true
  }
];

export const resumeTemplateComponents: Record<string, ResumeTemplateComponent> = {
  "classic-sidebar": ClassicSidebarResume,
  "ats-minimal": AtsMinimalResume,
  "modern-engineering": ModernEngineeringResume,
  "compact-one-page": CompactOnePageResume,
  "professional-clean": ProfessionalCleanResume
};
