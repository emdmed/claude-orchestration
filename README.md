# agent-orchestration

CLI tool to scaffold agent orchestration workflows into your project.

## Usage

```bash
npx agent-orchestration
```

This will create a `.orchestration/` directory with workflow templates:

```
.orchestration/
  orchestration.md
  workflows/
    react/
      feature.md
      bugfix.md
      refactor.md
      performance.md
      review.md
      pr.md
      docs.md
```

## What it does

1. Copies workflow templates to `.orchestration/` in your project
2. Appends orchestration reference to your `ORCHESTRATION.md` (if it exists)

## Workflows

| Workflow | Use When |
|----------|----------|
| `feature.md` | Building new functionality |
| `bugfix.md` | Diagnosing and fixing bugs |
| `refactor.md` | Improving code without behavior changes |
| `performance.md` | Profiling and optimizing performance |
| `review.md` | Reviewing code for merge |
| `pr.md` | Generating PR title and description |
| `docs.md` | Writing documentation |

The tool auto-detects React projects and routes to React-specific workflows with React 18 best practices.

## License

MIT
