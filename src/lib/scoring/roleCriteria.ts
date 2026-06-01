import type { RoleCriterion, TargetRole } from "../types";

export const roleCriteria: Record<TargetRole, RoleCriterion[]> = {
  "software-engineer-intern": [
    {
      id: "fundamentals",
      label: "Programming fundamentals",
      keywords: ["algorithms", "data structures", "testing", "git", "debugging"],
      weight: 20,
      evidenceSections: ["skills", "projects", "summary"],
      suggestion: "Show fundamentals through coursework, tests, GitHub projects, or debugging examples."
    },
    {
      id: "project-readiness",
      label: "Project readiness",
      keywords: ["github", "readme", "demo", "react", "python", "typescript"],
      weight: 20,
      evidenceSections: ["projects", "skills"],
      suggestion: "Add clean README files, demos, and project bullets that show ownership."
    },
    {
      id: "collaboration",
      label: "Collaboration",
      keywords: ["team", "pull request", "review", "collaborated", "agile"],
      weight: 15,
      evidenceSections: ["experience", "projects"],
      suggestion: "Mention collaboration, pull requests, or team project delivery if true."
    }
  ],
  "frontend-developer": [
    {
      id: "frontend-framework",
      label: "Frontend framework",
      keywords: ["react", "next.js", "vue", "angular"],
      weight: 20,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Show a frontend framework in both skills and project evidence."
    },
    {
      id: "typed-ui",
      label: "Typed UI implementation",
      keywords: ["typescript", "javascript", "component", "design system"],
      weight: 16,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Mention typed components, reusable UI, or design-system work."
    },
    {
      id: "frontend-quality",
      label: "Frontend quality",
      keywords: ["accessibility", "responsive", "performance", "playwright", "vitest", "web vitals"],
      weight: 18,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Add evidence for accessibility, responsiveness, performance, or frontend tests."
    }
  ],
  "backend-developer": [
    {
      id: "api-design",
      label: "API design",
      keywords: ["rest api", "graphql", "endpoint", "fastapi", "node.js", "express"],
      weight: 20,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Describe API resources, endpoints, validation, and error handling."
    },
    {
      id: "data-auth",
      label: "Data and authentication",
      keywords: ["postgresql", "mongodb", "database", "sql", "authentication", "authorization", "jwt"],
      weight: 22,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Add database and auth evidence if those systems were part of your work."
    },
    {
      id: "backend-operations",
      label: "Backend operations",
      keywords: ["docker", "testing", "redis", "background jobs", "ci", "deployment"],
      weight: 18,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Mention Docker, tests, background jobs, deployment, or reliability work."
    }
  ],
  "fullstack-developer": [
    {
      id: "frontend-backend",
      label: "Frontend and backend coverage",
      keywords: ["react", "next.js", "node.js", "fastapi", "rest api", "database"],
      weight: 24,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Show ownership across UI, API, and data layers."
    },
    {
      id: "deployment-quality",
      label: "Deployment and quality",
      keywords: ["docker", "testing", "playwright", "ci", "deployment"],
      weight: 18,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Add testing, Docker, or deployment evidence for end-to-end ownership."
    }
  ],
  "game-developer": [
    {
      id: "engine",
      label: "Game engine or framework",
      keywords: ["unity", "unreal", "godot", "roblox studio", "lua", "luau"],
      weight: 22,
      evidenceSections: ["skills", "projects"],
      suggestion: "Name the game engine and scripting language used."
    },
    {
      id: "game-systems",
      label: "Gameplay systems",
      keywords: ["gameplay", "combat", "inventory", "multiplayer", "data saving", "datastore"],
      weight: 24,
      evidenceSections: ["projects", "experience"],
      suggestion: "Describe concrete systems like combat, save/load, inventory, matchmaking, or multiplayer."
    },
    {
      id: "game-polish",
      label: "Performance and demo evidence",
      keywords: ["performance", "optimization", "demo", "video", "fps", "latency"],
      weight: 18,
      evidenceSections: ["projects", "experience"],
      suggestion: "Add a gameplay video/demo and note performance work if true."
    }
  ],
  "ai-automation-developer": [
    {
      id: "automation-workflows",
      label: "Automation workflows",
      keywords: ["workflow automation", "webhook", "integration", "scheduler", "pipeline"],
      weight: 22,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Show the workflow, triggers, integrations, and manual work removed."
    },
    {
      id: "ai-practice",
      label: "AI and prompt practice",
      keywords: ["llm", "ollama", "prompt", "extraction", "classification", "local model"],
      weight: 22,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Mention LLM usage, prompt design, extraction, validation, and privacy constraints."
    },
    {
      id: "automation-reliability",
      label: "Reliability",
      keywords: ["retry", "validation", "logging", "error handling", "fallback"],
      weight: 16,
      evidenceSections: ["projects", "experience"],
      suggestion: "Add reliability details like retries, validation, logging, and fallbacks."
    }
  ],
  "data-analyst": [
    {
      id: "analysis-stack",
      label: "Analysis stack",
      keywords: ["sql", "python", "pandas", "r", "excel"],
      weight: 20,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Show SQL/Python analysis with actual datasets or business questions."
    },
    {
      id: "visualization",
      label: "Visualization",
      keywords: ["dashboard", "power bi", "tableau", "visualization", "reporting"],
      weight: 18,
      evidenceSections: ["skills", "projects", "experience"],
      suggestion: "Add dashboard/reporting examples with links or screenshots."
    },
    {
      id: "business-impact",
      label: "Business impact",
      keywords: ["kpi", "metric", "insight", "cohort", "retention", "churn"],
      weight: 18,
      evidenceSections: ["projects", "experience", "summary"],
      suggestion: "Tie analysis to business metrics, insight, or decisions."
    }
  ]
};
