import React, { type CSSProperties } from "react";
import { ExternalLink } from "lucide-react";
import { accessibleTextColor } from "@/lib/colorContrast";
import { safeHref } from "@/lib/safeUrl";
import type {
  PortfolioCaseStudy,
  PortfolioDeckTemplateId,
  PortfolioImageRef,
  ProfileDocument
} from "@/lib/types";

export const portfolioDeckCss = `
  * { box-sizing: border-box; }
  .portfolio-deck { display: grid; gap: 24px; color: #15231d; font-family: Arial, sans-serif; }
  .portfolio-deck-page { position: relative; width: 210mm; min-height: 297mm; overflow: hidden; background: #fff; padding: 20mm; page-break-after: always; break-after: page; }
  .portfolio-deck-page:last-child { page-break-after: auto; break-after: auto; }
  .deck-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  .deck-eyebrow { color: var(--deck-primary); font-size: 10px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; }
  .deck-title { max-width: 150mm; margin: 8mm 0 4mm; color: #111b16; font-size: 31px; line-height: 1.02; }
  .deck-subtitle { max-width: 145mm; color: #617269; font-size: 14px; line-height: 1.55; }
  .deck-rule { width: 36mm; height: 3px; margin: 7mm 0; background: var(--deck-primary); }
  .deck-cover { display: grid; align-content: end; color: var(--deck-on-primary); background: var(--deck-primary); }
  .deck-cover .deck-title, .deck-cover .deck-subtitle { color: var(--deck-on-primary); }
  .deck-cover-mark { position: absolute; right: -32mm; top: 24mm; width: 105mm; height: 105mm; border: 18mm solid rgba(255,255,255,.16); border-radius: 999px; }
  .deck-cover-visual { position: absolute; right: 18mm; top: 30mm; width: 76mm; min-height: 105mm; height: 105mm; border-radius: 0; }
  .deck-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12mm; }
  .deck-columns { columns: 2; column-gap: 12mm; color: #43544b; font-size: 11px; line-height: 1.65; }
  .deck-list { margin: 4mm 0 0; padding-left: 5mm; color: #43544b; font-size: 11px; line-height: 1.6; }
  .deck-list li { margin-bottom: 2mm; }
  .deck-toc-row { display: grid; grid-template-columns: 14mm 1fr 12mm; gap: 5mm; align-items: center; padding: 5mm 0; border-bottom: 1px solid #d8e0dc; }
  .deck-toc-index { color: var(--deck-primary); font-size: 18px; font-weight: 900; }
  .deck-toc-title { font-size: 14px; font-weight: 800; }
  .deck-toc-page { color: #718279; font-size: 10px; text-align: right; }
  .deck-project-cover { display: grid; grid-template-rows: 1fr auto; padding: 0; background: var(--deck-secondary); color: var(--deck-on-secondary); }
  .deck-project-cover .deck-media { min-height: 205mm; border-radius: 0; }
  .deck-project-cover footer { padding: 14mm 18mm 18mm; }
  .deck-project-cover .deck-title, .deck-project-cover .deck-subtitle { color: var(--deck-on-secondary); }
  .deck-media { display: grid; place-items: center; min-height: 76mm; overflow: hidden; margin: 0; border-radius: 3px; background: #e7eeea; color: #718279; font-size: 11px; text-transform: uppercase; }
  .deck-media img { width: 100%; height: 100%; object-fit: cover; }
  .deck-section-title { margin: 0 0 4mm; font-size: 11px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; color: var(--deck-primary); }
  .deck-copy { color: #43544b; font-size: 11px; line-height: 1.65; white-space: pre-line; }
  .deck-meta { display: flex; flex-wrap: wrap; gap: 2mm; margin-top: 5mm; }
  .deck-chip { padding: 2mm 3mm; border: 1px solid #ccd8d2; color: #43544b; font-size: 9px; font-weight: 700; }
  .deck-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4mm; }
  .deck-metric { padding: 5mm; background: var(--deck-primary); color: var(--deck-on-primary); }
  .deck-metric strong { display: block; font-size: 19px; }
  .deck-metric span { display: block; margin-top: 2mm; font-size: 9px; text-transform: uppercase; }
  .deck-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
  .deck-gallery .deck-media:first-child { grid-column: span 2; min-height: 90mm; }
  .deck-page-number { position: absolute; right: 12mm; bottom: 9mm; color: #84948b; font-size: 9px; font-weight: 800; }
  .deck-contact { display: grid; align-content: center; color: var(--deck-on-secondary); background: var(--deck-secondary); }
  .deck-contact .deck-title, .deck-contact .deck-subtitle { color: var(--deck-on-secondary); }
  .deck-links { display: grid; gap: 3mm; margin-top: 8mm; }
  .deck-link { color: inherit; font-size: 11px; font-weight: 800; text-decoration: none; }

  .deck-template-editorial-blue .deck-cover { align-content: center; padding-left: 30mm; background: #fff; color: var(--deck-secondary); }
  .deck-template-editorial-blue .deck-cover:before { content: ""; position: absolute; left: 0; bottom: 0; width: 28mm; height: 92mm; background: var(--deck-primary); }
  .deck-template-editorial-blue .deck-cover:after { content: ""; position: absolute; right: 0; top: 0; width: 52mm; height: 82mm; background: var(--deck-primary); }
  .deck-template-editorial-blue .deck-cover .deck-title { max-width: 78mm; color: var(--deck-secondary); font-size: 45px; letter-spacing: .08em; text-transform: uppercase; }
  .deck-template-editorial-blue .deck-cover .deck-subtitle { max-width: 78mm; color: #60747d; }
  .deck-template-editorial-blue .deck-cover-mark { right: 24mm; top: 24mm; width: 36mm; height: 36mm; border: 3mm solid var(--deck-secondary); border-radius: 0; z-index: 1; }
  .deck-template-editorial-blue .deck-cover-visual { right: 22mm; top: 54mm; width: 82mm; height: 112mm; border: 4mm solid #fff; z-index: 1; }
  .deck-template-editorial-blue .deck-project-cover { grid-template-columns: 58% 42%; grid-template-rows: 1fr; background: #fff; color: var(--deck-secondary); }
  .deck-template-editorial-blue .deck-project-cover .deck-media { min-height: 297mm; }
  .deck-template-editorial-blue .deck-project-cover footer { display: grid; align-content: center; background: var(--deck-primary); padding: 18mm; }
  .deck-template-editorial-blue .deck-project-cover .deck-title { color: var(--deck-secondary); font-size: 28px; }
  .deck-template-editorial-blue .deck-project-cover .deck-subtitle { color: var(--deck-secondary); }

  .deck-template-architectural-minimal .portfolio-deck-page { border-top: 5mm solid var(--deck-primary); }
  .deck-template-architectural-minimal .deck-cover { align-content: end; background: #fff; color: var(--deck-secondary); border-top-width: 18mm; }
  .deck-template-architectural-minimal .deck-cover .deck-title { color: var(--deck-secondary); font-size: 52px; max-width: 86mm; line-height: .92; }
  .deck-template-architectural-minimal .deck-cover .deck-subtitle { max-width: 86mm; color: #69757b; }
  .deck-template-architectural-minimal .deck-cover-mark { right: 18mm; top: 50mm; width: 62mm; height: 62mm; border: 0; border-radius: 999px; background: var(--deck-primary); opacity: .7; }
  .deck-template-architectural-minimal .deck-cover-visual { right: 18mm; top: 32mm; width: 75mm; height: 150mm; }
  .deck-template-architectural-minimal .deck-rule { height: 1px; width: 100%; }
  .deck-template-architectural-minimal .deck-chip { border-color: var(--deck-secondary); }
  .deck-template-architectural-minimal .deck-project-cover { background: #fff; color: var(--deck-secondary); }
  .deck-template-architectural-minimal .deck-project-cover footer { border-top: 1px solid var(--deck-secondary); }
  .deck-template-architectural-minimal .deck-project-cover .deck-title { color: var(--deck-secondary); }
  .deck-template-architectural-minimal .deck-project-cover .deck-subtitle { color: #69757b; }

  .deck-template-bold-studio-orange .portfolio-deck-page { border-bottom: 6mm solid var(--deck-primary); }
  .deck-template-bold-studio-orange .deck-cover { align-content: center; background: var(--deck-primary); color: var(--deck-secondary); }
  .deck-template-bold-studio-orange .deck-cover .deck-title { color: var(--deck-secondary); max-width: 88mm; font-size: 55px; font-weight: 900; }
  .deck-template-bold-studio-orange .deck-cover .deck-subtitle { max-width: 88mm; color: var(--deck-secondary); font-weight: 700; }
  .deck-template-bold-studio-orange .deck-cover-mark { right: 8mm; top: 8mm; width: 76mm; height: 76mm; border-color: var(--deck-secondary); border-width: 4mm; opacity: .22; }
  .deck-template-bold-studio-orange .deck-cover-visual { right: 15mm; top: 60mm; width: 78mm; height: 120mm; border: 4mm solid var(--deck-secondary); }
  .deck-template-bold-studio-orange .deck-title { font-weight: 900; }
  .deck-template-bold-studio-orange .deck-toc-index { font-size: 30px; color: var(--deck-secondary); background: var(--deck-primary); text-align: center; }
  .deck-template-bold-studio-orange .deck-project-cover { background: var(--deck-secondary); }
  .deck-template-bold-studio-orange .deck-project-cover footer { border-left: 12mm solid var(--deck-primary); }
  .deck-template-bold-studio-orange .deck-metric { color: var(--deck-secondary); }
  .deck-template-bold-studio-orange .deck-page-number { padding: 2mm 3mm; background: var(--deck-primary); color: var(--deck-secondary); font-size: 13px; }

  .deck-template-digital-agency-noir .portfolio-deck-page { background: var(--deck-secondary); color: #f4f7fb; }
  .deck-template-digital-agency-noir .deck-title { color: #f4f7fb; font-family: Georgia, serif; font-size: 42px; font-weight: 500; }
  .deck-template-digital-agency-noir .deck-subtitle, .deck-template-digital-agency-noir .deck-copy, .deck-template-digital-agency-noir .deck-list { color: #aab5c2; }
  .deck-template-digital-agency-noir .deck-cover { align-content: center; padding-right: 92mm; background: linear-gradient(110deg, var(--deck-secondary) 0 58%, #111a24 58%); }
  .deck-template-digital-agency-noir .deck-cover:after { content: "01  02  03  04  05  06"; position: absolute; left: 20mm; right: 20mm; bottom: 14mm; padding-top: 5mm; border-top: 1px solid #2b3744; color: #8996a5; font-size: 9px; word-spacing: 19mm; }
  .deck-template-digital-agency-noir .deck-cover-visual { right: 16mm; top: 30mm; width: 75mm; height: 210mm; filter: grayscale(1); }
  .deck-template-digital-agency-noir .deck-cover-mark { right: 60mm; top: 34mm; width: 42mm; height: 42mm; border: 0; background: var(--deck-primary); opacity: .9; }
  .deck-template-digital-agency-noir .deck-grid { gap: 18mm; }
  .deck-template-digital-agency-noir .deck-chip { border-color: #465568; color: #d5dce5; }
  .deck-template-digital-agency-noir .deck-toc-row { border-color: #303d4b; }
  .deck-template-digital-agency-noir .deck-toc-title { color: #f4f7fb; }
  .deck-template-digital-agency-noir .deck-toc-page, .deck-template-digital-agency-noir .deck-page-number { color: #8290a0; }
  .deck-template-digital-agency-noir .deck-project-cover { grid-template-columns: 63% 37%; grid-template-rows: 1fr; }
  .deck-template-digital-agency-noir .deck-project-cover .deck-media { min-height: 297mm; filter: grayscale(1); }
  .deck-template-digital-agency-noir .deck-project-cover footer { display: grid; align-content: end; border-left: 1px solid #344151; }
  .deck-template-digital-agency-noir .deck-metric { border: 1px solid #4150ff; background: transparent; color: #f4f7fb; }

  .deck-template-swiss-editorial-coral .portfolio-deck-page { border: 5mm solid #fff; background: #f5f2eb; }
  .deck-template-swiss-editorial-coral .deck-title { color: var(--deck-secondary); font-size: 45px; line-height: .9; text-transform: uppercase; }
  .deck-template-swiss-editorial-coral .deck-cover { align-content: center; padding-left: 24mm; background: #f5f2eb; }
  .deck-template-swiss-editorial-coral .deck-cover:before { content: ""; position: absolute; left: 0; top: 0; width: 15mm; height: 100%; background: var(--deck-primary); }
  .deck-template-swiss-editorial-coral .deck-cover:after { content: "PORTFOLIO / SELECTED WORK"; position: absolute; left: 6mm; top: 25mm; color: var(--deck-secondary); font-size: 8px; font-weight: 900; writing-mode: vertical-rl; }
  .deck-template-swiss-editorial-coral .deck-cover .deck-title { max-width: 105mm; color: var(--deck-secondary); font-size: 60px; }
  .deck-template-swiss-editorial-coral .deck-cover .deck-subtitle { max-width: 90mm; color: #4c4a47; }
  .deck-template-swiss-editorial-coral .deck-cover-visual { right: 13mm; top: 62mm; width: 67mm; height: 150mm; border: 3mm solid var(--deck-primary); }
  .deck-template-swiss-editorial-coral .deck-cover-mark { right: 30mm; top: 24mm; width: 35mm; height: 35mm; border: 0; border-radius: 0; background: var(--deck-primary); }
  .deck-template-swiss-editorial-coral .deck-about .deck-grid { grid-template-columns: 32% 1fr; border-top: 2px solid var(--deck-secondary); padding-top: 8mm; }
  .deck-template-swiss-editorial-coral .deck-toc-row { grid-template-columns: 24mm 1fr 12mm; border-color: var(--deck-secondary); }
  .deck-template-swiss-editorial-coral .deck-toc-index { font-size: 28px; }
  .deck-template-swiss-editorial-coral .deck-project-cover { grid-template-rows: 67% 33%; background: var(--deck-primary); }
  .deck-template-swiss-editorial-coral .deck-project-cover footer { color: var(--deck-secondary); }
  .deck-template-swiss-editorial-coral .deck-project-cover .deck-title, .deck-template-swiss-editorial-coral .deck-project-cover .deck-subtitle { color: var(--deck-secondary); }
  .deck-template-swiss-editorial-coral .deck-story .deck-grid { grid-template-columns: 35% 1fr; }
  .deck-template-swiss-editorial-coral .deck-metric { color: var(--deck-secondary); }

  .deck-template-playful-product-grid .portfolio-deck-page { background: #f7f4ff; border-radius: 0; }
  .deck-template-playful-product-grid .deck-title { color: var(--deck-secondary); font-size: 38px; }
  .deck-template-playful-product-grid .deck-cover { align-content: end; margin: 0; background: #f7f4ff; }
  .deck-template-playful-product-grid .deck-cover:before, .deck-template-playful-product-grid .deck-cover:after { content: ""; position: absolute; border: 3px solid var(--deck-secondary); }
  .deck-template-playful-product-grid .deck-cover:before { left: 15mm; top: 15mm; width: 30mm; height: 30mm; border-radius: 50%; background: var(--deck-primary); }
  .deck-template-playful-product-grid .deck-cover:after { right: 14mm; bottom: 15mm; width: 42mm; height: 42mm; transform: rotate(12deg); }
  .deck-template-playful-product-grid .deck-cover .deck-title { max-width: 135mm; color: var(--deck-secondary); font-size: 58px; }
  .deck-template-playful-product-grid .deck-cover .deck-subtitle { color: #514b69; }
  .deck-template-playful-product-grid .deck-cover-visual { right: 20mm; top: 28mm; width: 110mm; height: 118mm; border: 4mm solid var(--deck-secondary); box-shadow: 9mm 9mm 0 var(--deck-primary); }
  .deck-template-playful-product-grid .deck-cover-mark { display: none; }
  .deck-template-playful-product-grid .deck-grid { gap: 6mm; }
  .deck-template-playful-product-grid .deck-grid > div, .deck-template-playful-product-grid .deck-toc-row { padding: 6mm; border: 2px solid var(--deck-secondary); background: #fff; }
  .deck-template-playful-product-grid .deck-chip { border: 2px solid var(--deck-secondary); background: var(--deck-primary); color: var(--deck-secondary); }
  .deck-template-playful-product-grid .deck-project-cover { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; padding: 12mm; gap: 8mm; background: var(--deck-primary); }
  .deck-template-playful-product-grid .deck-project-cover .deck-media { min-height: auto; border: 3px solid var(--deck-secondary); }
  .deck-template-playful-product-grid .deck-project-cover footer { display: grid; align-content: center; border: 3px solid var(--deck-secondary); background: #fff; color: var(--deck-secondary); }
  .deck-template-playful-product-grid .deck-project-cover .deck-title, .deck-template-playful-product-grid .deck-project-cover .deck-subtitle { color: var(--deck-secondary); }
  .deck-template-playful-product-grid .deck-metric { border: 2px solid var(--deck-secondary); color: var(--deck-secondary); }
  .deck-template-playful-product-grid .deck-contact { margin: 0; background: var(--deck-secondary); }
  @page { size: A4; margin: 0; }
  @media print { body { background: #fff; } .portfolio-deck { gap: 0; } }
`;

function resolveImage(image: PortfolioImageRef | undefined, assets: Record<string, string>) {
  if (!image) return null;
  if (image.kind === "asset") return assets[image.assetId] || null;
  return safeHref(image.url);
}

function DeckImage({
  image,
  assets,
  className = "",
  fallbackAlt = "Project visual"
}: {
  image?: PortfolioImageRef;
  assets: Record<string, string>;
  className?: string;
  fallbackAlt?: string;
}) {
  const src = resolveImage(image, assets);
  return (
    <figure className={`deck-media ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={image?.alt?.trim() || fallbackAlt} />
      ) : (
        <span aria-label={`${fallbackAlt} unavailable`}>Project visual</span>
      )}
    </figure>
  );
}

function PageNumber({ value }: { value: number }) {
  return <div className="deck-page-number" aria-hidden="true">{String(value).padStart(2, "0")}</div>;
}

function StudyStoryPage({ study, page, headingId }: { study: PortfolioCaseStudy; page: number; headingId: string }) {
  return (
    <section className="portfolio-deck-page deck-story" data-page-type="story" aria-labelledby={headingId}>
      <div className="deck-eyebrow">{study.role || "Case study"}</div>
      <h2 className="deck-title" id={headingId}>{study.title}</h2>
      <div className="deck-rule" />
      <div className="deck-grid">
        <div>
          <h3 className="deck-section-title">Challenge</h3>
          <p className="deck-copy">{study.challenge}</p>
          <h3 className="deck-section-title" style={{ marginTop: "10mm" }}>Goals</h3>
          <ul className="deck-list">{study.goals.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
        </div>
        <div>
          <h3 className="deck-section-title">Solution</h3>
          <p className="deck-copy">{study.solution}</p>
          <h3 className="deck-section-title" style={{ marginTop: "10mm" }}>Deliverables</h3>
          <div className="deck-meta">{study.deliverables.map((item, index) => <span className="deck-chip" key={`${item}-${index}`}>{item}</span>)}</div>
        </div>
      </div>
      <PageNumber value={page} />
    </section>
  );
}

function StudyOutcomePage({
  study,
  page,
  assets,
  headingId
}: {
  study: PortfolioCaseStudy;
  page: number;
  assets: Record<string, string>;
  headingId: string;
}) {
  const gallery = study.gallery.length > 0 ? study.gallery : study.coverImage ? [study.coverImage] : [];
  return (
    <section className="portfolio-deck-page deck-outcomes" data-page-type="outcomes" aria-labelledby={headingId}>
      <div className="deck-eyebrow">Process and outcomes</div>
      <h2 className="deck-title" id={headingId}>{study.title}</h2>
      <div className="deck-grid">
        <div>
          <h3 className="deck-section-title">Process</h3>
          <ol className="deck-list">{study.process.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol>
          <h3 className="deck-section-title" style={{ marginTop: "8mm" }}>Outcomes</h3>
          <ul className="deck-list">{study.outcomes.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
          <div className="deck-meta" style={{ marginTop: "8mm" }}>
            {study.tools.map((item, index) => <span className="deck-chip" key={`${item}-${index}`}>{item}</span>)}
          </div>
          <div className="deck-links">
            {study.links.map((link, index) => {
              const href = safeHref(link.url);
              return href ? (
                <a
                  className="deck-link"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={`${link.url}-${index}`}
                >
                  {link.label} <ExternalLink size={12} />
                </a>
              ) : null;
            })}
          </div>
          <div className="deck-metrics" style={{ marginTop: "8mm" }}>
            {study.metrics.map((metric, index) => (
              <div className="deck-metric" key={`${metric.label}-${index}`}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="deck-gallery">
          {gallery.slice(0, 3).map((image, index) => (
            <DeckImage key={index} image={image} assets={assets} fallbackAlt={`${study.title} project visual ${index + 1}`} />
          ))}
          {gallery.length === 0 && <DeckImage assets={assets} fallbackAlt={`${study.title} project visual`} />}
        </div>
      </div>
      <PageNumber value={page} />
    </section>
  );
}

export function PortfolioDeckView({
  document,
  assets = {},
  templateId
}: {
  document: ProfileDocument;
  assets?: Record<string, string>;
  templateId?: PortfolioDeckTemplateId;
}) {
  const { portfolio, profile } = document;
  const studies = portfolio.caseStudies.filter((study) => study.includeInDeck);
  let page = 1;
  const selectedTemplate = templateId || portfolio.templateId;
  const style = {
    "--deck-primary": portfolio.primaryColor,
    "--deck-secondary": portfolio.secondaryColor,
    "--deck-on-primary": accessibleTextColor(portfolio.primaryColor),
    "--deck-on-secondary": accessibleTextColor(portfolio.secondaryColor)
  } as CSSProperties;

  return (
    <>
      <style>{portfolioDeckCss}</style>
      <article className={`portfolio-deck deck-template-${selectedTemplate}`} data-deck-template={selectedTemplate} style={style}>
      <section className="portfolio-deck-page deck-cover" data-page-type="cover" aria-labelledby="deck-cover-title">
        {studies[0]?.coverImage && (
          <DeckImage image={studies[0].coverImage} assets={assets} className="deck-cover-visual" fallbackAlt={`${studies[0].title} cover visual`} />
        )}
        <div className="deck-cover-mark" aria-hidden="true" />
        <div className="deck-eyebrow">{portfolio.year} / {portfolio.audience}</div>
        <h1 className="deck-title" id="deck-cover-title">{portfolio.title}</h1>
        <p className="deck-subtitle">{portfolio.subtitle}</p>
        <PageNumber value={page++} />
      </section>

      <section className="portfolio-deck-page deck-about" data-page-type="about" aria-labelledby="deck-about-title">
        <div className="deck-eyebrow">About</div>
        <h2 className="deck-title" id="deck-about-title">{profile.personal.name}</h2>
        <p className="deck-subtitle">{portfolio.intro}</p>
        <div className="deck-rule" />
        <div className="deck-grid">
          <div>
            <h3 className="deck-section-title">Focus</h3>
            <p className="deck-copy">{portfolio.audience}</p>
          </div>
          <div>
            <h3 className="deck-section-title">Capabilities</h3>
            <div className="deck-meta">{portfolio.capabilities.map((item, index) => <span className="deck-chip" key={`${item}-${index}`}>{item}</span>)}</div>
          </div>
        </div>
        <PageNumber value={page++} />
      </section>

      <section className="portfolio-deck-page deck-toc" data-page-type="toc" aria-labelledby="deck-toc-title">
        <div className="deck-eyebrow">Selected work</div>
        <h2 className="deck-title" id="deck-toc-title">Table of contents</h2>
        <div style={{ marginTop: "12mm" }}>
          {studies.map((study, index) => (
            <div className="deck-toc-row" key={`${study.id}-${index}`}>
              <div className="deck-toc-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="deck-toc-title">{study.title}</div>
              <div className="deck-toc-page">{String(4 + index * 3).padStart(2, "0")}</div>
            </div>
          ))}
        </div>
        <PageNumber value={page++} />
      </section>

      {studies.flatMap((study, index) => {
        const coverPage = page++;
        const storyPage = page++;
        const outcomePage = page++;
        const headingPrefix = `study-${index + 1}`;
        return [
          <section className="portfolio-deck-page deck-project-cover" data-page-type="project-divider" aria-labelledby={`${headingPrefix}-divider`} key={`${study.id}-${index}-cover`}>
            <DeckImage image={study.coverImage} assets={assets} fallbackAlt={`${study.title} cover visual`} />
            <footer>
              <div className="deck-eyebrow">Project {String(index + 1).padStart(2, "0")} / {study.year}</div>
              <h2 className="deck-title" id={`${headingPrefix}-divider`}>{study.title}</h2>
              <p className="deck-subtitle">{study.subtitle || study.context}</p>
            </footer>
            <PageNumber value={coverPage} />
          </section>,
          <StudyStoryPage key={`${study.id}-${index}-story`} study={study} page={storyPage} headingId={`${headingPrefix}-story`} />,
          <StudyOutcomePage key={`${study.id}-${index}-outcomes`} study={study} page={outcomePage} assets={assets} headingId={`${headingPrefix}-outcomes`} />
        ];
      })}

      <section className="portfolio-deck-page deck-contact" data-page-type="contact" aria-labelledby="deck-contact-title">
        <div className="deck-eyebrow">Contact</div>
        <h2 className="deck-title" id="deck-contact-title">{portfolio.contactCta}</h2>
        <p className="deck-subtitle">{profile.personal.email} / {profile.personal.location}</p>
        <div className="deck-links">
          {profile.personal.links.map((link, index) => {
            const href = safeHref(link.url);
            return href ? (
              <a
                className="deck-link"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                key={`${link.url}-${index}`}
              >
                {link.label} <ExternalLink size={12} />
              </a>
            ) : null;
          })}
        </div>
        <PageNumber value={page} />
      </section>
      </article>
    </>
  );
}
