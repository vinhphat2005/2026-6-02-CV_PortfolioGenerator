import React from "react";
import { renderToStaticMarkup } from "react-dom/server.browser";
import { getPortfolioDeckTemplate } from "@/templates/registry";
import type { ProfileDocument } from "./types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderPortfolioDeckHtml(document: ProfileDocument, assets: Record<string, string>) {
  const Template = getPortfolioDeckTemplate(document.portfolio.templateId);
  const markup = renderToStaticMarkup(<Template document={document} assets={assets} />);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; script-src 'none'; base-uri 'none'; form-action 'none'" />
  <title>${escapeHtml(document.portfolio.title)}</title>
</head>
<body>${markup}</body>
</html>`;
}
