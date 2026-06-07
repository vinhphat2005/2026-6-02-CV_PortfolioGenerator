"use client";

import type React from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  Eye,
  FileArchive,
  FileDown,
  FileJson,
  FileStack,
  Gauge,
  Import,
  LayoutTemplate,
  Save,
  Trash2
} from "lucide-react";
import { Button, Field, inputClass } from "@/components/ui/forms";
import { roleLabels, targetRoles } from "@/lib/schema";
import type { TargetRole } from "@/lib/types";
import type { TabId } from "./types";

const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "editor", label: "Editor", icon: Save },
  { id: "portfolio", label: "Portfolio Deck", icon: BookOpen },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "score", label: "Score", icon: Gauge },
  { id: "job", label: "Job Match", icon: BriefcaseBusiness }
];

export function AppSidebar({
  activeTab,
  setActiveTab,
  targetRole,
  setSample,
  exportJson,
  importRef,
  handleImport,
  exportPdf,
  exportPortfolioDeckPdf,
  exportWebsitePortfolio,
  resetLocalSession,
  autosaveAvailable,
  exportStatus
}: {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  targetRole: TargetRole;
  setSample: (role: TargetRole) => void;
  exportJson: () => void;
  importRef: React.RefObject<HTMLInputElement | null>;
  handleImport: (file: File | undefined) => void;
  exportPdf: () => void;
  exportPortfolioDeckPdf: () => void;
  exportWebsitePortfolio: () => void;
  resetLocalSession: () => void;
  autosaveAvailable: boolean;
  exportStatus: string;
}) {
  return (
    <aside className="border-r border-border bg-[#f1f3ee] p-4 max-xl:border-b max-xl:border-r-0" aria-label="Studio navigation and export tools">
      <div className="mb-5">
        <div className="text-xl font-black tracking-normal">Career Forge</div>
        <p className="mt-1 text-sm text-muted-foreground">Local CV, portfolio, scoring, and JD matching.</p>
      </div>
      <nav className="grid gap-1" aria-label="Studio sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              aria-current={activeTab === tab.id ? "page" : undefined}
              onClick={() => setActiveTab(tab.id)}
              className={`flex h-10 items-center gap-2 rounded-[8px] px-3 text-left text-sm font-semibold transition ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-5 space-y-3">
        <Field label="Sample Profile">
          <select className={inputClass} value={targetRole} onChange={(event) => setSample(event.target.value as TargetRole)}>
            {targetRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
          </select>
        </Field>
        <Button variant="secondary" className="w-full" onClick={exportJson}>
          <FileJson className="h-4 w-4" />
          Export JSON
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => importRef.current?.click()}>
          <Import className="h-4 w-4" />
          Import JSON
        </Button>
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            handleImport(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <Button variant="secondary" className="w-full" onClick={exportPdf}>
          <FileDown className="h-4 w-4" />
          Export CV PDF
        </Button>
        <Button variant="secondary" className="w-full" onClick={exportPortfolioDeckPdf}>
          <FileStack className="h-4 w-4" />
          Portfolio PDF
        </Button>
        <Button variant="secondary" className="w-full" onClick={exportWebsitePortfolio}>
          <FileArchive className="h-4 w-4" />
          Website ZIP
        </Button>
        <Button variant="ghost" className="w-full" onClick={resetLocalSession}>
          <Trash2 className="h-4 w-4" />
          Reset Local Session
        </Button>
        <p className="text-xs text-muted-foreground">
          {autosaveAvailable ? "Autosave stays in this browser session only." : "Local autosave unavailable."}
        </p>
        <p className="text-xs text-muted-foreground" aria-live="polite">{exportStatus}</p>
      </div>
    </aside>
  );
}
