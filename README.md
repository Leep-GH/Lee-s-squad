# Lee's Squad

A PRD-driven AI build team. You talk to Architect. Architect runs the team.

## Prerequisites

Install the Squad CLI once:
```powershell
npm install -g @bradygaster/squad-cli
```

## Setup — run once per project

Open your project in VS Code, then in the terminal:

```powershell
squad init
& "C:\Users\leep1\GitHub\Lee-s-squad\scripts\new-project.ps1" -Existing
```

That's it. Your agents are now installed.

## How to use

1. Open **Copilot Chat** in VS Code (`Ctrl+Alt+I`)
2. Click the agent dropdown and select **Architect**
3. Describe what you want to build:
   ```
   I want to build [your idea or paste your PRD here]
   ```
4. Architect asks 3–5 clarifying questions — answer them
5. Architect presents a **written build plan** — you approve it
6. Architect delegates to the team — they build it

## The Team

| Agent | Role | When to use |
|-------|------|-------------|
| **Architect** | Tech Lead | Start here — always |
| **Backend** | Backend Developer | APIs, auth, server logic |
| **Frontend** | Frontend Developer | UI, components, client state |
| **Data** | Data Engineer | Schema, migrations, queries |
| **QA** | QA Engineer | Tests, acceptance sign-off |
| Squad | Coordinator | Routes work automatically |
