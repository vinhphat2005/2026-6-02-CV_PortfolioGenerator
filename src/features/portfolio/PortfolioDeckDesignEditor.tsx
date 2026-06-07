"use client";

import { Field, inputClass, SectionCard, textareaClass } from "@/components/ui/forms";
import { contrastRatio, meetsAaContrast } from "@/lib/colorContrast";
import type { ProfileDocument } from "@/lib/types";
import { getPortfolioDeckTemplateMeta, portfolioDeckTemplates } from "@/templates/registry";

function commaList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function PortfolioDeckDesignEditor({
  document,
  updateDocument
}: {
  document: ProfileDocument;
  updateDocument: (updater: (draft: ProfileDocument) => void) => void;
}) {
  const { portfolio } = document;
  const palettePasses = meetsAaContrast(portfolio.primaryColor, portfolio.secondaryColor);
  return (
    <SectionCard title="Deck Basics And Design">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Deck Template">
          <select
            className={inputClass}
            value={portfolio.templateId}
            onChange={(event) => updateDocument((draft) => {
              const templateId = event.target.value as ProfileDocument["portfolio"]["templateId"];
              const template = getPortfolioDeckTemplateMeta(templateId);
              draft.portfolio.templateId = templateId;
              draft.portfolio.primaryColor = template.palette.primary;
              draft.portfolio.secondaryColor = template.palette.secondary;
            })}
          >
            {portfolioDeckTemplates.map((template) => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary Color">
            <input
              type="color"
              className={`${inputClass} p-1`}
              value={portfolio.primaryColor}
              onChange={(event) => updateDocument((draft) => { draft.portfolio.primaryColor = event.target.value; })}
            />
          </Field>
          <Field label="Secondary Color">
            <input
              type="color"
              className={`${inputClass} p-1`}
              value={portfolio.secondaryColor}
              onChange={(event) => updateDocument((draft) => { draft.portfolio.secondaryColor = event.target.value; })}
            />
          </Field>
        </div>
        <div className={`rounded-[8px] border px-3 py-2 text-xs md:col-span-2 ${palettePasses ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-300 bg-amber-50 text-amber-900"}`}>
          Palette contrast: {contrastRatio(portfolio.primaryColor, portfolio.secondaryColor).toFixed(2)}:1.
          {palettePasses ? " Meets AA for normal text." : " Use more contrasting colors for readable text and controls."}
        </div>
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
  );
}
