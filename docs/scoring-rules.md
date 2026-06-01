# Scoring Rules

Career Forge uses deterministic local scoring by default. It does not require AI.

## Score Groups

- Completeness
- Impact
- ATS Readiness
- Readability
- Role Fit
- Portfolio Quality
- JD Match when a job description is pasted

## Role Fit

Role-specific criteria live in `src/lib/scoring/roleCriteria.ts`. Each criterion defines:

- id
- label
- keywords
- weight
- evidence sections
- suggestion

The scorer searches only relevant sections, such as skills, projects, experience, or summary. Missing evidence produces suggestions, but the app avoids telling users to claim skills they do not have.

## JD Matcher

`src/lib/jdMatcher.ts` extracts local keywords using a dictionary and alias map.

Examples:

- `React.js` becomes `React`
- `Node` becomes `Node.js`
- `Postgres` becomes `PostgreSQL`
- `RESTful API` becomes `REST API`

Suggestions use cautious wording such as: `If this is true, consider mentioning X because the job description emphasizes it.`
