import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Github, ShieldCheck, Sparkles } from "lucide-react";

const studioRoute = "/studio" as Route;

const capabilities = [
  ["01", "Structured CVs"],
  ["02", "Portfolio Decks"],
  ["03", "Role Scoring"],
  ["04", "Job Matching"],
  ["05", "Local-first Privacy"],
  ["06", "PDF & Website Exports"]
] as const;

function ProductCollage() {
  return (
    <div className="landing-collage" role="img" aria-label="Career Forge product preview showing a CV, portfolio deck, and role score">
      <div className="landing-product landing-product-resume">
        <div className="landing-product-bar"><span /><span /><span /></div>
        <div className="landing-resume-layout">
          <aside>
            <div className="landing-avatar">AM</div>
            <div className="landing-mini-rule" />
            <div className="landing-mini-lines short" />
            <div className="landing-mini-lines" />
            <div className="landing-mini-lines" />
          </aside>
          <section>
            <p>Alex Morgan</p>
            <strong>Software Engineer</strong>
            <div className="landing-mini-rule accent" />
            <div className="landing-mini-lines" />
            <div className="landing-mini-lines" />
            <div className="landing-mini-lines short" />
            <div className="landing-project-block" />
          </section>
        </div>
      </div>

      <div className="landing-product landing-product-deck">
        <div className="landing-deck-index">01 / 12</div>
        <div className="landing-deck-mark" aria-hidden="true" />
        <div>
          <span>Selected work</span>
          <strong>Build evidence, not decoration.</strong>
          <p>Project decisions, process, and measurable outcomes in one focused narrative.</p>
        </div>
      </div>

      <div className="landing-product landing-product-score">
        <div className="landing-score-ring"><strong>86</strong><span>/100</span></div>
        <div>
          <span>Role score</span>
          <strong>Strong match</strong>
          <div className="landing-score-bars"><i /><i /><i /></div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <>
      <a className="skip-link" href="#landing-main">Skip to main content</a>
      <main id="landing-main" className="landing-shell">
        <header className="landing-nav">
          <Link href="/" className="landing-brand" aria-label="Career Forge home">
            <span aria-hidden="true">CF</span>
            Career Forge
          </Link>
          <nav aria-label="Primary navigation">
            <a href="#capabilities">Capabilities</a>
            <a
              href="https://github.com/vinhphat2005/2026-6-02-CV_PortfolioGenerator"
              target="_blank"
              rel="noreferrer"
            >
              Source
            </a>
            <Link className="landing-nav-cta" href={studioRoute}>Open Studio</Link>
          </nav>
        </header>

        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-copy">
            <p className="landing-eyebrow"><Sparkles aria-hidden="true" /> Designed and built by Phat</p>
            <h1 id="landing-title">Career<br /><em>Forge</em></h1>
            <p className="landing-lede">
              Create focused CVs, portfolio decks, and job-ready evidence from one local-first workspace.
            </p>
            <div className="landing-actions">
              <Link className="landing-primary-action" href={studioRoute}>
                Open Studio <ArrowRight aria-hidden="true" />
              </Link>
              <a
                className="landing-secondary-action"
                href="https://github.com/vinhphat2005/2026-6-02-CV_PortfolioGenerator"
                target="_blank"
                rel="noreferrer"
              >
                <Github aria-hidden="true" /> View Source
              </a>
            </div>
            <p className="landing-privacy"><ShieldCheck aria-hidden="true" /> Your working draft stays in this browser.</p>
          </div>
          <ProductCollage />
        </section>

        <section id="capabilities" className="landing-capabilities" aria-labelledby="capabilities-title">
          <div className="landing-capability-intro">
            <p>One workspace</p>
            <h2 id="capabilities-title">From raw experience to interview-ready evidence.</h2>
          </div>
          <ol>
            {capabilities.map(([number, label]) => (
              <li key={number}>
                <span>{number}</span>
                <strong>{label}</strong>
              </li>
            ))}
          </ol>
        </section>

        <footer className="landing-credit" aria-labelledby="landing-credit-title">
          <h2 id="landing-credit-title">Made by <strong>Phat</strong></h2>
          <span>Local-first CV and portfolio studio for focused job applications.</span>
          <a
            href="https://github.com/vinhphat2005/2026-6-02-CV_PortfolioGenerator"
            target="_blank"
            rel="noreferrer"
          >
            View repository
          </a>
        </footer>
      </main>
    </>
  );
}
