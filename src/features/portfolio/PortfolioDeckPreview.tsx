"use client";

import { usePortfolioAssetUrls } from "./usePortfolioAssets";
import type { ProfileDocument } from "@/lib/types";
import { getPortfolioDeckTemplate } from "@/templates/registry";

export function PortfolioDeckPreview({ document }: { document: ProfileDocument }) {
  const assets = usePortfolioAssetUrls(document.portfolio);
  const Template = getPortfolioDeckTemplate(document.portfolio.templateId);

  return (
    <div className="portfolio-deck-preview">
      <Template document={document} assets={assets} />
    </div>
  );
}
