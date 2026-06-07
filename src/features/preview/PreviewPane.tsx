"use client";

import { PortfolioDeckPreview } from "@/features/portfolio/PortfolioDeckPreview";
import type { PreviewMode } from "@/features/app/types";
import type { ProfileDocument } from "@/lib/types";
import { getPortfolioTemplate, getResumeTemplate } from "@/templates/registry";

export function PreviewPane({
  document,
  previewMode,
  setPreviewMode,
  resumeTemplateId,
  portfolioTemplateId
}: {
  document: ProfileDocument;
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  resumeTemplateId: string;
  portfolioTemplateId: string;
}) {
  const ResumeTemplate = getResumeTemplate(resumeTemplateId);
  const PortfolioTemplate = getPortfolioTemplate(portfolioTemplateId);
  return (
    <div className="max-h-screen overflow-auto border-l border-border bg-[#e7ebe3] p-5 max-2xl:max-h-none max-2xl:border-l-0 max-2xl:border-t">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black uppercase tracking-[0.06em]">Live Preview</div>
          <p className="text-xs text-muted-foreground">
            {previewMode === "resume"
              ? "A4 resume preview"
              : previewMode === "portfolio"
                ? "Static website portfolio preview"
                : "Printable multi-page portfolio preview"}
          </p>
        </div>
        <div className="flex rounded-[8px] border border-border bg-white p-1">
          {([
            ["resume", "CV"],
            ["portfolio", "Website"],
            ["deck", "Deck"]
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              className={`rounded-[6px] px-3 py-1 text-xs font-bold ${previewMode === mode ? "bg-primary text-white" : ""}`}
              onClick={() => setPreviewMode(mode)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {previewMode === "resume" ? (
        <div className="resume-preview-scale"><ResumeTemplate document={document} /></div>
      ) : previewMode === "portfolio" ? (
        <div className="rounded-[8px] bg-white shadow-page"><PortfolioTemplate document={document} /></div>
      ) : (
        <PortfolioDeckPreview document={document} />
      )}
    </div>
  );
}
