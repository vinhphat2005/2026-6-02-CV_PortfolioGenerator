"use client";

import type { ProfileDocument } from "@/lib/types";
import { PortfolioCaseStudiesEditor } from "./PortfolioCaseStudiesEditor";
import { PortfolioDeckDesignEditor } from "./PortfolioDeckDesignEditor";

export function PortfolioDeckEditor({
  document,
  updateDocument,
  onStatus
}: {
  document: ProfileDocument;
  updateDocument: (updater: (draft: ProfileDocument) => void) => void;
  onStatus: (message: string) => void;
}) {
  return (
    <div className="space-y-4">
      <PortfolioDeckDesignEditor document={document} updateDocument={updateDocument} />
      <PortfolioCaseStudiesEditor document={document} updateDocument={updateDocument} onStatus={onStatus} />
    </div>
  );
}
