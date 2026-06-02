import React from "react";
import { Github, Globe2, Link2, Mail, MapPin, Phone } from "lucide-react";
import type { ProfileDocument, Project, SectionId, TemplateMeta } from "@/lib/types";
import { defaultSectionLabels, projectCollaborationLabels, roleLabels, sectionIds } from "@/lib/schema";

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

function projectTypeLabel(project: Project) {
  return projectCollaborationLabels[project.collaboration || "personal"];
}

function educationMeta(item: ProfileDocument["profile"]["education"][number]) {
  const academicResult = item.gpa?.trim();
  return [[item.startDate, item.endDate].filter(Boolean).join(" - "), academicResult]
    .filter(Boolean)
    .join(" / ");
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
      {personal.links.map((link, index) => (
        <div key={`${link.url}-${index}`}>{link.label}: {link.url}</div>
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
        {document.profile.skills.map((group, index) => (
          <div key={`${group.category}-${index}`}>
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
        {document.profile.experience.map((item, index) => (
          <article key={`${item.company}-${item.role}-${index}`}>
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
              {item.highlights.map((highlight, highlightIndex) => (
                <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
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
        {document.profile.projects.map((project, index) => (
          <article key={`${project.name}-${index}`}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[13px] font-bold">{project.name}</h3>
              <div className="text-right text-[10px] text-slate-500">
                {[project.repo && "Repo", project.demo && "Demo", project.video && "Video"].filter(Boolean).join(" / ")}
              </div>
            </div>
            <div className="mt-0.5 text-[10.5px] italic text-slate-500">
              {[projectTypeLabel(project), project.role].filter(Boolean).join(" / ")}
            </div>
            <p className="text-[11.5px] leading-relaxed text-slate-700">{project.description}</p>
            {project.technologies.length > 0 && (
              <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
                {project.technologies.join(" / ")}
              </div>
            )}
            <ul className="mt-1 list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed">
              {project.highlights.map((highlight, highlightIndex) => (
                <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
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
      {document.profile.education.map((item, index) => (
        <article key={`${item.school}-${item.degree}-${index}`}>
          <div className="flex justify-between gap-2">
            <div>
              <h3 className="text-[13px] font-bold">{item.degree}</h3>
              <div className="font-semibold text-slate-700">{item.school}</div>
            </div>
            <div className="whitespace-nowrap text-[11px] text-slate-600">
              {educationMeta(item)}
            </div>
          </div>
          {item.highlights.length > 0 && (
            <ul className="mt-1 list-disc pl-4 text-[11.5px] leading-relaxed">
              {item.highlights.map((highlight, highlightIndex) => (
                <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
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
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
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
        {document.profile.certifications.map((item, index) => (
          <li key={`${item.name}-${item.issuer}-${index}`}>
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
        {document.profile.languages.map((item, index) => (
          <li key={`${item.name}-${index}`}>
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
      {document.profile.customSections.map((section, index) => (
        <section key={`${section.id}-${index}`}>
          <SectionTitle color={document.settings.themeColor}>{section.title}</SectionTitle>
          <ul className="list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed">
            {section.items.map((item, itemIndex) => (
              <li key={`${item}-${itemIndex}`}>{item}</li>
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

function PhotoCircle({
  document,
  className,
  textClassName = "text-4xl"
}: {
  document: ProfileDocument;
  className: string;
  textClassName?: string;
}) {
  const { personal } = document.profile;
  return (
    <div className={`grid place-items-center overflow-hidden rounded-full bg-slate-200 text-center font-black text-slate-500 ${className}`}>
      {personal.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={personal.photoUrl} alt={personal.name} className="h-full w-full object-cover" />
      ) : (
        <span className={textClassName}>{personal.name.slice(0, 1)}</span>
      )}
    </div>
  );
}

function FineHeading({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`mb-3 text-[13px] font-black uppercase text-slate-600 ${className}`}>
      {children}
    </h2>
  );
}

function TimelineExperience({ document }: { document: ProfileDocument }) {
  if (!visible(document, "experience")) return null;
  return (
    <section>
      <FineHeading>{label(document, "experience")}</FineHeading>
      <div className="space-y-0">
        {document.profile.experience.map((item, index) => (
          <article key={`${item.company}-${item.role}-${index}`} className="relative border-l border-slate-300 pb-4 pl-5 last:pb-0">
            <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border border-slate-500 bg-white" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[12.5px] font-black text-slate-800">{item.role}</h3>
                <div className="text-[11px] font-semibold text-slate-600">{item.company}</div>
              </div>
              <div className="whitespace-nowrap text-[10px] font-semibold text-slate-500">
                {item.startDate} - {item.current ? "Present" : item.endDate}
              </div>
            </div>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-slate-700">
              {item.highlights.map((highlight, highlightIndex) => (
                <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function TimelineProjects({ document }: { document: ProfileDocument }) {
  if (!visible(document, "projects") || document.profile.projects.length === 0) return null;
  return (
    <section>
      <FineHeading>{label(document, "projects")}</FineHeading>
      <div className="space-y-3">
        {document.profile.projects.map((project, index) => (
          <article key={`${project.name}-${index}`}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[12.5px] font-black text-slate-800">{project.name}</h3>
              {project.technologies.length > 0 && (
                <div className="text-right text-[9.5px] font-semibold uppercase text-slate-500">
                  {project.technologies.slice(0, 4).join(" / ")}
                </div>
              )}
            </div>
            <div className="mt-0.5 text-[10.5px] italic text-slate-500">
              {[projectTypeLabel(project), project.role].filter(Boolean).join(" / ")}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{project.description}</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-slate-700">
              {project.highlights.slice(0, 2).map((highlight, highlightIndex) => (
                <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function SlimEducation({ document }: { document: ProfileDocument }) {
  if (!visible(document, "education")) return null;
  return (
    <section>
      <FineHeading>{label(document, "education")}</FineHeading>
      <div className="space-y-3">
        {document.profile.education.map((item, index) => (
          <article key={`${item.school}-${item.degree}-${index}`}>
            <h3 className="text-[11.5px] font-black text-slate-800">{item.school}</h3>
            <div className="text-[10.5px] font-semibold text-slate-600">{item.degree}</div>
            <div className="text-[10px] text-slate-500">{educationMeta(item)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SlimSkills({ document, dark = false }: { document: ProfileDocument; dark?: boolean }) {
  if (!visible(document, "skills")) return null;
  return (
    <section>
      <FineHeading className={dark ? "text-white" : ""}>{label(document, "skills")}</FineHeading>
      <ul className={`space-y-1.5 pl-4 text-[10.5px] leading-relaxed ${dark ? "list-disc text-white/82" : "list-disc text-slate-700"}`}>
        {document.profile.skills.flatMap((group, groupIndex) =>
          group.items.map((item, itemIndex) => (
            <li key={`${group.category}-${groupIndex}-${item}-${itemIndex}`}>
              {item}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function SlimLanguages({ document }: { document: ProfileDocument }) {
  if (!visible(document, "languages") || document.profile.languages.length === 0) return null;
  return (
    <section>
      <FineHeading>{label(document, "languages")}</FineHeading>
      <ul className="list-disc space-y-1.5 pl-4 text-[10.5px] leading-relaxed text-slate-700">
        {document.profile.languages.map((item, index) => (
          <li key={`${item.name}-${index}`}>
            {item.name} - {item.level}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SlimCertifications({ document }: { document: ProfileDocument }) {
  if (!visible(document, "certifications") || document.profile.certifications.length === 0) return null;
  return (
    <section>
      <FineHeading>{label(document, "certifications")}</FineHeading>
      <ul className="space-y-2 text-[10.5px] leading-relaxed text-slate-700">
        {document.profile.certifications.map((item, index) => (
          <li key={`${item.name}-${item.issuer}-${index}`}>
            <span className="font-bold text-slate-800">{item.name}</span>
            <div>{item.issuer} {item.date}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SlimCustomSections({ document }: { document: ProfileDocument }) {
  if (!visible(document, "custom") || document.profile.customSections.length === 0) return null;
  return (
    <>
      {document.profile.customSections.map((section, index) => (
        <section key={`${section.id}-${index}`}>
          <FineHeading>{section.title}</FineHeading>
          <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-slate-700">
            {section.items.map((item, itemIndex) => (
              <li key={`${item}-${itemIndex}`}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </>
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
              {document.profile.skills.map((group, index) => (
                <div key={`${group.category}-${index}`}>
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
              {document.profile.interests.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
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

export function ExecutiveTimelineResume({ document }: { document: ProfileDocument }) {
  const { personal } = document.profile;
  return (
    <article className={`resume-page overflow-hidden bg-white p-7 text-slate-900 ${fontClass(document)}`}>
      <header className="grid grid-cols-[1fr_104px] items-start gap-5 border-b border-slate-300 pb-4">
        <div>
          <h1 className="text-[31px] font-black uppercase leading-none text-slate-700">
            {personal.name}
          </h1>
          <p className="mt-1 text-[13px] font-semibold uppercase text-slate-500">{personal.title}</p>
          <div className="mt-4 h-px w-full bg-slate-300" />
          <div className="mt-2 text-[10.5px] text-slate-500">
            {[personal.phone, personal.email, personal.website].filter(Boolean).join(" | ")}
          </div>
        </div>
        <PhotoCircle document={document} className="h-[96px] w-[96px]" />
      </header>

      <div className="grid grid-cols-[64%_30%] gap-9 pt-5">
        <main className="space-y-5">
          {visible(document, "summary") && (
            <section>
              <FineHeading>{label(document, "summary")}</FineHeading>
              <p className="text-[11px] leading-relaxed text-slate-700">{document.profile.summary}</p>
            </section>
          )}
          <TimelineExperience document={document} />
          <TimelineProjects document={document} />
          <SlimCustomSections document={document} />
        </main>

        <aside className="space-y-5">
          <SlimEducation document={document} />
          <SlimSkills document={document} />
          <SlimCertifications document={document} />
          <SlimLanguages document={document} />
        </aside>
      </div>
    </article>
  );
}

export function GeometricSidebarResume({ document }: { document: ProfileDocument }) {
  const { personal } = document.profile;
  const navy = "#263f55";
  const blue = "#4f8fc3";
  return (
    <article className={`resume-page relative overflow-hidden bg-white text-slate-900 ${fontClass(document)}`}>
      <div className="absolute left-0 top-0 h-[56px] w-full" style={{ backgroundColor: navy }} />
      <div
        className="absolute right-0 top-0 h-[72px] w-[61%]"
        style={{ backgroundColor: blue, clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%)" }}
      />
      <div
        className="absolute bottom-0 right-0 h-[48px] w-[34%]"
        style={{ backgroundColor: navy, clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0 100%)" }}
      />
      <div className="absolute bottom-0 left-0 h-[16px] w-[78%]" style={{ backgroundColor: blue }} />

      <div className="relative grid grid-cols-[31%_69%] gap-0 px-8 pb-9 pt-[52px]">
        <aside className="pr-6 pt-1">
          <PhotoCircle document={document} className="mx-auto h-[116px] w-[116px] border-[6px] border-white shadow-sm" />

          <div className="mt-7 space-y-5">
            <section>
              <FineHeading className="border-b border-slate-400 pb-1 text-slate-800">Contact</FineHeading>
              <div className="space-y-1.5 text-[10.5px] leading-relaxed text-slate-700">
                {personal.phone && <div>{personal.phone}</div>}
                {personal.email && <div>{personal.email}</div>}
                {personal.location && <div>{personal.location}</div>}
                {personal.website && <div>{personal.website}</div>}
                {personal.links.slice(0, 2).map((link, index) => (
                  <div key={`${link.url}-${index}`}>{link.label}: {link.url}</div>
                ))}
              </div>
            </section>
            <SlimEducation document={document} />
            <SlimSkills document={document} />
          </div>
        </aside>

        <main className="pl-4 pt-6">
          <header className="mb-8">
            <h1 className="text-[30px] font-black uppercase leading-none text-slate-700">
              {personal.name}
            </h1>
            <p className="mt-1 border-b border-slate-400 pb-2 text-[13px] font-semibold uppercase text-slate-600">
              {personal.title}
            </p>
          </header>

          <div className="space-y-5">
            {visible(document, "summary") && (
              <section>
                <FineHeading className="border-b border-slate-400 pb-1" >{label(document, "summary")}</FineHeading>
                <p className="text-[11px] leading-relaxed text-slate-700">{document.profile.summary}</p>
              </section>
            )}
            <TimelineExperience document={document} />
            <TimelineProjects document={document} />
            <div className="grid grid-cols-2 gap-7">
              <SlimCertifications document={document} />
              <SlimLanguages document={document} />
            </div>
          </div>
        </main>
      </div>
    </article>
  );
}

function SidebarTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-[#4f7f66] pb-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#82b894]">
      {children}
    </h2>
  );
}

function SidebarIconRow({
  icon: Icon,
  children
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[16px_1fr] items-start gap-3 text-[10.5px] leading-relaxed text-[#a8c7b3]">
      <Icon className="mt-0.5 h-3.5 w-3.5 text-[#86c79a]" />
      <div className="break-words">{children}</div>
    </div>
  );
}

function sidebarLinkIcon(labelText: string) {
  if (/github/i.test(labelText)) return Github;
  if (/portfolio|website|site/i.test(labelText)) return Globe2;
  return Link2;
}

function DeepSidebarSkills({ document }: { document: ProfileDocument }) {
  if (!visible(document, "skills")) return null;
  return (
    <section>
      <SidebarTitle>{label(document, "skills")}</SidebarTitle>
      <div className="space-y-3">
        {document.profile.skills.map((group, groupIndex) => (
          <div key={`${group.category}-${groupIndex}`}>
            <h3 className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#74b286]">
              {group.category}
            </h3>
            <ul className="text-[10.5px] leading-relaxed text-[#b6d1bf]">
              {group.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="border-b border-[#244f39] py-1">
                  <span className="mr-2 inline-block h-1 w-1 rounded-full bg-[#82b894] align-middle" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function GreenMainTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-[#b8d1c0] pb-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#1f3d2d]">
      {children}
    </h2>
  );
}

function GreenExperience({ document }: { document: ProfileDocument }) {
  if (!visible(document, "experience")) return null;
  return (
    <section>
      <GreenMainTitle>{label(document, "experience")}</GreenMainTitle>
      <div className="space-y-3">
        {document.profile.experience.map((item, index) => (
          <article key={`${item.company}-${item.role}-${index}`} className="border-b border-[#d6e2d9] pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[13px] font-black text-[#173729]">{item.role}</h3>
                <div className="text-[11px] text-[#68836f]">{item.company}</div>
              </div>
              <div className="whitespace-nowrap text-[10px] font-semibold text-[#68836f]">
                {item.startDate} - {item.current ? "Present" : item.endDate}
              </div>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-[#344f3d]">
              {item.highlights.map((highlight, highlightIndex) => (
                <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function GreenProjects({ document }: { document: ProfileDocument }) {
  if (!visible(document, "projects") || document.profile.projects.length === 0) return null;
  return (
    <section>
      <GreenMainTitle>{label(document, "projects")}</GreenMainTitle>
      <div className="space-y-3">
        {document.profile.projects.map((project, index) => (
          <article key={`${project.name}-${index}`} className="border-b border-[#d6e2d9] pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[13px] font-black text-[#173729]">{project.name}</h3>
                <div className="mt-0.5 text-[10.5px] italic text-[#6d8875]">
                  {[projectTypeLabel(project), project.role].filter(Boolean).join(" / ")}
                </div>
              </div>
              {project.technologies.length > 0 && (
                <div className="text-right text-[9.5px] font-bold uppercase text-[#6d8875]">
                  {project.technologies.slice(0, 3).join(" / ")}
                </div>
              )}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[#344f3d]">{project.description}</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-[#344f3d]">
              {project.highlights.slice(0, 2).map((highlight, highlightIndex) => (
                <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export function DeepGreenSidebarResume({ document }: { document: ProfileDocument }) {
  const { personal } = document.profile;
  return (
    <article className={`resume-page grid grid-cols-[34%_66%] overflow-hidden bg-[#f8faf7] text-[#173729] ${fontClass(document)}`}>
      <aside className="bg-[#173d2b] px-6 py-8 text-[#d9eadc]">
        <h1 className="text-[28px] font-black leading-tight text-white">{personal.name}</h1>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#82b894]">{personal.title}</p>
        <div className="mt-5 h-px w-full bg-[#4f7f66]" />

        <div className="mt-8 space-y-8">
          <section>
            <SidebarTitle>Details</SidebarTitle>
            <div className="space-y-3">
              {personal.email && <SidebarIconRow icon={Mail}>{personal.email}</SidebarIconRow>}
              {personal.phone && <SidebarIconRow icon={Phone}>{personal.phone}</SidebarIconRow>}
              {personal.location && <SidebarIconRow icon={MapPin}>{personal.location}</SidebarIconRow>}
              {personal.website && <SidebarIconRow icon={Globe2}>Portfolio</SidebarIconRow>}
              {personal.links.slice(0, 3).map((link, index) => (
                <SidebarIconRow key={`${link.url}-${index}`} icon={sidebarLinkIcon(link.label)}>
                  {link.label}
                </SidebarIconRow>
              ))}
            </div>
          </section>
          <DeepSidebarSkills document={document} />
        </div>
      </aside>

      <main className="px-8 py-8">
        <header className="border-b border-[#c8d9cd] pb-4">
          <h2 className="text-[18px] font-black text-[#173729]">{roleLabels[document.settings.targetRole]}</h2>
          <p className="mt-1 text-[12px] text-[#68836f]">{personal.location || personal.title}</p>
        </header>

        <div className="mt-5 space-y-5">
          {visible(document, "summary") && (
            <section>
              <GreenMainTitle>{label(document, "summary")}</GreenMainTitle>
              <p className="text-[11.5px] leading-relaxed text-[#344f3d]">{document.profile.summary}</p>
            </section>
          )}
          <GreenExperience document={document} />
          <GreenProjects document={document} />
          <div className="grid grid-cols-2 gap-6">
            <EducationSection document={document} />
            <CertificationsSection document={document} />
          </div>
        </div>
      </main>
    </article>
  );
}

function RibbonBlock({
  title,
  color,
  children
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  const textColor = contrastText(color);
  return (
    <section className="mb-4">
      <div className="relative h-8 px-5 py-2 text-[13px] font-black uppercase tracking-normal" style={{ backgroundColor: color, color: textColor }}>
        {title}
        <span
          className="absolute right-[-14px] top-0 h-0 w-0 border-y-[16px] border-l-[14px] border-y-transparent"
          style={{ borderLeftColor: color }}
        />
      </div>
      <div className="px-5 py-4 text-[10.5px] leading-relaxed text-slate-800" style={{ backgroundColor: tint(color, 0.91) }}>
        {children}
      </div>
    </section>
  );
}

function RibbonContact({ document, color }: { document: ProfileDocument; color: string }) {
  const { personal } = document.profile;
  return (
    <RibbonBlock title="Contact" color={color}>
      <div className="space-y-2.5">
        {personal.phone && (
          <div>
            <div className="font-black">Phone</div>
            <div>{personal.phone}</div>
          </div>
        )}
        {personal.email && (
          <div>
            <div className="font-black">Email</div>
            <div className="break-words">{personal.email}</div>
          </div>
        )}
        {personal.location && (
          <div>
            <div className="font-black">Address</div>
            <div>{personal.location}</div>
          </div>
        )}
        {personal.website && (
          <div>
            <div className="font-black">Website</div>
            <div className="break-words">{personal.website}</div>
          </div>
        )}
      </div>
    </RibbonBlock>
  );
}

function RibbonEducation({ document, color }: { document: ProfileDocument; color: string }) {
  if (!visible(document, "education")) return null;
  return (
    <RibbonBlock title={label(document, "education")} color={color}>
      <div className="space-y-3">
        {document.profile.education.map((item, index) => (
          <article key={`${item.school}-${item.degree}-${index}`}>
            <h3 className="text-[11px] font-black">{item.degree}</h3>
            <div>{item.school}</div>
            <div>{educationMeta(item)}</div>
          </article>
        ))}
      </div>
    </RibbonBlock>
  );
}

function RibbonSkills({ document, color }: { document: ProfileDocument; color: string }) {
  if (!visible(document, "skills")) return null;
  return (
    <RibbonBlock title={label(document, "skills")} color={color}>
      <ul className="list-disc space-y-1 pl-4">
        {document.profile.skills.flatMap((group, groupIndex) =>
          group.items.map((item, itemIndex) => (
            <li key={`${group.category}-${groupIndex}-${item}-${itemIndex}`}>
              {item}
            </li>
          ))
        )}
      </ul>
    </RibbonBlock>
  );
}

function RibbonLanguages({ document, color }: { document: ProfileDocument; color: string }) {
  if (!visible(document, "languages") || document.profile.languages.length === 0) return null;
  return (
    <RibbonBlock title={label(document, "languages")} color={color}>
      <ul className="list-disc space-y-1 pl-4">
        {document.profile.languages.map((item, index) => (
          <li key={`${item.name}-${index}`}>{item.name}</li>
        ))}
      </ul>
    </RibbonBlock>
  );
}

function RibbonExperience({ document }: { document: ProfileDocument }) {
  if (!visible(document, "experience")) return null;
  return (
    <section>
      <h2 className="mb-5 text-[16px] font-black tracking-normal" style={{ color: document.settings.themeColor }}>
        Professional Experience
      </h2>
      <div className="space-y-5">
        {document.profile.experience.map((item, index) => (
          <article key={`${item.company}-${item.role}-${index}`} className="grid grid-cols-[52px_1fr] gap-5">
            <div className="text-center text-[10px] font-black leading-relaxed text-slate-700">
              <div>{item.startDate}</div>
              <div>-</div>
              <div>{item.current ? "Present" : item.endDate}</div>
            </div>
            <div className="border-l border-slate-300 pl-6">
              <h3 className="text-[12.5px] font-black text-slate-900">{item.role}</h3>
              <div className="text-[10.5px] text-slate-700">{item.company}{item.location ? `, ${item.location}` : ""}</div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[10.5px] leading-relaxed text-slate-700">
                {item.highlights.map((highlight, highlightIndex) => (
                  <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RibbonProjects({ document }: { document: ProfileDocument }) {
  if (!visible(document, "projects") || document.profile.projects.length === 0) return null;
  return (
    <section>
      <h2 className="mb-4 mt-6 text-[16px] font-black tracking-normal" style={{ color: document.settings.themeColor }}>
        {label(document, "projects")}
      </h2>
      <div className="grid grid-cols-2 gap-5">
        {document.profile.projects.slice(0, 4).map((project, index) => (
          <article key={`${project.name}-${index}`}>
            <h3 className="text-[12px] font-black text-slate-900">{project.name}</h3>
            <div className="mt-0.5 text-[10px] italic text-slate-500">
              {[projectTypeLabel(project), project.role].filter(Boolean).join(" / ")}
            </div>
            <p className="mt-2 text-[10.5px] leading-relaxed text-slate-700">{project.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RibbonProfileResume({ document }: { document: ProfileDocument }) {
  const { personal } = document.profile;
  const sidebarColor = document.settings.sidebarColor || document.settings.themeColor;
  return (
    <article className={`resume-page relative grid grid-cols-[34%_66%] overflow-hidden bg-white text-slate-900 ${fontClass(document)}`}>
      <aside className="min-h-full" style={{ backgroundColor: tint(sidebarColor, 0.91) }}>
        <div className="px-7 pb-5 pt-9">
          <PhotoCircle document={document} className="mx-auto h-[108px] w-[108px] border-[5px] border-white shadow-[0_0_0_4px_rgba(23,79,147,0.18)]" textClassName="text-4xl" />
        </div>
        <RibbonContact document={document} color={sidebarColor} />
        <RibbonEducation document={document} color={sidebarColor} />
        <RibbonSkills document={document} color={sidebarColor} />
        <RibbonLanguages document={document} color={sidebarColor} />
      </aside>

      <main className="relative px-9 py-10">
        <div className="absolute right-7 top-7 h-[96px] w-[28px]" style={{ backgroundColor: tint(sidebarColor, 0.9) }} />
        <div className="absolute right-7 top-[150px] h-[36px] w-[28px]" style={{ backgroundColor: tint(sidebarColor, 0.9) }} />
        <div className="absolute right-7 bottom-8 h-[36px] w-[28px]" style={{ backgroundColor: tint(sidebarColor, 0.9) }} />
        <header className="mb-9 pr-10">
          <h1 className="text-[31px] font-black uppercase leading-[0.9] tracking-normal" style={{ color: document.settings.themeColor }}>
            {personal.name}
          </h1>
          <p className="mt-2 text-[12px] font-bold text-slate-700">{personal.title}</p>
        </header>
        <div className="relative pr-6">
          <RibbonExperience document={document} />
          <RibbonProjects document={document} />
        </div>
      </main>
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
  },
  {
    id: "executive-timeline",
    name: "Executive Timeline",
    kind: "resume",
    description: "Editorial two-column resume with a circular photo, compact profile header, and timeline experience.",
    recommendedFor: ["data-analyst", "frontend-developer", "fullstack-developer"],
    supportsPhoto: true,
    atsFriendly: false
  },
  {
    id: "geometric-sidebar",
    name: "Geometric Sidebar",
    kind: "resume",
    description: "Blue geometric header layout with photo, left sidebar details, and structured main content.",
    recommendedFor: ["software-engineer-intern", "frontend-developer", "fullstack-developer"],
    supportsPhoto: true,
    atsFriendly: false
  },
  {
    id: "deep-green-sidebar",
    name: "Deep Green Sidebar",
    kind: "resume",
    description: "Dark green icon sidebar with separated skill groups and project ownership labels.",
    recommendedFor: ["frontend-developer", "backend-developer", "ai-automation-developer"],
    supportsPhoto: false,
    atsFriendly: false
  },
  {
    id: "ribbon-profile",
    name: "Ribbon Profile",
    kind: "resume",
    description: "Photo sidebar resume with ribbon section headers, timeline experience, and adjustable sidebar color.",
    recommendedFor: ["software-engineer-intern", "frontend-developer", "data-analyst"],
    supportsPhoto: true,
    atsFriendly: false
  }
];

export const resumeTemplateComponents: Record<string, ResumeTemplateComponent> = {
  "classic-sidebar": ClassicSidebarResume,
  "ats-minimal": AtsMinimalResume,
  "modern-engineering": ModernEngineeringResume,
  "compact-one-page": CompactOnePageResume,
  "professional-clean": ProfessionalCleanResume,
  "executive-timeline": ExecutiveTimelineResume,
  "geometric-sidebar": GeometricSidebarResume,
  "deep-green-sidebar": DeepGreenSidebarResume,
  "ribbon-profile": RibbonProfileResume
};
