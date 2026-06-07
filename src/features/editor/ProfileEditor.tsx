"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Field,
  inputClass,
  RecordEditor,
  SectionCard,
  splitLines,
  textareaClass
} from "@/components/ui/forms";
import {
  defaultSectionLabels,
  projectCollaborationLabels,
  projectCollaborations,
  roleLabels,
  targetRoles
} from "@/lib/schema";
import type {
  FontPreset,
  ProfileDocument,
  ProjectCollaboration,
  SectionId,
  TargetRole
} from "@/lib/types";

type UpdateDocument = (updater: (draft: ProfileDocument) => void) => void;

export function ProfileEditor({
  document,
  updateDocument
}: {
  document: ProfileDocument;
  updateDocument: UpdateDocument;
}) {
  const { profile, settings } = document;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-normal">Editor</h1>
        <p className="text-sm text-muted-foreground">Edit structured data once, then reuse it across CV and portfolio templates.</p>
      </div>

      <SectionCard title="Personal">
        <div className="grid gap-3 md:grid-cols-2">
          {(["name", "title", "email", "phone", "location", "website", "photoUrl"] as const).map((key) => (
            <Field key={key} label={key}>
              <input
                className={inputClass}
                value={profile.personal[key] || ""}
                onChange={(event) => updateDocument((draft) => { draft.profile.personal[key] = event.target.value; })}
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Summary">
        <textarea
          className={textareaClass}
          value={profile.summary}
          onChange={(event) => updateDocument((draft) => { draft.profile.summary = event.target.value; })}
        />
      </SectionCard>

      <SectionCard title="Settings">
        <div className="grid gap-3 md:grid-cols-5">
          <Field label="Target Role">
            <select
              className={inputClass}
              value={settings.targetRole}
              onChange={(event) => updateDocument((draft) => {
                draft.settings.targetRole = event.target.value as TargetRole;
              })}
            >
              {targetRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
            </select>
          </Field>
          <Field label="Theme">
            <input
              type="color"
              className={`${inputClass} p-1`}
              value={settings.themeColor}
              onChange={(event) => updateDocument((draft) => { draft.settings.themeColor = event.target.value; })}
            />
          </Field>
          <Field label="Sidebar">
            <input
              type="color"
              className={`${inputClass} p-1`}
              value={settings.sidebarColor}
              onChange={(event) => updateDocument((draft) => { draft.settings.sidebarColor = event.target.value; })}
            />
          </Field>
          <Field label="Font">
            <select
              className={inputClass}
              value={settings.fontPreset}
              onChange={(event) => updateDocument((draft) => {
                draft.settings.fontPreset = event.target.value as FontPreset;
              })}
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="compact">Compact</option>
              <option value="serif">Serif</option>
            </select>
          </Field>
          <Field label="Language">
            <select
              className={inputClass}
              value={settings.language}
              onChange={(event) => updateDocument((draft) => {
                draft.settings.language = event.target.value as ProfileDocument["settings"]["language"];
              })}
            >
              <option value="en">English</option>
              <option value="vi">Vietnamese</option>
              <option value="custom">Custom</option>
            </select>
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Section Labels And Order">
        <div className="grid gap-2">
          {settings.sectionOrder.map((section, index) => (
            <div key={section} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
              <input
                className={inputClass}
                value={settings.sectionLabels[section] || defaultSectionLabels[section as SectionId]}
                onChange={(event) => updateDocument((draft) => {
                  draft.settings.sectionLabels[section] = event.target.value;
                })}
              />
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <input
                  type="checkbox"
                  checked={!settings.hiddenSections.includes(section)}
                  onChange={(event) => updateDocument((draft) => {
                    draft.settings.hiddenSections = event.target.checked
                      ? draft.settings.hiddenSections.filter((item) => item !== section)
                      : [...new Set([...draft.settings.hiddenSections, section])];
                  })}
                />
                Show
              </label>
              <Button
                variant="ghost"
                disabled={index === 0}
                title="Move up"
                onClick={() => updateDocument((draft) => {
                  const order = draft.settings.sectionOrder;
                  [order[index - 1], order[index]] = [order[index], order[index - 1]];
                })}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                disabled={index === settings.sectionOrder.length - 1}
                title="Move down"
                onClick={() => updateDocument((draft) => {
                  const order = draft.settings.sectionOrder;
                  [order[index + 1], order[index]] = [order[index], order[index + 1]];
                })}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SkillsEditor document={document} updateDocument={updateDocument} />
      <ExperienceEditor document={document} updateDocument={updateDocument} />
      <ProjectsEditor document={document} updateDocument={updateDocument} />
      <EducationEditor document={document} updateDocument={updateDocument} />
    </div>
  );
}

function SkillsEditor({ document, updateDocument }: { document: ProfileDocument; updateDocument: UpdateDocument }) {
  return (
    <SectionCard title="Skills">
      <div className="space-y-3">
        {document.profile.skills.map((group, index) => (
          <div key={`${group.category}-${index}`} className="grid gap-2 rounded-[8px] border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold">{group.category || "Skill Group"}</h3>
              <Button
                variant="danger"
                title="Delete skill group"
                onClick={() => updateDocument((draft) => { draft.profile.skills.splice(index, 1); })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <input
              className={inputClass}
              value={group.category}
              onChange={(event) => updateDocument((draft) => {
                draft.profile.skills[index].category = event.target.value;
              })}
            />
            <textarea
              className={textareaClass}
              value={group.items.join("\n")}
              onChange={(event) => updateDocument((draft) => {
                draft.profile.skills[index].items = splitLines(event.target.value);
              })}
            />
          </div>
        ))}
        <Button variant="secondary" onClick={() => updateDocument((draft) => {
          draft.profile.skills.push({ category: "New Category", items: ["New Skill"] });
        })}>
          <Plus className="h-4 w-4" />
          Add Skill Group
        </Button>
      </div>
    </SectionCard>
  );
}

function ExperienceEditor({ document, updateDocument }: { document: ProfileDocument; updateDocument: UpdateDocument }) {
  return (
    <SectionCard title="Experience">
      <div className="space-y-3">
        {document.profile.experience.map((item, index) => (
          <RecordEditor
            key={`${item.company}-${index}`}
            title={`${item.role} at ${item.company}`}
            onDelete={() => updateDocument((draft) => { draft.profile.experience.splice(index, 1); })}
          >
            <div className="grid gap-2 md:grid-cols-2">
              {(["role", "company", "location", "startDate", "endDate"] as const).map((key) => (
                <Field key={key} label={key}>
                  <input
                    className={inputClass}
                    value={item[key] || ""}
                    onChange={(event) => updateDocument((draft) => {
                      draft.profile.experience[index][key] = event.target.value;
                    })}
                  />
                </Field>
              ))}
            </div>
            <Field label="Technologies">
              <input
                className={inputClass}
                value={item.technologies.join(", ")}
                onChange={(event) => updateDocument((draft) => {
                  draft.profile.experience[index].technologies = commaList(event.target.value);
                })}
              />
            </Field>
            <Field label="Highlights">
              <textarea
                className={textareaClass}
                value={item.highlights.join("\n")}
                onChange={(event) => updateDocument((draft) => {
                  draft.profile.experience[index].highlights = splitLines(event.target.value);
                })}
              />
            </Field>
          </RecordEditor>
        ))}
        <Button variant="secondary" onClick={() => updateDocument((draft) => {
          draft.profile.experience.push({
            company: "Company",
            role: "Software Engineer",
            startDate: "2025",
            endDate: "Present",
            current: true,
            technologies: ["TypeScript"],
            highlights: ["Built a feature with clear technical ownership and measurable impact."]
          });
        })}>
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </div>
    </SectionCard>
  );
}

function ProjectsEditor({ document, updateDocument }: { document: ProfileDocument; updateDocument: UpdateDocument }) {
  return (
    <SectionCard title="Projects">
      <div className="space-y-3">
        {document.profile.projects.map((item, index) => (
          <RecordEditor
            key={`${item.name}-${index}`}
            title={item.name}
            onDelete={() => updateDocument((draft) => { draft.profile.projects.splice(index, 1); })}
          >
            <div className="grid gap-2 md:grid-cols-2">
              <Field label="Project Type">
                <select
                  className={inputClass}
                  value={item.collaboration || "personal"}
                  onChange={(event) => updateDocument((draft) => {
                    draft.profile.projects[index].collaboration = event.target.value as ProjectCollaboration;
                  })}
                >
                  {projectCollaborations.map((value) => (
                    <option key={value} value={value}>{projectCollaborationLabels[value]}</option>
                  ))}
                </select>
              </Field>
              {(["name", "role", "repo", "demo", "video"] as const).map((key) => (
                <Field key={key} label={key}>
                  <input
                    className={inputClass}
                    value={item[key] || ""}
                    onChange={(event) => updateDocument((draft) => {
                      draft.profile.projects[index][key] = event.target.value;
                    })}
                  />
                </Field>
              ))}
            </div>
            <Field label="Description">
              <textarea
                className={textareaClass}
                value={item.description}
                onChange={(event) => updateDocument((draft) => {
                  draft.profile.projects[index].description = event.target.value;
                })}
              />
            </Field>
            <Field label="Technologies">
              <input
                className={inputClass}
                value={item.technologies.join(", ")}
                onChange={(event) => updateDocument((draft) => {
                  draft.profile.projects[index].technologies = commaList(event.target.value);
                })}
              />
            </Field>
            <Field label="Highlights">
              <textarea
                className={textareaClass}
                value={item.highlights.join("\n")}
                onChange={(event) => updateDocument((draft) => {
                  draft.profile.projects[index].highlights = splitLines(event.target.value);
                })}
              />
            </Field>
            <Field label="Impact">
              <input
                className={inputClass}
                value={item.impact || ""}
                onChange={(event) => updateDocument((draft) => {
                  draft.profile.projects[index].impact = event.target.value;
                })}
              />
            </Field>
          </RecordEditor>
        ))}
        <Button variant="secondary" onClick={() => updateDocument((draft) => {
          draft.profile.projects.push({
            name: "New Project",
            description: "Short description of the problem, solution, and target users.",
            collaboration: "personal",
            technologies: ["TypeScript"],
            highlights: ["Implemented a useful workflow with clear technical decisions."],
            impact: "Explain the result or usefulness."
          });
        })}>
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>
    </SectionCard>
  );
}

function EducationEditor({ document, updateDocument }: { document: ProfileDocument; updateDocument: UpdateDocument }) {
  return (
    <SectionCard title="Education">
      <div className="space-y-3">
        {document.profile.education.map((item, index) => (
          <RecordEditor
            key={`${item.school}-${index}`}
            title={item.school}
            onDelete={() => updateDocument((draft) => { draft.profile.education.splice(index, 1); })}
          >
            <div className="grid gap-2 md:grid-cols-2">
              {(["school", "degree", "location", "startDate", "endDate", "gpa"] as const).map((key) => (
                <Field
                  key={key}
                  label={key === "gpa" ? "GPA / Result" : key}
                  hint={key === "gpa" ? "Examples: GPA 3.8 / 4.0, 8.5 / 10, First Class Honors, Distinction." : undefined}
                >
                  <input
                    className={inputClass}
                    placeholder={key === "gpa" ? "GPA 3.8 / 4.0, 8.5 / 10, First Class Honors" : undefined}
                    value={item[key] || ""}
                    onChange={(event) => updateDocument((draft) => {
                      draft.profile.education[index][key] = event.target.value;
                    })}
                  />
                </Field>
              ))}
            </div>
            <Field label="Highlights">
              <textarea
                className={textareaClass}
                value={item.highlights.join("\n")}
                onChange={(event) => updateDocument((draft) => {
                  draft.profile.education[index].highlights = splitLines(event.target.value);
                })}
              />
            </Field>
          </RecordEditor>
        ))}
        <Button variant="secondary" onClick={() => updateDocument((draft) => {
          draft.profile.education.push({
            school: "School",
            degree: "Degree",
            location: "",
            startDate: "",
            endDate: "",
            gpa: "",
            highlights: ["Relevant coursework, honors, or academic achievements."]
          });
        })}>
          <Plus className="h-4 w-4" />
          Add Education
        </Button>
      </div>
    </SectionCard>
  );
}

function commaList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
