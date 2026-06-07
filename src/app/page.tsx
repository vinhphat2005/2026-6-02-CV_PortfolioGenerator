"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  Eye,
  FileArchive,
  FileDown,
  FileJson,
  Gauge,
  Github,
  Import,
  LayoutTemplate,
  Plus,
  Save,
  Trash2
} from "lucide-react";
import { defaultProfileDocument, sampleProfiles } from "@/data/sampleProfiles";
import {
  defaultSectionLabels,
  projectCollaborationLabels,
  projectCollaborations,
  roleLabels,
  targetRoles
} from "@/lib/schema";
import { matchJobDescription } from "@/lib/jdMatcher";
import { buildPortfolioZip } from "@/lib/portfolioExport";
import { scoreProfile } from "@/lib/scoring/scoring";
import {
  downloadTextFile,
  exportFileName,
  loadStoredDocumentWithSession,
  parseProfileDocument,
  resetStoredDocument,
  saveStoredDocument,
  serializeProfileDocument
} from "@/lib/storage";
import { MAX_PROFILE_JSON_BYTES } from "@/lib/securityLimits";
import type {
  FontPreset,
  ProfileDocument,
  ProjectCollaboration,
  SectionId,
  TargetRole
} from "@/lib/types";
import {
  getPortfolioTemplate,
  getResumeTemplate,
  portfolioTemplates,
  resumeTemplates
} from "@/templates/registry";

type TabId = "editor" | "templates" | "preview" | "score" | "job";
type RuntimeMode = "checking" | "local" | "hosted";

const sourceRepositoryUrl = "https://github.com/vinhphat2005/2026-6-02-CV_PortfolioGenerator";
const sourceRepositoryLabel = "vinhphat2005/2026-6-02-CV_PortfolioGenerator";
const jsonImportTypes = new Set(["application/json", ""]);

const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "editor", label: "Editor", icon: Save },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "score", label: "Score", icon: Gauge },
  { id: "job", label: "Job Match", icon: BriefcaseBusiness }
];

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

function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "border border-border bg-white text-foreground hover:bg-muted",
    ghost: "text-foreground hover:bg-muted",
    danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
  };
  return (
    <button
      {...props}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-[8px] px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

const inputClass =
  "h-9 w-full rounded-[8px] border border-border bg-white px-3 text-sm outline-none focus:border-primary";
const textareaClass =
  "min-h-24 w-full rounded-[8px] border border-border bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary";

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[8px] border border-border bg-card p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-black uppercase tracking-[0.06em]">{title}</h2>
      {children}
    </section>
  );
}

export default function Home() {
  const [document, setDocument] = useState<ProfileDocument>(() => cloneDocument(defaultProfileDocument));
  const [storageReady, setStorageReady] = useState(false);
  const [autosaveAvailable, setAutosaveAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("editor");
  const [resumeTemplateId, setResumeTemplateId] = useState("classic-sidebar");
  const [portfolioTemplateId, setPortfolioTemplateId] = useState("clean-product-engineer");
  const [previewMode, setPreviewMode] = useState<"resume" | "portfolio">("resume");
  const [jobDescription, setJobDescription] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>("checking");
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [aiReview, setAiReview] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const result = loadStoredDocumentWithSession();
    setAutosaveAvailable(result.autosaveAvailable);
    if (result.document) {
      setDocument(result.document);
    }
    if (!result.autosaveAvailable) {
      setExportStatus("Local autosave unavailable.");
    } else if (result.migrated) {
      setExportStatus("Previous local session restored.");
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const result = saveStoredDocument(document);
    setAutosaveAvailable(result.autosaveAvailable);
    if (!result.autosaveAvailable) {
      setExportStatus("Local autosave unavailable.");
    }
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
  const ResumeTemplate = getResumeTemplate(resumeTemplateId);
  const PortfolioTemplate = getPortfolioTemplate(portfolioTemplateId);

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
    const isJsonFile = file.name.toLowerCase().endsWith(".json") || jsonImportTypes.has(file.type);
    if (!isJsonFile) {
      setExportStatus("Import failed. Choose a JSON file.");
      return;
    }
    if (file.size > MAX_PROFILE_JSON_BYTES) {
      setExportStatus("Import failed. JSON file is larger than 256 KiB.");
      return;
    }
    file
      .text()
      .then((raw) => {
        setDocument(parseProfileDocument(raw));
        setExportStatus("JSON imported into this local session.");
      })
      .catch((error: unknown) => {
        setExportStatus(error instanceof Error ? error.message : "Import failed.");
      });
  }

  function resetLocalSession() {
    const result = resetStoredDocument();
    setDocument(cloneDocument(defaultProfileDocument));
    setAutosaveAvailable(result.autosaveAvailable);
    setStorageReady(true);
    setExportStatus(result.autosaveAvailable ? "Local session reset." : "Local autosave unavailable.");
  }

  function exportJson() {
    try {
      downloadTextFile(exportFileName(document), serializeProfileDocument(document));
      setExportStatus("JSON exported.");
    } catch {
      setExportStatus("Complete required fields before exporting JSON.");
    }
  }

  async function exportPdf() {
    setExportStatus("Preparing PDF...");
    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, templateId: resumeTemplateId })
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "PDF export failed.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `${document.profile.personal.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-resume.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      setExportStatus("PDF exported.");
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : "PDF export failed.");
    }
  }

  async function exportPortfolio() {
    setExportStatus("Building portfolio zip...");
    try {
      const blob = await buildPortfolioZip(document, portfolioTemplateId);
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `${document.profile.personal.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-portfolio.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      setExportStatus("Portfolio zip exported.");
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : "Portfolio export failed.");
    }
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
      if (!response.ok) {
        throw new Error(data.error || "AI review failed.");
      }
      setAiReview(data.review || "No review returned.");
    } catch (error) {
      setAiReview(error instanceof Error ? error.message : "AI review failed.");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="grid min-h-screen grid-cols-[280px_1fr] max-xl:grid-cols-1">
        <aside className="border-r border-border bg-[#f1f3ee] p-4 max-xl:border-b max-xl:border-r-0">
          <div className="mb-5">
            <div className="text-xl font-black tracking-normal">Career Forge</div>
            <p className="mt-1 text-sm text-muted-foreground">Local CV, portfolio, scoring, and JD matching.</p>
          </div>

          <nav className="grid gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex h-10 items-center gap-2 rounded-[8px] px-3 text-left text-sm font-semibold transition ${
                    activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-5 space-y-3">
            <Field label="Sample Profile">
              <select
                className={inputClass}
                value={document.settings.targetRole}
                onChange={(event) => setSample(event.target.value as TargetRole)}
              >
                {targetRoles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </Field>
            <Button
              variant="secondary"
              className="w-full"
              onClick={exportJson}
            >
              <FileJson className="h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => importRef.current?.click()}>
              <Import className="h-4 w-4" />
              Import JSON
            </Button>
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                handleImport(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
            <Button variant="secondary" className="w-full" onClick={exportPdf}>
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="secondary" className="w-full" onClick={exportPortfolio}>
              <FileArchive className="h-4 w-4" />
              Portfolio ZIP
            </Button>
            <Button variant="ghost" className="w-full" onClick={resetLocalSession}>
              <Trash2 className="h-4 w-4" />
              Reset Local Session
            </Button>
            <p className="text-xs text-muted-foreground">
              {autosaveAvailable
                ? "Autosave stays in this browser session only."
                : "Local autosave unavailable."}
            </p>
            {exportStatus && <p className="text-xs text-muted-foreground">{exportStatus}</p>}
          </div>
        </aside>

        <section className="grid grid-cols-[minmax(0,1fr)_minmax(420px,48vw)] gap-0 max-2xl:grid-cols-1">
          <div className="max-h-screen overflow-auto p-5 max-2xl:max-h-none">
            {activeTab === "editor" && (
              <Editor document={document} updateDocument={updateDocument} />
            )}
            {activeTab === "templates" && (
              <TemplatesPanel
                document={document}
                resumeTemplateId={resumeTemplateId}
                portfolioTemplateId={portfolioTemplateId}
                setResumeTemplateId={setResumeTemplateId}
                setPortfolioTemplateId={setPortfolioTemplateId}
                setPreviewMode={setPreviewMode}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === "preview" && (
              <PreviewControls
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                exportPdf={exportPdf}
                exportPortfolio={exportPortfolio}
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
              <JobPanel
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                jobMatch={jobMatch}
              />
            )}
          </div>

          <div className="max-h-screen overflow-auto border-l border-border bg-[#e7ebe3] p-5 max-2xl:max-h-none max-2xl:border-l-0 max-2xl:border-t">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.06em]">Live Preview</div>
                <p className="text-xs text-muted-foreground">
                  {previewMode === "resume" ? "A4 resume preview" : "Static portfolio preview"}
                </p>
              </div>
              <div className="flex rounded-[8px] border border-border bg-white p-1">
                <button
                  className={`rounded-[6px] px-3 py-1 text-xs font-bold ${previewMode === "resume" ? "bg-primary text-white" : ""}`}
                  onClick={() => setPreviewMode("resume")}
                >
                  CV
                </button>
                <button
                  className={`rounded-[6px] px-3 py-1 text-xs font-bold ${previewMode === "portfolio" ? "bg-primary text-white" : ""}`}
                  onClick={() => setPreviewMode("portfolio")}
                >
                  Portfolio
                </button>
              </div>
            </div>
            {previewMode === "resume" ? (
              <div className="resume-preview-scale">
                <ResumeTemplate document={document} />
              </div>
            ) : (
              <div className="rounded-[8px] bg-white shadow-page">
                <PortfolioTemplate document={document} />
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Editor({
  document,
  updateDocument
}: {
  document: ProfileDocument;
  updateDocument: (updater: (draft: ProfileDocument) => void) => void;
}) {
  const { profile, settings } = document;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-normal">Editor</h1>
        <p className="text-sm text-muted-foreground">Edit structured data once, then reuse it across CV and portfolio templates.</p>
      </div>

      <SectionCard title="Personal">
        <div className="grid gap-3 md:grid-cols-2">
          {(["name", "title", "email", "phone", "location", "website", "photoUrl"] as const).map((key) => (
            <Field key={key} label={key}>
              <input
                className={inputClass}
                value={profile.personal[key] || ""}
                onChange={(event) =>
                  updateDocument((draft) => {
                    draft.profile.personal[key] = event.target.value;
                  })
                }
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Summary">
        <textarea
          className={textareaClass}
          value={profile.summary}
          onChange={(event) =>
            updateDocument((draft) => {
              draft.profile.summary = event.target.value;
            })
          }
        />
      </SectionCard>

      <SectionCard title="Settings">
        <div className="grid gap-3 md:grid-cols-5">
          <Field label="Target Role">
            <select
              className={inputClass}
              value={settings.targetRole}
              onChange={(event) =>
                updateDocument((draft) => {
                  draft.settings.targetRole = event.target.value as TargetRole;
                })
              }
            >
              {targetRoles.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Theme">
            <input
              type="color"
              className={`${inputClass} p-1`}
              value={settings.themeColor}
              onChange={(event) =>
                updateDocument((draft) => {
                  draft.settings.themeColor = event.target.value;
                })
              }
            />
          </Field>
          <Field label="Sidebar">
            <input
              type="color"
              className={`${inputClass} p-1`}
              value={settings.sidebarColor}
              onChange={(event) =>
                updateDocument((draft) => {
                  draft.settings.sidebarColor = event.target.value;
                })
              }
            />
          </Field>
          <Field label="Font">
            <select
              className={inputClass}
              value={settings.fontPreset}
              onChange={(event) =>
                updateDocument((draft) => {
                  draft.settings.fontPreset = event.target.value as FontPreset;
                })
              }
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="compact">Compact</option>
              <option value="serif">Serif</option>
            </select>
          </Field>
          <Field label="Language">
            <select
              className={inputClass}
              value={settings.language}
              onChange={(event) =>
                updateDocument((draft) => {
                  draft.settings.language = event.target.value as ProfileDocument["settings"]["language"];
                })
              }
            >
              <option value="en">English</option>
              <option value="vi">Vietnamese</option>
              <option value="custom">Custom</option>
            </select>
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Section Labels And Order">
        <div className="grid gap-2">
          {settings.sectionOrder.map((section, index) => {
            const sectionId = section as SectionId;
            return (
              <div key={section} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
                <input
                  className={inputClass}
                  value={settings.sectionLabels[section] || defaultSectionLabels[sectionId]}
                  onChange={(event) =>
                    updateDocument((draft) => {
                      draft.settings.sectionLabels[section] = event.target.value;
                    })
                  }
                />
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!settings.hiddenSections.includes(section)}
                    onChange={(event) =>
                      updateDocument((draft) => {
                        draft.settings.hiddenSections = event.target.checked
                          ? draft.settings.hiddenSections.filter((item) => item !== section)
                          : [...new Set([...draft.settings.hiddenSections, section])];
                      })
                    }
                  />
                  Show
                </label>
                <Button
                  variant="ghost"
                  disabled={index === 0}
                  onClick={() =>
                    updateDocument((draft) => {
                      const order = draft.settings.sectionOrder;
                      [order[index - 1], order[index]] = [order[index], order[index - 1]];
                    })
                  }
                  title="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  disabled={index === settings.sectionOrder.length - 1}
                  onClick={() =>
                    updateDocument((draft) => {
                      const order = draft.settings.sectionOrder;
                      [order[index + 1], order[index]] = [order[index], order[index + 1]];
                    })
                  }
                  title="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SkillsEditor document={document} updateDocument={updateDocument} />
      <ExperienceEditor document={document} updateDocument={updateDocument} />
      <ProjectsEditor document={document} updateDocument={updateDocument} />
      <EducationEditor document={document} updateDocument={updateDocument} />
    </div>
  );
}

function SkillsEditor({
  document,
  updateDocument
}: {
  document: ProfileDocument;
  updateDocument: (updater: (draft: ProfileDocument) => void) => void;
}) {
  return (
    <SectionCard title="Skills">
      <div className="space-y-3">
        {document.profile.skills.map((group, index) => (
          <div key={`${group.category}-${index}`} className="grid gap-2 rounded-[8px] border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold">{group.category || "Skill Group"}</h3>
              <Button
                variant="danger"
                onClick={() =>
                  updateDocument((draft) => {
                    draft.profile.skills.splice(index, 1);
                  })
                }
                title="Delete skill group"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <input
              className={inputClass}
              value={group.category}
              onChange={(event) =>
                updateDocument((draft) => {
                  draft.profile.skills[index].category = event.target.value;
                })
              }
            />
            <textarea
              className={textareaClass}
              value={group.items.join("\n")}
              onChange={(event) =>
                updateDocument((draft) => {
                  draft.profile.skills[index].items = splitLines(event.target.value);
                })
              }
            />
          </div>
        ))}
        <Button
          variant="secondary"
          onClick={() =>
            updateDocument((draft) => {
              draft.profile.skills.push({ category: "New Category", items: ["New Skill"] });
            })
          }
        >
          <Plus className="h-4 w-4" />
          Add Skill Group
        </Button>
      </div>
    </SectionCard>
  );
}

function ExperienceEditor({
  document,
  updateDocument
}: {
  document: ProfileDocument;
  updateDocument: (updater: (draft: ProfileDocument) => void) => void;
}) {
  function addExperience() {
    updateDocument((draft) => {
      draft.profile.experience.push({
        company: "Company",
        role: "Software Engineer",
        startDate: "2025",
        endDate: "Present",
        current: true,
        technologies: ["TypeScript"],
        highlights: ["Built a feature with clear technical ownership and measurable impact."]
      });
    });
  }

  return (
    <SectionCard title="Experience">
      <div className="space-y-3">
        {document.profile.experience.map((item, index) => (
          <RecordEditor
            key={`${item.company}-${index}`}
            title={`${item.role} at ${item.company}`}
            onDelete={() =>
              updateDocument((draft) => {
                draft.profile.experience.splice(index, 1);
              })
            }
          >
            <div className="grid gap-2 md:grid-cols-2">
              {(["role", "company", "location", "startDate", "endDate"] as const).map((key) => (
                <Field key={key} label={key}>
                  <input
                    className={inputClass}
                    value={item[key] || ""}
                    onChange={(event) =>
                      updateDocument((draft) => {
                        draft.profile.experience[index][key] = event.target.value;
                      })
                    }
                  />
                </Field>
              ))}
            </div>
            <Field label="Technologies">
              <input
                className={inputClass}
                value={item.technologies.join(", ")}
                onChange={(event) =>
                  updateDocument((draft) => {
                    draft.profile.experience[index].technologies = event.target.value
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean);
                  })
                }
              />
            </Field>
            <Field label="Highlights">
              <textarea
                className={textareaClass}
                value={item.highlights.join("\n")}
                onChange={(event) =>
                  updateDocument((draft) => {
                    draft.profile.experience[index].highlights = splitLines(event.target.value);
                  })
                }
              />
            </Field>
          </RecordEditor>
        ))}
        <Button variant="secondary" onClick={addExperience}>
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </div>
    </SectionCard>
  );
}

function ProjectsEditor({
  document,
  updateDocument
}: {
  document: ProfileDocument;
  updateDocument: (updater: (draft: ProfileDocument) => void) => void;
}) {
  function addProject() {
    updateDocument((draft) => {
      draft.profile.projects.push({
        name: "New Project",
        description: "Short description of the problem, solution, and target users.",
        collaboration: "personal",
        technologies: ["TypeScript"],
        highlights: ["Implemented a useful workflow with clear technical decisions."],
        impact: "Explain the result or usefulness."
      });
    });
  }

  return (
    <SectionCard title="Projects">
      <div className="space-y-3">
        {document.profile.projects.map((item, index) => (
          <RecordEditor
            key={`${item.name}-${index}`}
            title={item.name}
            onDelete={() =>
              updateDocument((draft) => {
                draft.profile.projects.splice(index, 1);
              })
            }
          >
            <div className="grid gap-2 md:grid-cols-2">
              <Field label="Project Type">
                <select
                  className={inputClass}
                  value={item.collaboration || "personal"}
                  onChange={(event) =>
                    updateDocument((draft) => {
                      draft.profile.projects[index].collaboration = event.target.value as ProjectCollaboration;
                    })
                  }
                >
                  {projectCollaborations.map((collaboration) => (
                    <option key={collaboration} value={collaboration}>
                      {projectCollaborationLabels[collaboration]}
                    </option>
                  ))}
                </select>
              </Field>
              {(["name", "role", "repo", "demo", "video"] as const).map((key) => (
                <Field key={key} label={key}>
                  <input
                    className={inputClass}
                    value={item[key] || ""}
                    onChange={(event) =>
                      updateDocument((draft) => {
                        draft.profile.projects[index][key] = event.target.value;
                      })
                    }
                  />
                </Field>
              ))}
            </div>
            <Field label="Description">
              <textarea
                className={textareaClass}
                value={item.description}
                onChange={(event) =>
                  updateDocument((draft) => {
                    draft.profile.projects[index].description = event.target.value;
                  })
                }
              />
            </Field>
            <Field label="Technologies">
              <input
                className={inputClass}
                value={item.technologies.join(", ")}
                onChange={(event) =>
                  updateDocument((draft) => {
                    draft.profile.projects[index].technologies = event.target.value
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean);
                  })
                }
              />
            </Field>
            <Field label="Highlights">
              <textarea
                className={textareaClass}
                value={item.highlights.join("\n")}
                onChange={(event) =>
                  updateDocument((draft) => {
                    draft.profile.projects[index].highlights = splitLines(event.target.value);
                  })
                }
              />
            </Field>
            <Field label="Impact">
              <input
                className={inputClass}
                value={item.impact || ""}
                onChange={(event) =>
                  updateDocument((draft) => {
                    draft.profile.projects[index].impact = event.target.value;
                  })
                }
              />
            </Field>
          </RecordEditor>
        ))}
        <Button variant="secondary" onClick={addProject}>
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>
    </SectionCard>
  );
}

function EducationEditor({
  document,
  updateDocument
}: {
  document: ProfileDocument;
  updateDocument: (updater: (draft: ProfileDocument) => void) => void;
}) {
  function addEducation() {
    updateDocument((draft) => {
      draft.profile.education.push({
        school: "School",
        degree: "Degree",
        location: "",
        startDate: "",
        endDate: "",
        gpa: "",
        highlights: ["Relevant coursework, honors, or academic achievements."]
      });
    });
  }

  return (
    <SectionCard title="Education">
      <div className="space-y-3">
        {document.profile.education.map((item, index) => (
          <RecordEditor
            key={`${item.school}-${index}`}
            title={item.school}
            onDelete={() =>
              updateDocument((draft) => {
                draft.profile.education.splice(index, 1);
              })
            }
          >
            <div className="grid gap-2 md:grid-cols-2">
              {(["school", "degree", "location", "startDate", "endDate", "gpa"] as const).map((key) => (
                <Field
                  key={key}
                  label={key === "gpa" ? "GPA / Result" : key}
                  hint={key === "gpa" ? "Examples: GPA 3.8 / 4.0, 8.5 / 10, First Class Honors, Distinction." : undefined}
                >
                  <input
                    className={inputClass}
                    placeholder={key === "gpa" ? "GPA 3.8 / 4.0, 8.5 / 10, First Class Honors" : undefined}
                    value={item[key] || ""}
                    onChange={(event) =>
                      updateDocument((draft) => {
                        draft.profile.education[index][key] = event.target.value;
                      })
                    }
                  />
                </Field>
              ))}
            </div>
            <Field label="Highlights">
              <textarea
                className={textareaClass}
                value={item.highlights.join("\n")}
                onChange={(event) =>
                  updateDocument((draft) => {
                    draft.profile.education[index].highlights = splitLines(event.target.value);
                  })
                }
              />
            </Field>
          </RecordEditor>
        ))}
        <Button variant="secondary" onClick={addEducation}>
          <Plus className="h-4 w-4" />
          Add Education
        </Button>
      </div>
    </SectionCard>
  );
}

function RecordEditor({
  title,
  onDelete,
  children
}: {
  title: string;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[8px] border border-border bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-bold">{title}</h3>
        <Button variant="danger" onClick={onDelete} title="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function TemplatesPanel({
  document,
  resumeTemplateId,
  portfolioTemplateId,
  setResumeTemplateId,
  setPortfolioTemplateId,
  setPreviewMode,
  setActiveTab
}: {
  document: ProfileDocument;
  resumeTemplateId: string;
  portfolioTemplateId: string;
  setResumeTemplateId: (id: string) => void;
  setPortfolioTemplateId: (id: string) => void;
  setPreviewMode: (mode: "resume" | "portfolio") => void;
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
      <SectionCard title="Portfolio Templates">
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
      <Button onClick={() => setActiveTab("preview")}>
        <Eye className="h-4 w-4" />
        Open Preview
      </Button>
    </div>
  );
}

function PreviewControls({
  previewMode,
  setPreviewMode,
  exportPdf,
  exportPortfolio
}: {
  previewMode: "resume" | "portfolio";
  setPreviewMode: (mode: "resume" | "portfolio") => void;
  exportPdf: () => void;
  exportPortfolio: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-normal">Preview</h1>
        <p className="text-sm text-muted-foreground">Check the selected CV or portfolio before exporting.</p>
      </div>
      <SectionCard title="Preview Mode">
        <div className="flex flex-wrap gap-2">
          <Button variant={previewMode === "resume" ? "primary" : "secondary"} onClick={() => setPreviewMode("resume")}>
            CV
          </Button>
          <Button variant={previewMode === "portfolio" ? "primary" : "secondary"} onClick={() => setPreviewMode("portfolio")}>
            Portfolio
          </Button>
          <Button variant="secondary" onClick={exportPdf}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="secondary" onClick={exportPortfolio}>
            <Download className="h-4 w-4" />
            Download Portfolio ZIP
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function ScorePanel({
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
                <span>
                  {group.score}/{group.max}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.min(100, (group.score / group.max) * 100)}%` }}
                />
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
            {score.warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
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

function JobPanel({
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
              {jobMatch.recommendedProjectOrder.map((project) => (
                <li key={project}>{project}</li>
              ))}
            </ol>
          </SectionCard>
          <SectionCard title="Suggestions">
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {jobMatch.suggestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
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
          <span key={keyword} className="rounded-full border border-border bg-white px-2 py-1 text-xs font-bold">
            {keyword}
          </span>
        ))}
        {keywords.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
      </div>
    </SectionCard>
  );
}
