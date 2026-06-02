import { defaultPresentationSettings } from "@/lib/schema";
import type { Profile, ProfileDocument, TargetRole } from "@/lib/types";

const github = "https://github.com/example";
const portfolio = "https://example.dev";

function baseProfile(title: string): Profile {
  return {
    personal: {
      name: "Alex Morgan",
      title,
      email: "alex.morgan@example.com",
      phone: "+1 555 0198",
      location: "Remote",
      website: portfolio,
      links: [
        { label: "GitHub", url: github },
        { label: "LinkedIn", url: "https://www.linkedin.com/in/example" },
        { label: "Portfolio", url: portfolio }
      ]
    },
    summary:
      "Software engineer focused on shipping reliable products with clear UX, maintainable architecture, and measurable outcomes.",
    skills: [
      {
        category: "Languages",
        items: ["TypeScript", "JavaScript", "Python", "SQL"]
      },
      {
        category: "Frontend",
        items: ["React", "Next.js", "Tailwind CSS", "Accessibility"]
      },
      {
        category: "Backend",
        items: ["Node.js", "REST API", "PostgreSQL", "Docker"]
      }
    ],
    experience: [
      {
        company: "Nova Labs",
        role: title,
        location: "Remote",
        startDate: "2023",
        endDate: "Present",
        current: true,
        technologies: ["TypeScript", "React", "Node.js", "PostgreSQL"],
        highlights: [
          "Built customer-facing workflows with React and TypeScript, reducing repeated support requests by 28%.",
          "Improved API error handling and form validation, cutting failed submissions by 19%.",
          "Added automated test coverage for critical checkout flows and increased confidence before weekly releases."
        ]
      }
    ],
    projects: [
      {
        name: "Cook App",
        description:
          "Recipe planning app with ingredient search, saved collections, and personalized cooking suggestions.",
        collaboration: "personal",
        role: "Full-stack engineer",
        repo: "https://github.com/example/cook-app",
        demo: "https://cook.example.dev",
        technologies: ["React", "FastAPI", "MongoDB", "Docker", "REST API"],
        highlights: [
          "Designed REST API endpoints for recipe search, favorites, and user collections with MongoDB persistence.",
          "Containerized the frontend and backend with Docker Compose for one-command local setup.",
          "Added input validation and integration tests for the most common recipe workflows."
        ],
        impact: "Reduced local setup time from 30 minutes to under 5 minutes."
      }
    ],
    education: [
      {
        school: "City University",
        degree: "B.S. in Computer Science",
        location: "Remote",
        startDate: "2019",
        endDate: "2023",
        highlights: ["Coursework in algorithms, databases, operating systems, and software engineering."]
      }
    ],
    certifications: [
      {
        name: "Responsive Web Design",
        issuer: "freeCodeCamp",
        date: "2024",
        url: "https://www.freecodecamp.org"
      }
    ],
    languages: [
      { name: "English", level: "Professional" },
      { name: "Vietnamese", level: "Native" }
    ],
    interests: ["Open source", "Developer tools", "Product engineering"],
    customSections: [
      {
        id: "community",
        title: "Community",
        items: ["Maintains personal notes and starter templates for junior developers."]
      }
    ]
  };
}

function documentFor(role: TargetRole, profile: Profile): ProfileDocument {
  return {
    profile,
    settings: {
      ...defaultPresentationSettings,
      targetRole: role
    }
  };
}

const intern = baseProfile("Software Engineer Intern");
intern.summary =
  "Computer science student seeking a software engineering internship, with strong fundamentals, clean project documentation, and hands-on experience building full-stack apps.";
intern.experience = [
  {
    company: "University Software Lab",
    role: "Student Developer",
    location: "Remote",
    startDate: "2024",
    endDate: "2025",
    technologies: ["Python", "React", "Git"],
    highlights: [
      "Implemented reusable React components for a student scheduling tool used by 120 classmates.",
      "Wrote unit tests for date parsing utilities and documented setup steps in the project README.",
      "Collaborated in GitHub pull requests and resolved review feedback before weekly demos."
    ]
  }
];

const frontend = baseProfile("Frontend Developer");
frontend.skills = [
  { category: "Core", items: ["React", "Next.js", "TypeScript", "JavaScript"] },
  { category: "UI", items: ["Tailwind CSS", "Accessibility", "Responsive Design", "Design Systems"] },
  { category: "Quality", items: ["Vitest", "Playwright", "Performance", "Web Vitals"] }
];
frontend.projects.push({
  name: "Design System Playground",
  description: "Component library sandbox for forms, tables, modals, and theme tokens.",
  collaboration: "team-member",
  role: "Frontend engineer",
  repo: "https://github.com/example/design-system-playground",
  demo: "https://ui.example.dev",
  technologies: ["React", "TypeScript", "Tailwind CSS", "Storybook", "Playwright"],
  highlights: [
    "Created accessible form controls and keyboard-friendly dialogs used across 15 internal screens.",
    "Reduced duplicated UI code by 35% through shared components and typed variants.",
    "Added Playwright visual smoke checks for high-risk user flows."
  ],
  impact: "Improved frontend consistency and reduced repeated implementation work."
});

const backend = baseProfile("Backend Developer");
backend.skills = [
  { category: "Backend", items: ["Node.js", "FastAPI", "REST API", "Authentication"] },
  { category: "Data", items: ["PostgreSQL", "MongoDB", "Redis", "SQL"] },
  { category: "Platform", items: ["Docker", "CI", "Testing", "Background Jobs"] }
];
backend.projects.push({
  name: "Inventory API",
  description: "Multi-tenant inventory service with auth, audit logs, and background sync jobs.",
  collaboration: "team-member",
  role: "Backend engineer",
  repo: "https://github.com/example/inventory-api",
  technologies: ["Node.js", "PostgreSQL", "Redis", "Docker", "REST API", "JWT"],
  highlights: [
    "Designed REST API resources for inventory, locations, and stock movements with PostgreSQL constraints.",
    "Implemented JWT authentication and role-based authorization for warehouse operators.",
    "Added Redis-backed background jobs that processed 10k sync events per hour with retry handling."
  ],
  impact: "Reduced manual reconciliation work by 40% for operations teams."
});

const fullstack = baseProfile("Full-stack Developer");
fullstack.projects.push({
  name: "Hiring Pipeline Tracker",
  description: "Self-hosted tracker for job applications, interviews, notes, and salary ranges.",
  collaboration: "team-lead",
  role: "Full-stack engineer",
  repo: "https://github.com/example/hiring-tracker",
  demo: "https://jobs.example.dev",
  technologies: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Docker", "Playwright"],
  highlights: [
    "Built full CRUD workflows for companies, applications, interviews, and follow-up reminders.",
    "Added Docker Compose setup and seed data so new users can start in one command.",
    "Implemented E2E tests for the core application lifecycle from create to archive."
  ],
  impact: "Helped users replace spreadsheets with a structured workflow."
});

const game = baseProfile("Game Developer");
game.skills = [
  { category: "Game", items: ["Roblox Studio", "Lua", "Gameplay Systems", "Combat Systems"] },
  { category: "Systems", items: ["Data Saving", "Multiplayer", "Performance Optimization", "Telemetry"] },
  { category: "Web", items: ["TypeScript", "React", "REST API", "Git"] }
];
game.projects = [
  {
    name: "Roblox Arena Systems",
    description: "Multiplayer arena prototype with combat loops, persistent player data, and match rewards.",
    collaboration: "personal",
    role: "Game systems developer",
    repo: "https://github.com/example/roblox-arena",
    video: "https://example.dev/arena-demo",
    technologies: ["Roblox Studio", "Lua", "DataStore", "Multiplayer", "Combat System"],
    highlights: [
      "Implemented server-authoritative combat validation to reduce exploit-prone client behavior.",
      "Built persistent player inventory and progression with Roblox DataStore save/load flows.",
      "Optimized replicated effects and remote events to keep combat responsive during 12-player matches."
    ],
    impact: "Created a playable prototype with repeatable match loops and persistent progression."
  }
];

const automation = baseProfile("AI Automation Developer");
automation.skills = [
  { category: "Automation", items: ["Workflow Automation", "Python", "Node.js", "Webhooks"] },
  { category: "AI", items: ["LLM Workflows", "Prompt Design", "Ollama", "Data Extraction"] },
  { category: "Reliability", items: ["Retry Logic", "Validation", "Logging", "Error Handling"] }
];
automation.projects.push({
  name: "Invoice Intake Assistant",
  description: "Local automation that extracts invoice fields, validates them, and prepares accounting drafts.",
  collaboration: "personal",
  role: "Automation developer",
  repo: "https://github.com/example/invoice-intake",
  technologies: ["Python", "Ollama", "OCR", "SQLite", "Workflow Automation"],
  highlights: [
    "Built a local LLM review step that summarizes invoice exceptions without sending data to paid APIs.",
    "Added retry and validation rules for missing vendor, amount, and due-date fields.",
    "Reduced manual invoice triage time by 55% in a simulated operations workflow."
  ],
  impact: "Demonstrated privacy-friendly automation with measurable time savings."
});

const analyst = baseProfile("Data Analyst");
analyst.skills = [
  { category: "Analysis", items: ["SQL", "Python", "Pandas", "Data Cleaning"] },
  { category: "Visualization", items: ["Tableau", "Power BI", "Dashboarding", "KPI Reporting"] },
  { category: "Business", items: ["Cohort Analysis", "A/B Testing", "Metrics Design", "Storytelling"] }
];
analyst.projects = [
  {
    name: "Subscription Cohort Dashboard",
    description: "Dashboard for retention, churn, and revenue cohorts from product usage exports.",
    collaboration: "team-member",
    role: "Data analyst",
    repo: "https://github.com/example/cohort-dashboard",
    demo: "https://analytics.example.dev",
    technologies: ["SQL", "Python", "Pandas", "Power BI", "Data Visualization"],
    highlights: [
      "Cleaned 250k subscription records and normalized plan, churn, and billing-event data.",
      "Built retention cohort views that highlighted a 17% drop-off after onboarding week two.",
      "Presented KPI recommendations that focused product experiments on activation and renewal risk."
    ],
    impact: "Turned raw exports into decision-ready retention insights."
  }
];

export const sampleProfiles: Record<TargetRole, ProfileDocument> = {
  "software-engineer-intern": documentFor("software-engineer-intern", intern),
  "frontend-developer": documentFor("frontend-developer", frontend),
  "backend-developer": documentFor("backend-developer", backend),
  "fullstack-developer": documentFor("fullstack-developer", fullstack),
  "game-developer": documentFor("game-developer", game),
  "ai-automation-developer": documentFor("ai-automation-developer", automation),
  "data-analyst": documentFor("data-analyst", analyst)
};

export const defaultProfileDocument = sampleProfiles["fullstack-developer"];
