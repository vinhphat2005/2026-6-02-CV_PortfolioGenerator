"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { defaultProfileDocument, sampleProfiles } from "@/data/sampleProfiles";
import { ProfileEditor } from "@/features/editor/ProfileEditor";
import { PortfolioDeckEditor } from "@/features/portfolio/PortfolioDeckEditor";
import { portfolioAssetDataUrls } from "@/features/portfolio/usePortfolioAssets";
import { PreviewPane } from "@/features/preview/PreviewPane";
import {
  JobPanel,
  PreviewControls,
  ScorePanel,
  TemplatesPanel
} from "@/features/workspace/WorkspacePanels";
import { matchJobDescription } from "@/lib/jdMatcher";
import { clearPortfolioImages } from "@/lib/portfolioAssets";
import { getCurrentLocalSessionId } from "@/lib/localSession";
import { buildPortfolioZip } from "@/lib/portfolioExport";
import { scoreProfile } from "@/lib/scoring/scoring";
import { MAX_PORTFOLIO_PDF_BYTES, MAX_PROFILE_JSON_BYTES } from "@/lib/securityLimits";
import {
  downloadTextFile,
  exportFileName,
  loadStoredDocumentWithSession,
  parseProfileDocument,
  resetStoredDocument,
  saveStoredDocument,
  serializeProfileDocument,
  downloadBlobFile
} from "@/lib/storage";
import type { ProfileDocument, TargetRole } from "@/lib/types";
import { getPortfolioDeckTemplateMeta } from "@/templates/registry";
import { AppSidebar } from "./AppSidebar";
import type { PreviewMode, RuntimeMode, TabId } from "./types";

const jsonImportTypes = new Set(["application/json", ""]);
type ExportKind = "json" | "cv" | "portfolio" | "website";

function cloneDocument(document: ProfileDocument): ProfileDocument {
  return JSON.parse(JSON.stringify(document)) as ProfileDocument;
}

function isLocalRuntimeHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function personSlug(document: ProfileDocument) {
  return document.profile.personal.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "profile";
}

export function CareerForgeApp() {
  const [document, setDocument] = useState<ProfileDocument>(() => cloneDocument(defaultProfileDocument));
  const [storageReady, setStorageReady] = useState(false);
  const [autosaveAvailable, setAutosaveAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("editor");
  const [resumeTemplateId, setResumeTemplateId] = useState("classic-sidebar");
  const [portfolioTemplateId, setPortfolioTemplateId] = useState("clean-product-engineer");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("resume");
  const [jobDescription, setJobDescription] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [exportBusy, setExportBusy] = useState<ExportKind | null>(null);
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>("checking");
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [aiReview, setAiReview] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exportLockRef = useRef(false);

  useEffect(() => {
    const result = loadStoredDocumentWithSession();
    setAutosaveAvailable(result.autosaveAvailable);
    if (result.document) setDocument(result.document);
    if (!result.autosaveAvailable) setExportStatus("Local autosave unavailable.");
    else if (result.migrated) setExportStatus("Previous local session restored.");
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      const result = saveStoredDocument(document);
      setAutosaveAvailable(result.autosaveAvailable);
      if (!result.autosaveAvailable) setExportStatus("Local autosave unavailable.");
    }, 500);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [document, storageReady]);

  useEffect(() => {
    if (!isLocalRuntimeHost(window.location.hostname)) {
      setRuntimeMode("hosted");
      setOllamaAvailable(false);
      return;
    }
    setRuntimeMode("local");
    fetch("/api/ollama/status")
      .then((response) => response.json())
      .then((data: { available?: boolean }) => setOllamaAvailable(Boolean(data.available)))
      .catch(() => setOllamaAvailable(false));
  }, []);

  const score = useMemo(() => scoreProfile(document, jobDescription), [document, jobDescription]);
  const jobMatch = useMemo(
    () => (jobDescription.trim() ? matchJobDescription(document, jobDescription) : null),
    [document, jobDescription]
  );

  function updateDocument(updater: (draft: ProfileDocument) => void) {
    setDocument((current) => {
      const next = cloneDocument(current);
      updater(next);
      return next;
    });
  }

  function setSample(role: TargetRole) {
    setDocument(cloneDocument(sampleProfiles[role]));
  }

  function handleImport(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json") && !jsonImportTypes.has(file.type)) {
      setExportStatus("Import failed. Choose a JSON file.");
      return;
    }
    if (file.size > MAX_PROFILE_JSON_BYTES) {
      setExportStatus("Import failed. JSON file is larger than 256 KiB.");
      return;
    }
    file.text()
      .then((raw) => {
        setDocument(parseProfileDocument(raw));
        setExportStatus("JSON imported into this local session.");
      })
      .catch((error: unknown) => {
        setExportStatus(error instanceof Error ? error.message : "Import failed.");
      });
  }

  function resetLocalSession() {
    const previousSessionId = getCurrentLocalSessionId();
    const result = resetStoredDocument();
    if (previousSessionId) {
      void clearPortfolioImages(previousSessionId)
        .catch(() => setExportStatus("Local session reset, but local image cleanup failed."));
    }
    setDocument(cloneDocument(defaultProfileDocument));
    setAutosaveAvailable(result.autosaveAvailable);
    setStorageReady(true);
    setExportStatus(result.autosaveAvailable ? "Local session reset." : "Local autosave unavailable.");
  }

  async function runExport(kind: ExportKind, task: () => Promise<void> | void) {
    if (exportLockRef.current) return;
    exportLockRef.current = true;
    setExportBusy(kind);
    try {
      await task();
    } finally {
      exportLockRef.current = false;
      setExportBusy(null);
    }
  }

  function exportJson() {
    void runExport("json", () => {
      setExportStatus("Preparing JSON export...");
      try {
        downloadTextFile(exportFileName(document), serializeProfileDocument(document));
        setExportStatus("JSON exported.");
      } catch {
        setExportStatus("Complete required fields before exporting JSON.");
      }
    });
  }

  async function responseErrorMessage(response: Response, fallback: string) {
    const contentType = response.headers.get("content-type") || "";
    try {
      if (contentType.includes("application/json")) {
        const data = (await response.json()) as { error?: string };
        return data.error || fallback;
      }
      const text = await response.text();
      return text.trim() ? text.trim().slice(0, 240) : fallback;
    } catch {
      return fallback;
    }
  }

  async function postPdf(path: string, body: string, filename: string, pendingMessage: string) {
    setExportStatus(pendingMessage);
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });
    if (!response.ok) {
      throw new Error(await responseErrorMessage(response, "PDF export failed."));
    }
    downloadBlobFile(filename, await response.blob());
  }

  async function exportPdf() {
    void runExport("cv", async () => {
      try {
        await postPdf(
          "/api/export/pdf",
          JSON.stringify({ document, templateId: resumeTemplateId }),
          `${personSlug(document)}-resume.pdf`,
          "Preparing CV PDF..."
        );
        setExportStatus("CV PDF exported.");
      } catch (error) {
        setExportStatus(error instanceof Error ? error.message : "PDF export failed.");
      }
    });
  }

  async function exportWebsitePortfolio() {
    void runExport("website", async () => {
      setExportStatus("Building website zip...");
      try {
        downloadBlobFile(`${personSlug(document)}-portfolio.zip`, await buildPortfolioZip(document, portfolioTemplateId));
        setExportStatus("Website zip exported.");
      } catch (error) {
        setExportStatus(error instanceof Error ? error.message : "Website export failed.");
      }
    });
  }

  async function exportPortfolioDeckPdf() {
    void runExport("portfolio", async () => {
      try {
        const assets = await portfolioAssetDataUrls(document.portfolio);
        const body = JSON.stringify({ document, assets });
        if (new TextEncoder().encode(body).byteLength > MAX_PORTFOLIO_PDF_BYTES) {
          throw new Error("Portfolio PDF payload is larger than 6 MB. Remove some local images.");
        }
        await postPdf(
          "/api/export/portfolio-pdf",
          body,
          `${personSlug(document)}-portfolio-deck.pdf`,
          "Preparing portfolio deck PDF..."
        );
        setExportStatus("Portfolio deck PDF exported.");
      } catch (error) {
        setExportStatus(error instanceof Error ? error.message : "Portfolio PDF export failed.");
      }
    });
  }

  async function requestAiReview() {
    if (runtimeMode !== "local") {
      setAiReview("AI review is available when running this project locally with your own Ollama server.");
      return;
    }
    setAiBusy(true);
    setAiReview("");
    try {
      const response = await fetch("/api/ollama/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, jobDescription })
      });
      const data = (await response.json()) as { review?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "AI review failed.");
      setAiReview(data.review || "No review returned.");
    } catch (error) {
      setAiReview(error instanceof Error ? error.message : "AI review failed.");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <>
    <a className="skip-link" href="#studio-workspace">Skip to studio workspace</a>
    <main className="min-h-screen">
      <div className="grid min-h-screen grid-cols-[280px_1fr] max-xl:grid-cols-1">
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          targetRole={document.settings.targetRole}
          setSample={setSample}
          exportJson={exportJson}
          importRef={importRef}
          handleImport={handleImport}
          exportPdf={exportPdf}
          exportPortfolioDeckPdf={exportPortfolioDeckPdf}
          exportWebsitePortfolio={exportWebsitePortfolio}
          resetLocalSession={resetLocalSession}
          autosaveAvailable={autosaveAvailable}
          exportStatus={exportStatus}
          exportBusy={exportBusy}
        />
        <section id="studio-workspace" className="grid grid-cols-[minmax(360px,1fr)_minmax(520px,55vw)] gap-0 max-2xl:grid-cols-1">
          <div className="studio-panel max-h-screen overflow-auto p-5 max-2xl:max-h-none" key={activeTab}>
            {activeTab === "editor" && <ProfileEditor document={document} updateDocument={updateDocument} />}
            {activeTab === "portfolio" && (
              <PortfolioDeckEditor document={document} updateDocument={updateDocument} onStatus={setExportStatus} />
            )}
            {activeTab === "templates" && (
              <TemplatesPanel
                document={document}
                resumeTemplateId={resumeTemplateId}
                portfolioTemplateId={portfolioTemplateId}
                setResumeTemplateId={setResumeTemplateId}
                setPortfolioTemplateId={setPortfolioTemplateId}
                setDeckTemplate={(templateId) => updateDocument((draft) => {
                  const template = getPortfolioDeckTemplateMeta(templateId);
                  draft.portfolio.templateId = templateId;
                  draft.portfolio.primaryColor = template.palette.primary;
                  draft.portfolio.secondaryColor = template.palette.secondary;
                })}
                setPreviewMode={setPreviewMode}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === "preview" && (
              <PreviewControls
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                exportPdf={exportPdf}
                exportWebsitePortfolio={exportWebsitePortfolio}
                exportPortfolioDeckPdf={exportPortfolioDeckPdf}
                exportBusy={exportBusy}
              />
            )}
            {activeTab === "score" && (
              <ScorePanel
                score={score}
                runtimeMode={runtimeMode}
                ollamaAvailable={ollamaAvailable}
                requestAiReview={requestAiReview}
                aiBusy={aiBusy}
                aiReview={aiReview}
              />
            )}
            {activeTab === "job" && (
              <JobPanel jobDescription={jobDescription} setJobDescription={setJobDescription} jobMatch={jobMatch} />
            )}
          </div>
          <PreviewPane
            document={document}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            resumeTemplateId={resumeTemplateId}
            portfolioTemplateId={portfolioTemplateId}
          />
        </section>
      </div>
    </main>
    </>
  );
}
