import {
  resumeTemplateComponents,
  resumeTemplateMetas,
  type ResumeTemplateComponent
} from "./resumeTemplates";
import {
  portfolioTemplateComponents,
  portfolioTemplateMetas,
  type PortfolioTemplateComponent
} from "./portfolioTemplates";
import type { TemplateMeta } from "@/lib/types";
import {
  portfolioDeckTemplateComponents,
  portfolioDeckTemplateMetas,
  type PortfolioDeckTemplateComponent
} from "./portfolioDeckTemplates";

function assertUniqueTemplates(templates: TemplateMeta[]) {
  const seen = new Set<string>();
  templates.forEach((template) => {
    if (seen.has(template.id)) {
      throw new Error(`Duplicate template id: ${template.id}`);
    }
    seen.add(template.id);
  });
}

assertUniqueTemplates([...resumeTemplateMetas, ...portfolioTemplateMetas, ...portfolioDeckTemplateMetas]);

export const resumeTemplates = resumeTemplateMetas;
export const portfolioTemplates = portfolioTemplateMetas;
export const portfolioDeckTemplates = portfolioDeckTemplateMetas;

export function getResumeTemplate(id: string): ResumeTemplateComponent {
  return resumeTemplateComponents[id] ?? resumeTemplateComponents["classic-sidebar"];
}

export function getPortfolioTemplate(id: string): PortfolioTemplateComponent {
  return portfolioTemplateComponents[id] ?? portfolioTemplateComponents["clean-product-engineer"];
}

export function getPortfolioDeckTemplate(id: string): PortfolioDeckTemplateComponent {
  return portfolioDeckTemplateComponents[id as keyof typeof portfolioDeckTemplateComponents]
    ?? portfolioDeckTemplateComponents["editorial-blue"];
}

export function getPortfolioDeckTemplateMeta(id: string) {
  return portfolioDeckTemplateMetas.find((template) => template.id === id) ?? portfolioDeckTemplateMetas[0];
}

export function assertNoDuplicateTemplateIds(templates: TemplateMeta[]) {
  assertUniqueTemplates(templates);
  return true;
}
