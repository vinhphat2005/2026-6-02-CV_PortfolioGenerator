import React, { type ComponentType } from "react";
import { PortfolioDeckView } from "@/features/portfolio/PortfolioDeckView";
import type { PortfolioDeckTemplateId, PortfolioDeckTemplateMeta, ProfileDocument } from "@/lib/types";

export type PortfolioDeckTemplateProps = {
  document: ProfileDocument;
  assets?: Record<string, string>;
};

export type PortfolioDeckTemplateComponent = ComponentType<PortfolioDeckTemplateProps>;

function deckTemplate(templateId: PortfolioDeckTemplateId): PortfolioDeckTemplateComponent {
  return function DeckTemplate({ document, assets = {} }: PortfolioDeckTemplateProps) {
    return <PortfolioDeckView document={document} assets={assets} templateId={templateId} />;
  };
}

export const portfolioDeckTemplateMetas: PortfolioDeckTemplateMeta[] = [
  {
    id: "editorial-blue",
    name: "Editorial Blue",
    kind: "deck",
    description: "Asymmetric cyan editorial layout with strong image-led project dividers.",
    recommendedFor: ["frontend-developer", "fullstack-developer", "data-analyst"],
    supportsPhoto: true,
    atsFriendly: false,
    palette: { primary: "#58b7d1", secondary: "#142b36" }
  },
  {
    id: "architectural-minimal",
    name: "Architectural Minimal",
    kind: "deck",
    description: "Quiet geometric layout with generous whitespace and precise project structure.",
    recommendedFor: ["backend-developer", "fullstack-developer", "software-engineer-intern"],
    supportsPhoto: true,
    atsFriendly: false,
    palette: { primary: "#9bc4dc", secondary: "#111827" }
  },
  {
    id: "bold-studio-orange",
    name: "Bold Studio Orange",
    kind: "deck",
    description: "High-contrast orange studio layout for creative technology, games, and AI work.",
    recommendedFor: ["game-developer", "ai-automation-developer", "frontend-developer"],
    supportsPhoto: true,
    atsFriendly: false,
    palette: { primary: "#f59e0b", secondary: "#111827" }
  },
  {
    id: "digital-agency-noir",
    name: "Digital Agency Noir",
    kind: "deck",
    description: "Cinematic charcoal deck with cobalt signals, oversized type, and capability rails.",
    recommendedFor: ["frontend-developer", "fullstack-developer", "ai-automation-developer"],
    supportsPhoto: true,
    atsFriendly: false,
    palette: { primary: "#6d88ff", secondary: "#090d12" }
  },
  {
    id: "swiss-editorial-coral",
    name: "Swiss Editorial Coral",
    kind: "deck",
    description: "Confident editorial system with coral fields, rigorous grids, and magazine typography.",
    recommendedFor: ["frontend-developer", "data-analyst", "software-engineer-intern"],
    supportsPhoto: true,
    atsFriendly: false,
    palette: { primary: "#ff5b4d", secondary: "#171717" }
  },
  {
    id: "playful-product-grid",
    name: "Playful Product Grid",
    kind: "deck",
    description: "Modular product-story grid with bright signals for creative technology work.",
    recommendedFor: ["game-developer", "frontend-developer", "ai-automation-developer"],
    supportsPhoto: true,
    atsFriendly: false,
    palette: { primary: "#c7f000", secondary: "#251f47" }
  }
];

export const portfolioDeckTemplateComponents: Record<PortfolioDeckTemplateId, PortfolioDeckTemplateComponent> = {
  "editorial-blue": deckTemplate("editorial-blue"),
  "architectural-minimal": deckTemplate("architectural-minimal"),
  "bold-studio-orange": deckTemplate("bold-studio-orange"),
  "digital-agency-noir": deckTemplate("digital-agency-noir"),
  "swiss-editorial-coral": deckTemplate("swiss-editorial-coral"),
  "playful-product-grid": deckTemplate("playful-product-grid")
};
