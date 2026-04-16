# Routing Rules — Lee's Squad

## Work Type → Agent

| Work Type | Agent | Examples |
|-----------|-------|----------|
| PRD intake, planning, architecture | Architect 🧭 | Feature specs, build plans, tech decisions, delegation, scope questions |
| UI/UX design | Designer 🎨 | Wireframes, component specs, design systems, visual design, accessibility |
| Backend development | Backend 🔨 | APIs, auth, server logic, integrations, background jobs, data access |
| Frontend development | Frontend 💻 | UI components, pages, routing, client state, forms, API integration |
| Data layer | Data 🗄️ | Schema design, migrations, ORM models, query optimisation, indexes |
| Quality assurance | QA 🛡️ | Tests (unit/integration/e2e), acceptance sign-off, CI quality gates |
| Documentation & decisions | Scribe 📋 | Session logs, decision merging — silent background only |

## Routing Principles

1. **Everything starts with Architect.** An unclear or unplanned request goes to Architect first. Architect decomposes before specialists build.
2. **Architect approves the plan before code starts.** Backend and Frontend don't pick up work until Architect has written the spec and you've approved it.
3. **Parallel where independent.** Backend and Frontend work simultaneously. Data aligns with Backend on data shapes first, then can work in parallel.
4. **QA is spawned with Backend and Frontend.** Tests are written alongside code, not after. QA reads the spec, not the finished code.
5. **Scribe always runs** after substantial work, as `mode: "background"`. Never blocks.
6. **Quick clarifying questions** → coordinator answers directly. Don't spawn Architect for trivial queries.
7. **Full-stack features** → fan-out: Architect (plan) → then Backend + Frontend + QA in parallel.

## Default Agent

All ambiguous incoming requests route to **Architect**, who decides whether to handle or delegate.

