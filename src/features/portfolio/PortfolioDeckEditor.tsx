"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  Button,
  Field,
  inputClass,
  RecordEditor,
  SectionCard,
  splitLines,
  textareaClass
} from "@/components/ui/forms";
import { deletePortfolioImage, storePortfolioImage } from "@/lib/portfolioAssets";
import { caseStudyFromProject } from "@/lib/portfolioModel";
import type { PortfolioCaseStudy, PortfolioImageRef, ProfileDocument } from "@/lib/types";

type PortfolioDeckEditorProps = {
  document: ProfileDocument;
  updateDocument: (updater: (draft: ProfileDocument) => void) => void;
  onStatus: (message: string) => void;
};

function commaList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseMetrics(value: string) {
  return splitLines(value).map((line) => {
    const [valuePart, ...labelParts] = line.split("|");
    return {
      value: valuePart.trim(),
      label: labelParts.join("|").trim() || "Result"
    };
  });
}

function parseLinks(value: string) {
  return splitLines(value).map((line) => {
    const [labelPart, ...urlParts] = line.split("|");
    return {
      label: labelPart.trim() || "Link",
      url: urlParts.join("|").trim()
    };
  });
}

function createCaseStudy(index: number): PortfolioCaseStudy {
  return {
    id: `case-study-${Date.now().toString(36)}-${index}`,
    title: "New Case Study",
    subtitle: "A concise description of the project and its value.",
    role: "Software Engineer",
    context: "Personal project",
    year: new Date().getFullYear().toString(),
    challenge: "Describe the user or business problem that made this project necessary.",
    goals: ["Define a measurable project goal."],
    process: ["Research", "Design", "Build", "Validate"],
    solution: "Explain the solution, key decisions, and important tradeoffs.",
    deliverables: ["Working product"],
    outcomes: ["Describe the result and what you learned."],
    metrics: [],
    tools: ["TypeScript"],
    gallery: [],
    links: [],
    includeInDeck: true
  };
}

async function removeAsset(image: PortfolioImageRef | undefined) {
  if (image?.kind === "asset") {
    await deletePortfolioImage(image.assetId);
  }
}

function GalleryUrlInput({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState("");
  return (
    <div className="flex gap-2">
      <input
        className={inputClass}
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://example.com/project-screen.webp"
      />
      <Button
        variant="secondary"
        disabled={!url.trim()}
        onClick={() => {
          onAdd(url.trim());
          setUrl("");
        }}
      >
        <Plus className="h-4 w-4" />
        URL
      </Button>
    </div>
  );
}

export function PortfolioDeckEditor({
  document,
  updateDocument,
  onStatus
}: PortfolioDeckEditorProps) {
  const { portfolio } = document;

  function generateFromResumeProjects() {
    let added = 0;
    updateDocument((draft) => {
      const existingNames = new Set(draft.portfolio.caseStudies.map((study) => study.title.toLowerCase()));
      draft.profile.projects.forEach((project, index) => {
        if (!existingNames.has(project.name.toLowerCase())) {
          draft.portfolio.caseStudies.push(caseStudyFromProject(project, index));
          existingNames.add(project.name.toLowerCase());
          added += 1;
        }
      });
    });
    onStatus(added > 0 ? `Generated ${added} case studies from resume projects.` : "Resume projects are already included.");
  }

  async function uploadImage(file: File | undefined, onStored: (image: PortfolioImageRef) => void) {
    if (!file) return;
    onStatus("Optimizing image for the local portfolio library...");
    try {
      const assetId = await storePortfolioImage(file);
      onStored({ kind: "asset", assetId, alt: file.name.replace(/\.[^.]+$/, "") });
      onStatus("Image stored in this browser session.");
    } catch (error) {
      onStatus(error instanceof Error ? error.message : "Image upload failed.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 max-sm:flex-col">
        <div>
          <h1 className="text-2xl font-black tracking-normal">Portfolio Deck</h1>
          <p className="text-sm text-muted-foreground">
            Build a printable case-study portfolio. Local images stay in this browser and are not embedded in JSON.
          </p>
        </div>
        <Button variant="secondary" onClick={generateFromResumeProjects}>
          <RefreshCw className="h-4 w-4" />
          Generate From Resume
        </Button>
      </div>

      <SectionCard title="Deck Basics">
        <div className="grid gap-3 md:grid-cols-2">
          {(["title", "subtitle", "year", "audience"] as const).map((key) => (
            <Field key={key} label={key}>
              <input
                className={inputClass}
                value={portfolio[key]}
                onChange={(event) => updateDocument((draft) => { draft.portfolio[key] = event.target.value; })}
              />
            </Field>
          ))}
        </div>
        <div className="mt-3 grid gap-3">
          <Field label="Intro / About">
            <textarea
              className={textareaClass}
              value={portfolio.intro}
              onChange={(event) => updateDocument((draft) => { draft.portfolio.intro = event.target.value; })}
            />
          </Field>
          <Field label="Capabilities" hint="Comma-separated services, strengths, or capabilities.">
            <input
              className={inputClass}
              value={portfolio.capabilities.join(", ")}
              onChange={(event) => updateDocument((draft) => {
                draft.portfolio.capabilities = commaList(event.target.value);
              })}
            />
          </Field>
          <Field label="Contact CTA">
            <textarea
              className={textareaClass}
              value={portfolio.contactCta}
              onChange={(event) => updateDocument((draft) => { draft.portfolio.contactCta = event.target.value; })}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Case Studies">
        <div className="space-y-3">
          {portfolio.caseStudies.map((study, index) => (
            <RecordEditor
              key={study.id}
              title={study.title}
              onDelete={() => updateDocument((draft) => { draft.portfolio.caseStudies.splice(index, 1); })}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={study.includeInDeck}
                    onChange={(event) => updateDocument((draft) => {
                      draft.portfolio.caseStudies[index].includeInDeck = event.target.checked;
                    })}
                  />
                  Include in printable deck
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    disabled={index === 0}
                    title="Move case study up"
                    onClick={() => updateDocument((draft) => {
                      const items = draft.portfolio.caseStudies;
                      [items[index - 1], items[index]] = [items[index], items[index - 1]];
                    })}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={index === portfolio.caseStudies.length - 1}
                    title="Move case study down"
                    onClick={() => updateDocument((draft) => {
                      const items = draft.portfolio.caseStudies;
                      [items[index + 1], items[index]] = [items[index], items[index + 1]];
                    })}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {(["title", "subtitle", "role", "context", "year"] as const).map((key) => (
                  <Field key={key} label={key}>
                    <input
                      className={inputClass}
                      value={study[key] || ""}
                      onChange={(event) => updateDocument((draft) => {
                        draft.portfolio.caseStudies[index][key] = event.target.value;
                      })}
                    />
                  </Field>
                ))}
              </div>

              {(["challenge", "solution"] as const).map((key) => (
                <Field key={key} label={key}>
                  <textarea
                    className={textareaClass}
                    value={study[key]}
                    onChange={(event) => updateDocument((draft) => {
                      draft.portfolio.caseStudies[index][key] = event.target.value;
                    })}
                  />
                </Field>
              ))}

              <div className="grid gap-3 md:grid-cols-2">
                {(["goals", "process", "outcomes"] as const).map((key) => (
                  <Field key={key} label={key} hint="One item per line.">
                    <textarea
                      className={textareaClass}
                      value={study[key].join("\n")}
                      onChange={(event) => updateDocument((draft) => {
                        draft.portfolio.caseStudies[index][key] = splitLines(event.target.value);
                      })}
                    />
                  </Field>
                ))}
                <Field label="Metrics" hint="One per line: value | label">
                  <textarea
                    className={textareaClass}
                    value={study.metrics.map((metric) => `${metric.value} | ${metric.label}`).join("\n")}
                    onChange={(event) => updateDocument((draft) => {
                      draft.portfolio.caseStudies[index].metrics = parseMetrics(event.target.value);
                    })}
                  />
                </Field>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Deliverables" hint="Comma-separated.">
                  <input
                    className={inputClass}
                    value={study.deliverables.join(", ")}
                    onChange={(event) => updateDocument((draft) => {
                      draft.portfolio.caseStudies[index].deliverables = commaList(event.target.value);
                    })}
                  />
                </Field>
                <Field label="Tools" hint="Comma-separated.">
                  <input
                    className={inputClass}
                    value={study.tools.join(", ")}
                    onChange={(event) => updateDocument((draft) => {
                      draft.portfolio.caseStudies[index].tools = commaList(event.target.value);
                    })}
                  />
                </Field>
              </div>

              <Field label="Links" hint="One per line: label | https://example.com">
                <textarea
                  className={textareaClass}
                  value={study.links.map((link) => `${link.label} | ${link.url}`).join("\n")}
                  onChange={(event) => updateDocument((draft) => {
                    draft.portfolio.caseStudies[index].links = parseLinks(event.target.value);
                  })}
                />
              </Field>

              <div className="rounded-[8px] border border-border bg-muted p-3">
                <h4 className="mb-3 text-xs font-black uppercase tracking-[0.06em]">Cover Image</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="HTTPS Image URL">
                    <input
                      className={inputClass}
                      value={study.coverImage?.kind === "url" ? study.coverImage.url : ""}
                      onChange={(event) => updateDocument((draft) => {
                        const value = event.target.value;
                        draft.portfolio.caseStudies[index].coverImage = value
                          ? { kind: "url", url: value, alt: study.coverImage?.alt || study.title }
                          : undefined;
                      })}
                    />
                  </Field>
                  <Field label="Alt Text">
                    <input
                      className={inputClass}
                      value={study.coverImage?.alt || ""}
                      onChange={(event) => updateDocument((draft) => {
                        const image = draft.portfolio.caseStudies[index].coverImage;
                        if (image) image.alt = event.target.value;
                      })}
                    />
                  </Field>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[8px] border border-border bg-white px-3 text-sm font-semibold hover:bg-muted">
                    <ImagePlus className="h-4 w-4" />
                    Upload Local Cover
                    <input
                      className="hidden"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        void uploadImage(file, (image) => updateDocument((draft) => {
                          draft.portfolio.caseStudies[index].coverImage = image;
                        }));
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <Button
                    variant="danger"
                    disabled={!study.coverImage}
                    onClick={() => {
                      void removeAsset(study.coverImage);
                      updateDocument((draft) => { draft.portfolio.caseStudies[index].coverImage = undefined; });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Cover
                  </Button>
                </div>
              </div>

              <div className="rounded-[8px] border border-border bg-muted p-3">
                <h4 className="mb-3 text-xs font-black uppercase tracking-[0.06em]">Gallery Images</h4>
                <GalleryUrlInput onAdd={(url) => updateDocument((draft) => {
                  draft.portfolio.caseStudies[index].gallery.push({ kind: "url", url, alt: study.title });
                })} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[8px] border border-border bg-white px-3 text-sm font-semibold hover:bg-muted">
                    <ImagePlus className="h-4 w-4" />
                    Upload Local Image
                    <input
                      className="hidden"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        void uploadImage(file, (image) => updateDocument((draft) => {
                          draft.portfolio.caseStudies[index].gallery.push(image);
                        }));
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                <div className="mt-3 grid gap-2">
                  {study.gallery.map((image, imageIndex) => (
                    <div
                      className="flex min-w-0 items-center justify-between gap-2 rounded-[8px] border border-border bg-white px-3 py-2 text-xs"
                      key={`${image.kind}-${image.kind === "asset" ? image.assetId : image.url}-${imageIndex}`}
                    >
                      <span className="min-w-0 truncate">
                        {image.kind === "asset" ? `Local asset: ${image.assetId}` : image.url}
                      </span>
                      <Button
                        variant="danger"
                        title="Remove gallery image"
                        onClick={() => {
                          void removeAsset(image);
                          updateDocument((draft) => { draft.portfolio.caseStudies[index].gallery.splice(imageIndex, 1); });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {study.gallery.length === 0 && <p className="text-xs text-muted-foreground">No gallery images yet.</p>}
                </div>
              </div>
            </RecordEditor>
          ))}

          <Button
            variant="secondary"
            onClick={() => updateDocument((draft) => {
              draft.portfolio.caseStudies.push(createCaseStudy(draft.portfolio.caseStudies.length));
            })}
          >
            <Plus className="h-4 w-4" />
            Add Case Study
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
