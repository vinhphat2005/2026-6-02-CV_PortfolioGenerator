import { roleCriteria } from "./scoring/roleCriteria";
import { flattenProfileText, projectText } from "./profileText";
import type { JobMatchResult, ProfileDocument } from "./types";

export const keywordAliases: Record<string, string[]> = {
  React: ["react", "react.js", "reactjs"],
  "Node.js": ["node", "node.js", "nodejs"],
  PostgreSQL: ["postgres", "postgresql"],
  "REST API": ["rest api", "restful api", "restful", "api"],
  MongoDB: ["mongodb", "mongo db"],
  Docker: ["docker", "docker compose", "container"],
  TypeScript: ["typescript", "ts"],
  JavaScript: ["javascript", "js"],
  "Next.js": ["next", "next.js", "nextjs"],
  FastAPI: ["fastapi", "fast api"],
  Python: ["python"],
  SQL: ["sql"],
  Redis: ["redis"],
  Authentication: ["authentication", "authorization", "auth", "jwt", "oauth"],
  Testing: ["testing", "unit test", "integration test", "e2e", "playwright", "vitest", "jest"],
  "CI/CD": ["ci", "cd", "ci/cd", "github actions"],
  "Tailwind CSS": ["tailwind", "tailwind css"],
  Accessibility: ["accessibility", "a11y", "wcag"],
  Performance: ["performance", "optimization", "web vitals"],
  "Roblox Studio": ["roblox", "roblox studio"],
  Lua: ["lua", "luau"],
  Multiplayer: ["multiplayer"],
  "Data Saving": ["data saving", "datastore", "save load", "save/load"],
  "Combat System": ["combat", "combat system"],
  "Workflow Automation": ["workflow automation", "automation", "automate"],
  LLM: ["llm", "large language model", "ollama", "local model", "ai"],
  "Data Analysis": ["data analysis", "analytics", "analysis"],
  Dashboard: ["dashboard", "reporting", "bi"],
  "Data Visualization": ["visualization", "data visualization", "chart"],
  Pandas: ["pandas"],
  "Power BI": ["power bi", "powerbi"],
  Tableau: ["tableau"]
};

const canonicalKeywords = Object.keys(keywordAliases);

export function normalizeKeyword(input: string) {
  const lower = input.trim().toLowerCase();
  const match = Object.entries(keywordAliases).find(([, aliases]) =>
    aliases.some((alias) => alias.toLowerCase() === lower)
  );
  return match?.[0] ?? input.trim();
}

function includesAlias(text: string, canonical: string) {
  const aliases = keywordAliases[canonical] ?? [canonical];
  const lower = text.toLowerCase();
  return aliases.some((alias) => {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9+#])${escaped}([^a-z0-9+#]|$)`, "i").test(lower);
  });
}

export function extractKeywords(text: string, targetRole?: ProfileDocument["settings"]["targetRole"]) {
  const found = new Set<string>();
  canonicalKeywords.forEach((keyword) => {
    if (includesAlias(text, keyword)) {
      found.add(keyword);
    }
  });

  if (targetRole) {
    roleCriteria[targetRole].forEach((criterion) => {
      if (criterion.keywords.some((keyword) => includesAlias(text, normalizeKeyword(keyword)))) {
        criterion.keywords.map(normalizeKeyword).forEach((keyword) => found.add(keyword));
      }
    });
  }

  return [...found].sort();
}

export function matchJobDescription(document: ProfileDocument, jobDescription: string): JobMatchResult {
  const jdKeywords = extractKeywords(jobDescription, document.settings.targetRole);
  const profileText = flattenProfileText(document);
  const matchedKeywords = jdKeywords.filter((keyword) => includesAlias(profileText, keyword));
  const missingKeywords = jdKeywords.filter((keyword) => !matchedKeywords.includes(keyword));
  const weakMatches = matchedKeywords.filter((keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const count = (profileText.match(new RegExp(escaped, "gi")) ?? []).length;
    return count <= 1;
  });

  const recommendedProjectOrder = [...document.profile.projects]
    .map((project) => {
      const text = projectText(project).toLowerCase();
      const matches = jdKeywords.filter((keyword) => includesAlias(text, keyword)).length;
      return { project, matches };
    })
    .sort((a, b) => b.matches - a.matches)
    .map((item) => item.project.name);

  const suggestions = [
    ...missingKeywords.slice(0, 6).map(
      (keyword) =>
        `If this is true, consider mentioning ${keyword} because the job description emphasizes it.`
    ),
    ...weakMatches.slice(0, 4).map(
      (keyword) =>
        `Strengthen ${keyword} evidence with a project bullet that explains what you built and the result.`
    )
  ];

  const matchScore =
    jdKeywords.length === 0
      ? 0
      : Math.round((matchedKeywords.length / jdKeywords.length) * 100);

  return {
    matchScore,
    matchedKeywords,
    missingKeywords,
    weakMatches,
    recommendedProjectOrder,
    suggestions
  };
}
