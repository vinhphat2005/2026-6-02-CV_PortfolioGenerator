"use client";

import { useEffect, useMemo, useState } from "react";
import { getPortfolioImage, portfolioImageDataUrl } from "@/lib/portfolioAssets";
import type { PortfolioDeck } from "@/lib/types";

function assetIds(deck: PortfolioDeck) {
  return Array.from(
    new Set(
      deck.caseStudies.flatMap((study) => [study.coverImage, ...study.gallery])
        .filter((image) => image?.kind === "asset")
        .map((image) => image?.kind === "asset" ? image.assetId : "")
        .filter(Boolean)
    )
  );
}

export function usePortfolioAssetUrls(deck: PortfolioDeck) {
  const ids = useMemo(() => assetIds(deck), [deck]);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];
    Promise.all(
      ids.map(async (id) => {
        const blob = await getPortfolioImage(id);
        if (!blob) return null;
        const url = URL.createObjectURL(blob);
        created.push(url);
        return [id, url] as const;
      })
    ).then((entries) => {
      if (!cancelled) {
        setUrls(Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry))));
      }
    });
    return () => {
      cancelled = true;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [ids]);

  return urls;
}

export async function portfolioAssetDataUrls(deck: PortfolioDeck) {
  const entries = await Promise.all(
    assetIds(deck).map(async (id) => [id, await portfolioImageDataUrl(id)] as const)
  );
  return Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry[1])));
}

