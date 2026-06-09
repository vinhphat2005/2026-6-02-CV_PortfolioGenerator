"use client";

import { Bot, CheckCircle2, Download, Eye, Github } from "lucide-react";
import { Button, SectionCard } from "@/components/ui/forms";
import { DeckTemplateMiniature } from "@/features/portfolio/DeckTemplateMiniature";
import { matchJobDescription } from "@/lib/jdMatcher";
import { scoreProfile } from "@/lib/scoring/scoring";
import { MAX_JOB_DESCRIPTION_CHARS } from "@/lib/securityLimits";
import type { ProfileDocument } from "@/lib/types";
import { portfolioDeckTemplates, portfolioTemplates, resumeTemplates } from "@/templates/registry";
import type { PreviewMode, RuntimeMode, TabId } from "@/features/app/types";

const sourceRepositoryUrl = "https://github.com/vinhphat2005/2026-6-02-CV_PortfolioGenerator";
const sourceRepositoryLabel = "vinhphat2005/2026-6-02-CV_PortfolioGenerator";
export function TemplatesPanel({
  document,
  resumeTemplateId,
  portfolioTemplateId,
  setResumeTemplateId,
  setPortfolioTemplateId,
  setDeckTemplate,
  setPreviewMode,
  setActiveTab
}: {
  document: ProfileDocument;
  resumeTemplateId: string;
  portfolioTemplateId: string;
  setResumeTemplateId: (id: string) => void;
  setPortfolioTemplateId: (id: string) => void;
  setDeckTemplate: (id: ProfileDocument["portfolio"]["templateId"]) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setActiveTab: (tab: TabId) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-normal">Templates</h1>
        <p className="text-sm text-muted-foreground">Choose a look without changing your structured profile data.</p>
      </div>
      <SectionCard title="Resume Templates">
        <div className="grid gap-3 md:grid-cols-2">
          {resumeTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setResumeTemplateId(template.id);
                setPreviewMode("resume");
              }}
              className={`rounded-[8px] border p-4 text-left transition hover:bg-muted ${
                resumeTemplateId === template.id ? "border-primary bg-muted" : "border-border bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold">{template.name}</h3>
                {template.recommendedFor.includes(document.settings.targetRole) && (
                  <span className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-white">Recommended</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                {template.atsFriendly ? "ATS friendly" : "Visual format"} / {template.supportsPhoto ? "Photo" : "No photo"}
              </p>
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Website Portfolio Templates">
        <div className="grid gap-3 md:grid-cols-2">
          {portfolioTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setPortfolioTemplateId(template.id);
                setPreviewMode("portfolio");
              }}
              className={`rounded-[8px] border p-4 text-left transition hover:bg-muted ${
                portfolioTemplateId === template.id ? "border-primary bg-muted" : "border-border bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold">{template.name}</h3>
                {template.recommendedFor.includes(document.settings.targetRole) && (
                  <span className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-white">Recommended</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Printable Deck Templates">
        <div className="grid gap-3 md:grid-cols-2">
          {portfolioDeckTemplates.map((template) => (
            <button
              key={template.id}
              aria-pressed={document.portfolio.templateId === template.id}
              onClick={() => {
                setDeckTemplate(template.id as ProfileDocument["portfolio"]["templateId"]);
                setPreviewMode("deck");
              }}
              className={`template-card rounded-[8px] border p-4 text-left transition hover:bg-muted ${
                document.portfolio.templateId === template.id ? "border-primary bg-muted" : "border-border bg-white"
              }`}
            >
              <DeckTemplateMiniature template={template} />
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold">{template.name}</h3>
                {template.recommendedFor.includes(document.settings.targetRole) && (
                  <span className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-white">Recommended</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
            </button>
          ))}
        </div>
      </SectionCard>
      <Button onClick={() => setActiveTab("preview")}>
        <Eye className="h-4 w-4" />
        Open Preview
      </Button>
    </div>
  );
}

export function PreviewControls({
  previewMode,
  setPreviewMode,
  exportPdf,
  exportWebsitePortfolio,
  exportPortfolioDeckPdf,
  exportBusy
}: {
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  exportPdf: () => void;
  exportWebsitePortfolio: () => void;
  exportPortfolioDeckPdf: () => void;
  exportBusy: string | null;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-normal">Preview</h1>
        <p className="text-sm text-muted-foreground">Check the selected output before exporting.</p>
      </div>
      <SectionCard title="Preview Mode">
        <div className="flex flex-wrap gap-2">
          <Button variant={previewMode === "resume" ? "primary" : "secondary"} onClick={() => setPreviewMode("resume")}>CV</Button>
          <Button variant={previewMode === "portfolio" ? "primary" : "secondary"} onClick={() => setPreviewMode("portfolio")}>Website</Button>
          <Button variant={previewMode === "deck" ? "primary" : "secondary"} onClick={() => setPreviewMode("deck")}>Portfolio Deck</Button>
          <Button variant="secondary" disabled={Boolean(exportBusy)} onClick={exportPdf}>
            <Download className="h-4 w-4" />
            {exportBusy === "cv" ? "Exporting CV..." : "Download CV PDF"}
          </Button>
          <Button variant="secondary" disabled={Boolean(exportBusy)} onClick={exportPortfolioDeckPdf}>
            <Download className="h-4 w-4" />
            {exportBusy === "portfolio" ? "Exporting Portfolio..." : "Download Portfolio PDF"}
          </Button>
          <Button variant="secondary" disabled={Boolean(exportBusy)} onClick={exportWebsitePortfolio}>
            <Download className="h-4 w-4" />
            {exportBusy === "website" ? "Building ZIP..." : "Download Website ZIP"}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

export function ScorePanel({
  score,
  runtimeMode,
  ollamaAvailable,
  requestAiReview,
  aiBusy,
  aiReview
}: {
  score: ReturnType<typeof scoreProfile>;
  runtimeMode: RuntimeMode;
  ollamaAvailable: boolean;
  requestAiReview: () => void;
  aiBusy: boolean;
  aiReview: string;
}) {
  const isHostedDemo = runtimeMode === "hosted";
  const isCheckingRuntime = runtimeMode === "checking";
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-normal">Score</h1>
        <p className="text-sm text-muted-foreground">Rule-based review tuned to the selected target role.</p>
      </div>
      <SectionCard title="Overall">
        <div className="flex items-end gap-3">
          <div className="text-6xl font-black tracking-normal">{score.total}</div>
          <div className="pb-2 text-sm font-bold text-muted-foreground">/ 100</div>
        </div>
        <div className="mt-4 grid gap-2">
          {score.groups.filter((group) => group.max > 0).map((group) => (
            <div key={group.id}>
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span>{group.label}</span>
                <span>{group.score}/{group.max}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (group.score / group.max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Suggestions">
        <ul className="space-y-2 text-sm">
          {score.suggestions.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <span>{item}</span>
            </li>
          ))}
          {score.suggestions.length === 0 && <li>No major issues detected.</li>}
        </ul>
      </SectionCard>
      {score.warnings.length > 0 && (
        <SectionCard title="Warnings">
          <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
            {score.warnings.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </SectionCard>
      )}
      <SectionCard title="Optional Local AI">
        <div className="flex items-start justify-between gap-3 max-sm:flex-col">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {isHostedDemo
                ? "AI review is disabled on this hosted demo because Ollama needs a private local/server runtime. The web version stays stable with rule-based scoring and JD matching."
                : isCheckingRuntime
                  ? "Checking whether this local session can reach Ollama..."
                  : ollamaAvailable
                    ? "Ollama is available locally. AI review stays on this machine."
                    : "Ollama is not detected. Rule-based scoring is still fully available."}
            </p>
            {isHostedDemo && (
              <a
                href={sourceRepositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-border bg-white px-3 py-2 text-sm font-bold text-foreground transition hover:bg-muted"
              >
                <Github className="h-4 w-4" />
                <span>{sourceRepositoryLabel}</span>
              </a>
            )}
          </div>
          {!isHostedDemo && (
            <Button disabled={isCheckingRuntime || !ollamaAvailable || aiBusy} onClick={requestAiReview}>
              <Bot className="h-4 w-4" />
              {aiBusy ? "Reviewing..." : "AI Review"}
            </Button>
          )}
        </div>
        {aiReview && <pre className="mt-3 whitespace-pre-wrap rounded-[8px] bg-muted p-3 text-sm">{aiReview}</pre>}
      </SectionCard>
    </div>
  );
}

export function JobPanel({
  jobDescription,
  setJobDescription,
  jobMatch
}: {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  jobMatch: ReturnType<typeof matchJobDescription> | null;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-normal">Job Match</h1>
        <p className="text-sm text-muted-foreground">Paste a JD to compare required keywords with your current CV.</p>
      </div>
      <SectionCard title="Job Description">
        <textarea
          className="min-h-56 w-full rounded-[8px] border border-border bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary"
          maxLength={MAX_JOB_DESCRIPTION_CHARS}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste a job description with requirements like React, TypeScript, REST API, Docker, MongoDB..."
        />
      </SectionCard>
      {jobMatch && (
        <>
          <SectionCard title="Match Score">
            <div className="text-5xl font-black tracking-normal">{jobMatch.matchScore}%</div>
          </SectionCard>
          <KeywordList title="Matched Keywords" keywords={jobMatch.matchedKeywords} />
          <KeywordList title="Missing Keywords" keywords={jobMatch.missingKeywords} />
          <KeywordList title="Weak Matches" keywords={jobMatch.weakMatches} />
          <SectionCard title="Recommended Project Order">
            <ol className="list-decimal space-y-1 pl-4 text-sm">
              {jobMatch.recommendedProjectOrder.map((project) => <li key={project}>{project}</li>)}
            </ol>
          </SectionCard>
          <SectionCard title="Suggestions">
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {jobMatch.suggestions.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </SectionCard>
        </>
      )}
    </div>
  );
}

function KeywordList({ title, keywords }: { title: string; keywords: string[] }) {
  return (
    <SectionCard title={title}>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <span key={keyword} className="rounded-full border border-border bg-white px-2 py-1 text-xs font-bold">{keyword}</span>
        ))}
        {keywords.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
      </div>
    </SectionCard>
  );
}
