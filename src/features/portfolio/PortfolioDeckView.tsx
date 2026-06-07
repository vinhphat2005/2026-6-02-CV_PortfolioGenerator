import React, { type CSSProperties } from "react";
import { ExternalLink } from "lucide-react";
import { safeHref } from "@/lib/safeUrl";
import type { PortfolioCaseStudy, PortfolioImageRef, ProfileDocument } from "@/lib/types";

export const portfolioDeckCss = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #d9ddda; color: #15231d; font-family: Arial, sans-serif; }
  .portfolio-deck { display: grid; gap: 24px; }
  .portfolio-deck-page { position: relative; width: 210mm; min-height: 297mm; overflow: hidden; background: #fff; padding: 20mm; page-break-after: always; break-after: page; }
  .portfolio-deck-page:last-child { page-break-after: auto; break-after: auto; }
  .deck-eyebrow { color: var(--accent); font-size: 10px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; }
  .deck-title { max-width: 150mm; margin: 8mm 0 4mm; color: #111b16; font-size: 31px; line-height: 1.02; }
  .deck-subtitle { max-width: 145mm; color: #617269; font-size: 14px; line-height: 1.55; }
  .deck-rule { width: 36mm; height: 3px; margin: 7mm 0; background: var(--accent); }
  .deck-cover { display: grid; align-content: end; color: #fff; background: var(--accent); }
  .deck-cover .deck-title, .deck-cover .deck-subtitle { color: #fff; }
  .deck-cover-mark { position: absolute; right: -32mm; top: 24mm; width: 105mm; height: 105mm; border: 18mm solid rgba(255,255,255,.16); border-radius: 999px; }
  .deck-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12mm; }
  .deck-columns { columns: 2; column-gap: 12mm; color: #43544b; font-size: 11px; line-height: 1.65; }
  .deck-list { margin: 4mm 0 0; padding-left: 5mm; color: #43544b; font-size: 11px; line-height: 1.6; }
  .deck-list li { margin-bottom: 2mm; }
  .deck-toc-row { display: grid; grid-template-columns: 14mm 1fr 12mm; gap: 5mm; align-items: center; padding: 5mm 0; border-bottom: 1px solid #d8e0dc; }
  .deck-toc-index { color: var(--accent); font-size: 18px; font-weight: 900; }
  .deck-toc-title { font-size: 14px; font-weight: 800; }
  .deck-toc-page { color: #718279; font-size: 10px; text-align: right; }
  .deck-project-cover { display: grid; grid-template-rows: 1fr auto; padding: 0; background: #111b16; color: #fff; }
  .deck-project-cover .deck-media { min-height: 205mm; border-radius: 0; }
  .deck-project-cover footer { padding: 14mm 18mm 18mm; }
  .deck-project-cover .deck-title, .deck-project-cover .deck-subtitle { color: #fff; }
  .deck-media { display: grid; place-items: center; min-height: 76mm; overflow: hidden; border-radius: 3px; background: #e7eeea; color: #718279; font-size: 11px; text-transform: uppercase; }
  .deck-media img { width: 100%; height: 100%; object-fit: cover; }
  .deck-section-title { margin: 0 0 4mm; font-size: 11px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); }
  .deck-copy { color: #43544b; font-size: 11px; line-height: 1.65; white-space: pre-line; }
  .deck-meta { display: flex; flex-wrap: wrap; gap: 2mm; margin-top: 5mm; }
  .deck-chip { padding: 2mm 3mm; border: 1px solid #ccd8d2; color: #43544b; font-size: 9px; font-weight: 700; }
  .deck-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4mm; }
  .deck-metric { padding: 5mm; background: var(--accent); color: #fff; }
  .deck-metric strong { display: block; font-size: 19px; }
  .deck-metric span { display: block; margin-top: 2mm; font-size: 9px; text-transform: uppercase; }
  .deck-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
  .deck-gallery .deck-media:first-child { grid-column: span 2; min-height: 90mm; }
  .deck-page-number { position: absolute; right: 12mm; bottom: 9mm; color: #84948b; font-size: 9px; font-weight: 800; }
  .deck-contact { display: grid; align-content: center; color: #fff; background: #111b16; }
  .deck-contact .deck-title, .deck-contact .deck-subtitle { color: #fff; }
  .deck-links { display: grid; gap: 3mm; margin-top: 8mm; }
  .deck-link { color: inherit; font-size: 11px; font-weight: 800; text-decoration: none; }
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
  className = ""
}: {
  image?: PortfolioImageRef;
  assets: Record<string, string>;
  className?: string;
}) {
  const src = resolveImage(image, assets);
  return (
    <div className={`deck-media ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={image?.alt || ""} />
      ) : (
        <span>Project visual</span>
      )}
    </div>
  );
}

function PageNumber({ value }: { value: number }) {
  return <div className="deck-page-number">{String(value).padStart(2, "0")}</div>;
}

function StudyStoryPage({ study, page }: { study: PortfolioCaseStudy; page: number }) {
  return (
    <section className="portfolio-deck-page">
      <div className="deck-eyebrow">{study.role || "Case study"}</div>
      <h2 className="deck-title">{study.title}</h2>
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
  assets
}: {
  study: PortfolioCaseStudy;
  page: number;
  assets: Record<string, string>;
}) {
  const gallery = study.gallery.length > 0 ? study.gallery : study.coverImage ? [study.coverImage] : [];
  return (
    <section className="portfolio-deck-page">
      <div className="deck-eyebrow">Process and outcomes</div>
      <h2 className="deck-title">{study.title}</h2>
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
          {gallery.slice(0, 3).map((image, index) => <DeckImage key={index} image={image} assets={assets} />)}
          {gallery.length === 0 && <DeckImage assets={assets} />}
        </div>
      </div>
      <PageNumber value={page} />
    </section>
  );
}

export function PortfolioDeckView({
  document,
  assets = {}
}: {
  document: ProfileDocument;
  assets?: Record<string, string>;
}) {
  const { portfolio, profile, settings } = document;
  const studies = portfolio.caseStudies.filter((study) => study.includeInDeck);
  let page = 1;
  const style = { "--accent": settings.themeColor } as CSSProperties;

  return (
    <>
      <style>{portfolioDeckCss}</style>
      <article className="portfolio-deck" style={style}>
      <section className="portfolio-deck-page deck-cover">
        <div className="deck-cover-mark" />
        <div className="deck-eyebrow">{portfolio.year} / {portfolio.audience}</div>
        <h1 className="deck-title">{portfolio.title}</h1>
        <p className="deck-subtitle">{portfolio.subtitle}</p>
        <PageNumber value={page++} />
      </section>

      <section className="portfolio-deck-page">
        <div className="deck-eyebrow">About</div>
        <h2 className="deck-title">{profile.personal.name}</h2>
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

      <section className="portfolio-deck-page">
        <div className="deck-eyebrow">Selected work</div>
        <h2 className="deck-title">Table of contents</h2>
        <div style={{ marginTop: "12mm" }}>
          {studies.map((study, index) => (
            <div className="deck-toc-row" key={study.id}>
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
        return [
          <section className="portfolio-deck-page deck-project-cover" key={`${study.id}-cover`}>
            <DeckImage image={study.coverImage} assets={assets} />
            <footer>
              <div className="deck-eyebrow">Project {String(index + 1).padStart(2, "0")} / {study.year}</div>
              <h2 className="deck-title">{study.title}</h2>
              <p className="deck-subtitle">{study.subtitle || study.context}</p>
            </footer>
            <PageNumber value={coverPage} />
          </section>,
          <StudyStoryPage key={`${study.id}-story`} study={study} page={storyPage} />,
          <StudyOutcomePage key={`${study.id}-outcomes`} study={study} page={outcomePage} assets={assets} />
        ];
      })}

      <section className="portfolio-deck-page deck-contact">
        <div className="deck-eyebrow">Contact</div>
        <h2 className="deck-title">{portfolio.contactCta}</h2>
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
