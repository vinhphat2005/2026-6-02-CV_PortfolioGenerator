"use client";

import { useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { Button, Field, inputClass } from "@/components/ui/forms";
import { deletePortfolioImage, storePortfolioImage } from "@/lib/portfolioAssets";
import type { PortfolioCaseStudy, PortfolioImageRef, ProfileDocument } from "@/lib/types";

type UpdateDocument = (updater: (draft: ProfileDocument) => void) => void;

async function removeAsset(image: PortfolioImageRef | undefined) {
  if (image?.kind === "asset") await deletePortfolioImage(image.assetId);
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

export function PortfolioImageEditor({
  study,
  index,
  updateDocument,
  onStatus
}: {
  study: PortfolioCaseStudy;
  index: number;
  updateDocument: UpdateDocument;
  onStatus: (message: string) => void;
}) {
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
    <>
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
              className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(180px,1fr)_auto] items-center gap-2 rounded-[8px] border border-border bg-white px-3 py-2 text-xs max-md:grid-cols-[1fr_auto]"
              key={`${image.kind}-${image.kind === "asset" ? image.assetId : image.url}-${imageIndex}`}
            >
              <span className="min-w-0 truncate">
                {image.kind === "asset" ? `Local asset: ${image.assetId}` : image.url}
              </span>
              <input
                className={`${inputClass} max-md:col-span-2 max-md:row-start-2`}
                aria-label={`Alt text for gallery image ${imageIndex + 1}`}
                placeholder={`${study.title} project visual ${imageIndex + 1}`}
                value={image.alt || ""}
                onChange={(event) => updateDocument((draft) => {
                  draft.portfolio.caseStudies[index].gallery[imageIndex].alt = event.target.value;
                })}
              />
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
    </>
  );
}
