"use client";

import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { PortfolioDeckPreview } from "@/features/portfolio/PortfolioDeckPreview";
import type { PreviewMode } from "@/features/app/types";
import type { ProfileDocument } from "@/lib/types";
import { getPortfolioTemplate, getResumeTemplate } from "@/templates/registry";
import { ScaledPreview } from "./ScaledPreview";

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
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setFocused(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [focused]);

  const transitionKey = previewMode === "resume"
    ? `resume-${resumeTemplateId}`
    : previewMode === "portfolio"
      ? `website-${portfolioTemplateId}`
      : `deck-${document.portfolio.templateId}-${document.portfolio.primaryColor}-${document.portfolio.secondaryColor}`;

  return (
    <aside
      className={`preview-pane max-h-screen overflow-auto border-l border-border bg-[#e7ebe3] p-5 max-2xl:max-h-none max-2xl:border-l-0 max-2xl:border-t ${focused ? "preview-pane-focused" : ""}`}
      aria-label="Live preview"
    >
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
        <div className="flex flex-wrap justify-end gap-2">
          <div className="flex rounded-[8px] border border-border bg-white p-1" role="group" aria-label="Preview mode">
            {([
              ["resume", "CV"],
              ["portfolio", "Website"],
              ["deck", "Deck"]
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                aria-pressed={previewMode === mode}
                className={`rounded-[6px] px-3 py-1 text-xs font-bold ${previewMode === mode ? "bg-primary text-white" : ""}`}
                onClick={() => setPreviewMode(mode)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="preview-focus-button"
            aria-pressed={focused}
            onClick={() => setFocused((value) => !value)}
          >
            {focused ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
            {focused ? "Back to Editor" : "Focus Preview"}
          </button>
        </div>
      </div>
      {previewMode === "resume" ? (
        <ScaledPreview label="A4 resume preview" transitionKey={transitionKey}>
          <ResumeTemplate document={document} />
        </ScaledPreview>
      ) : previewMode === "portfolio" ? (
        <div className="preview-swap rounded-[8px] bg-white shadow-page" key={transitionKey}>
          <PortfolioTemplate document={document} />
        </div>
      ) : (
        <ScaledPreview label="Printable portfolio deck preview" transitionKey={transitionKey}>
          <PortfolioDeckPreview document={document} />
        </ScaledPreview>
      )}
    </aside>
  );
}
