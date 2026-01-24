# claude-orchestration

CLI tool to scaffold Claude orchestration workflows into your project.

## Usage

```bash
npx claude-orchestration
```

This will create a `.claude/` directory with workflow templates:

```
.claude/
  orchestration.md
  workflows/
    react/
      feature.md
      bugfix.md
      refactor.md
      pr.md
      docs.md
```

## What it does

1. Copies workflow templates to `.claude/` in your project
2. Appends orchestration reference to your `CLAUDE.md` (if it exists)

## Workflows

| Workflow | Use When |
|----------|----------|
| `feature.md` | Building new functionality |
| `bugfix.md` | Diagnosing and fixing bugs |
| `refactor.md` | Improving code without behavior changes |
| `pr.md` | Creating pull requests |
| `docs.md` | Writing documentation |

The tool auto-detects React projects and routes to React-specific workflows with React 18 best practices.

## License

MIT
