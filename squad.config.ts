import {
  defineSquad,
  defineTeam,
  defineAgent,
  defineRouting,
  defineCasting,
} from '@bradygaster/squad-sdk';

/**
 * Squad Configuration — Lee's Squad (PRD-driven build team)
 *
 * Workflow: You hand Architect a PRD → Architect plans and delegates →
 * Backend/Frontend/Data build → QA tests → Scribe logs decisions.
 *
 * Run `squad build` to regenerate .squad/*.md from this file.
 */
export default defineSquad({
  version: '1.0.0',

  team: defineTeam({
    name: "lee's-squad",
    description: "Lee's Squad — PRD-driven build team. You orchestrate, they build.",
    projectContext:
      '- **Workflow:** PRD → Architect plans → specialists build → QA tests\n' +
      '- **You are:** Product Owner — you set direction, approve plans, and stay out of the code\n' +
      '- **Stack:** Determined per-project by Architect during planning',
    members: ['architect', 'backend', 'frontend', 'data', 'qa', 'scribe'],
  }),

  agents: [
    defineAgent({
      name: 'architect',
      role: 'Tech Lead',
      description: 'PRD intake, planning, architecture decisions, task decomposition, and delegation to specialists.',
      status: 'active',
    }),
    defineAgent({
      name: 'backend',
      role: 'Backend Developer',
      description: 'APIs, server logic, authentication, integrations, business logic, data access layer.',
      status: 'active',
    }),
    defineAgent({
      name: 'frontend',
      role: 'Frontend Developer',
      description: 'UI components, pages, client-side state, API integration, forms, responsive layout.',
      status: 'active',
    }),
    defineAgent({
      name: 'data',
      role: 'Data Engineer',
      description: 'Database schema design, migrations, query optimisation, ORM models, data integrity.',
      status: 'active',
    }),
    defineAgent({
      name: 'qa',
      role: 'QA Engineer',
      description: 'Test strategy, unit/integration/e2e tests, acceptance criteria sign-off, CI quality gates.',
      status: 'active',
    }),
    defineAgent({
      name: 'scribe',
      role: 'Scribe',
      description: 'Session logging and decision merging. Silent background agent.',
      status: 'active',
    }),
  ],

  routing: defineRouting({
    rules: [
      {
        pattern: 'prd|plan|feature|design|architect|scope|requirement',
        agents: ['@architect'],
        description: 'PRD intake, planning, architecture decisions, build plans',
      },
      {
        pattern: 'api|endpoint|server|backend|auth|integration|webhook|queue|job',
        agents: ['@backend'],
        description: 'Backend implementation — APIs, auth, integrations, business logic',
      },
      {
        pattern: 'ui|component|page|frontend|react|vue|angular|css|style|form|layout',
        agents: ['@frontend'],
        description: 'Frontend implementation — components, pages, client state',
      },
      {
        pattern: 'database|schema|migration|query|orm|prisma|sql|index|table|model',
        agents: ['@data'],
        description: 'Data layer — schema design, migrations, query optimisation',
      },
      {
        pattern: 'test|spec|coverage|e2e|qa|quality|acceptance|bug|regression',
        agents: ['@qa'],
        description: 'Testing — strategy, writing tests, acceptance sign-off',
      },
      {
        pattern: 'full-stack|fullstack|feature.*end-to-end',
        agents: ['@architect', '@backend', '@frontend'],
        description: "Full-stack features — Architect plans, Backend and Frontend build in parallel",
      },
    ],
    defaultAgent: '@architect',
    fallback: 'coordinator',
  }),

  casting: defineCasting({
    allowlistUniverses: ['Ocean\'s Eleven', 'The Matrix', 'Firefly', 'Breaking Bad'],
    overflowStrategy: 'generic',
  }),
});
