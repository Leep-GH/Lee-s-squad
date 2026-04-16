# Lee's Squad

A PRD-driven AI build team. You talk to the Architect. The Architect runs the team.

## Workflow

### 1. Open your project in VS Code

New or existing — doesn't matter.

### 2. Activate the squad in the terminal

**New project:**
```powershell
.\scripts\new-project.ps1 -Name "my-app"
cd my-app
code .
```

**Existing project:**
```powershell
squad init
```

### 3. Talk to Architect

In VS Code Copilot Chat, select **Architect** from the agent dropdown, then describe what you want to build:

```
Hey Architect, I want to build [describe your idea or paste your PRD]
```

### 4. Architect asks questions

Architect will ask 3–5 clarifying questions — stack, scope, key constraints. Answer them and Architect produces a written build plan for your sign-off.

### 5. Architect runs the team

Once you approve the plan, Architect delegates to the right specialists. No code starts without your approval.

## The Team

| Agent | Role |
|-------|------|
| Architect | Tech Lead — your main contact. Takes your brief, asks questions, plans, delegates. |
| Backend | Server, APIs, auth, integrations |
| Frontend | UI, components, client state |
| Data | Schema, migrations, queries |
| QA | Tests, acceptance sign-off |
| Scribe | Logs decisions silently in the background |
| Ralph | Autonomous issue dispatch — runs watch mode when you step away |

## Prerequisites

```powershell
npm install -g @bradygaster/squad-cli
```
