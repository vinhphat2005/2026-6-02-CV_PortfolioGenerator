"use client";

import { PortfolioDeckView } from "./PortfolioDeckView";
import { usePortfolioAssetUrls } from "./usePortfolioAssets";
import type { ProfileDocument } from "@/lib/types";

export function PortfolioDeckPreview({ document }: { document: ProfileDocument }) {
  const assets = usePortfolioAssetUrls(document.portfolio);

  return (
    <div className="portfolio-deck-preview">
      <PortfolioDeckView document={document} assets={assets} />
    </div>
  );
}
