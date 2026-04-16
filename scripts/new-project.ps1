#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Bootstrap a project with Lee's Squad build team.

.DESCRIPTION
    Two modes:
      -Name "my-app"   Creates a new folder, runs squad init, overlays Lee's Squad agents.
      -Existing        Overlays Lee's Squad agents into the current folder (must already have squad init run).

.EXAMPLE
    .\scripts\new-project.ps1 -Name "my-app"
    .\scripts\new-project.ps1 -Name "my-api" -Path "C:\Projects"
    .\scripts\new-project.ps1 -Existing

.PARAMETER Name
    The project name (used as the folder name). Required unless -Existing is used.

.PARAMETER Path
    Parent directory where the project folder will be created. Defaults to the current directory.

.PARAMETER Existing
    Apply Lee's Squad agents to the current directory (must have run squad init first).
#>

param(
    [string]$Name,

    [string]$Path = (Get-Location).Path,

    [switch]$Existing
)

if (-not $Existing -and -not $Name) {
    Write-Host "  ERROR: Provide -Name for a new project, or -Existing to activate in the current folder." -ForegroundColor Red
    exit 1
}

$ErrorActionPreference = "Stop"

$SquadRepoDir = $PSScriptRoot | Split-Path -Parent
$SquadSrc     = Join-Path $SquadRepoDir ".squad"

if ($Existing) {
    # ── Existing project mode ─────────────────────────────────────────────────
    $ProjectDir = (Get-Location).Path
    $Name = Split-Path $ProjectDir -Leaf
    Write-Host ""
    Write-Host "  Activating Lee's Squad in: $ProjectDir" -ForegroundColor Cyan
    Write-Host ""
    if (-not (Test-Path (Join-Path $ProjectDir ".squad"))) {
        Write-Host "  ERROR: No .squad folder found. Run 'squad init' first, then re-run this script with -Existing." -ForegroundColor Red
        exit 1
    }
} else {
    # ── New project mode ──────────────────────────────────────────────────────
    $ProjectDir = Join-Path $Path $Name
    Write-Host ""
    Write-Host "  Creating project: $Name" -ForegroundColor Cyan
    Write-Host "  Location:         $ProjectDir" -ForegroundColor DarkGray
    Write-Host ""
    if (Test-Path $ProjectDir) {
        Write-Host "  ERROR: '$ProjectDir' already exists. Use a different name or -Existing." -ForegroundColor Red
        exit 1
    }
    New-Item -ItemType Directory -Path $ProjectDir | Out-Null
    Set-Location $ProjectDir
    git init --quiet
    git checkout -b dev 2>$null
    Write-Host "  Running squad init..." -ForegroundColor DarkGray
    squad init --no-interactive 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Output "y" | squad init 2>$null
    }
}

# ── 4. Overlay your custom .squad/ configuration ──────────────────────────────
Write-Host "  Applying custom team configuration..." -ForegroundColor DarkGray

$DestSquad  = Join-Path $ProjectDir ".squad"
$GithubSrc  = Join-Path $SquadRepoDir ".github"
$DestGithub = Join-Path $ProjectDir ".github"

# Copy .github/agents/ — these populate the VS Code agent dropdown
$GithubAgentsSrc  = Join-Path $GithubSrc "agents"
$GithubAgentsDest = Join-Path $DestGithub "agents"
if (-not (Test-Path $GithubAgentsDest)) { New-Item -ItemType Directory -Path $GithubAgentsDest -Force | Out-Null }
$AgentFiles = @("architect.agent.md","backend.agent.md","frontend.agent.md","data.agent.md","qa.agent.md","squad.agent.md")
foreach ($f in $AgentFiles) {
    $src = Join-Path $GithubAgentsSrc $f
    if (Test-Path $src) { Copy-Item $src $GithubAgentsDest -Force }
}

# Copy .github/copilot-instructions.md
$copilotSrc = Join-Path $GithubSrc "copilot-instructions.md"
if (Test-Path $copilotSrc) { Copy-Item $copilotSrc $DestGithub -Force }

# Copy agent charters (your 5 agents + scribe)
$AgentsToCopy = @("architect","backend","frontend","data","qa","scribe")
foreach ($agent in $AgentsToCopy) {
    $src  = Join-Path $SquadSrc "agents\$agent"
    $dest = Join-Path $DestSquad "agents\$agent"
    if (Test-Path $src) {
        if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }
        Copy-Item "$src\*" $dest -Recurse -Force
    }
}

# Copy team config files
$FilesToCopy = @(
    "team.md",
    "routing.md",
    "ceremonies.md",
    "casting-policy.json"
)
foreach ($file in $FilesToCopy) {
    $src  = Join-Path $SquadSrc $file
    $dest = Join-Path $DestSquad $file
    if (Test-Path $src) {
        Copy-Item $src $dest -Force
    }
}

# Copy skills
$SkillsToCopy = @("prd-intake")
foreach ($skill in $SkillsToCopy) {
    $src  = Join-Path $SquadSrc "skills\$skill"
    $dest = Join-Path $DestSquad "skills\$skill"
    if (Test-Path $src) {
        if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Recurse | Out-Null }
        Copy-Item "$src\*" $dest -Recurse -Force
    }
}

# ── 5. Write a minimal squad.config.ts ───────────────────────────────────────
$squadConfig = @"
import { defineSquad, defineTeam, defineAgent, defineRouting, defineCasting } from '@bradygaster/squad-sdk';

export default defineSquad({
  version: '1.0.0',

  team: defineTeam({
    name: '$Name',
    description: 'PRD-driven build team for $Name.',
    projectContext: '- **Stack:** TBD — Architect will confirm during planning\n- **Workflow:** PRD → Architect → specialists → merge to dev',
    members: ['architect', 'backend', 'frontend', 'data', 'qa', 'scribe'],
  }),

  agents: [
    defineAgent({ name: 'architect', role: 'Tech Lead',          description: 'PRD intake, planning, architecture, delegation.', status: 'active' }),
    defineAgent({ name: 'backend',   role: 'Backend Developer',  description: 'APIs, server logic, auth, integrations.', status: 'active' }),
    defineAgent({ name: 'frontend',  role: 'Frontend Developer', description: 'UI components, pages, client state, API integration.', status: 'active' }),
    defineAgent({ name: 'data',      role: 'Data Engineer',      description: 'Schema design, migrations, ORM models, queries.', status: 'active' }),
    defineAgent({ name: 'qa',        role: 'QA Engineer',        description: 'Tests, acceptance sign-off, CI quality gates.', status: 'active' }),
    defineAgent({ name: 'scribe', role: 'Scribe',               description: 'Session logging and decision merging (silent).', status: 'active' }),
  ],

  routing: defineRouting({
    rules: [
      { pattern: 'prd|plan|feature|design|architect|scope|requirement', agents: ['@architect'], description: 'PRD intake, planning, architecture' },
      { pattern: 'api|endpoint|server|backend|auth|integration|webhook', agents: ['@backend'],  description: 'Backend implementation' },
      { pattern: 'ui|component|page|frontend|css|style|form|layout',    agents: ['@frontend'], description: 'Frontend implementation' },
      { pattern: 'database|schema|migration|query|orm|sql',             agents: ['@data'],     description: 'Data layer' },
      { pattern: 'test|spec|coverage|e2e|qa|quality|acceptance',        agents: ['@qa'],       description: 'Testing and acceptance' },
    ],
    defaultAgent: '@architect',
    fallback: 'coordinator',
  }),

  casting: defineCasting({
    allowlistUniverses: ["Ocean's Eleven", 'The Matrix', 'Firefly', 'Breaking Bad'],
    overflowStrategy: 'generic',
  }),
});
"@

Set-Content -Path (Join-Path $ProjectDir "squad.config.ts") -Value $squadConfig -Encoding UTF8

# ── 6. Remove old default agent folders that don't belong ───────────────────
$DefaultAgents = @("scribe","ralph","_alumni")
Get-ChildItem (Join-Path $DestSquad "agents") -Directory |
    Where-Object { $_.Name -notin ($AgentsToCopy + $DefaultAgents) } |
    ForEach-Object { Remove-Item $_.FullName -Recurse -Force }

# ── 7. Done ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ✓ Project ready at: $ProjectDir" -ForegroundColor Green
Write-Host ""
Write-Host "  Your team:" -ForegroundColor White
Write-Host "    Architect — Tech Lead (start here: hand Architect your PRD)" -ForegroundColor DarkCyan
  Write-Host "    Backend   — Backend Developer" -ForegroundColor DarkCyan
  Write-Host "    Frontend  — Frontend Developer" -ForegroundColor DarkCyan
  Write-Host "    Data      — Data Engineer" -ForegroundColor DarkCyan
  Write-Host "    QA        — QA Engineer" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "    1. cd $Name" -ForegroundColor DarkGray
Write-Host "    2. Open in VS Code: code ." -ForegroundColor DarkGray
Write-Host "    3. In Copilot Chat: '@squad Hey Architect, I want to build...' and paste your PRD" -ForegroundColor DarkGray
Write-Host ""
