# Orchestration Protocol

**MANDATORY: Process this file BEFORE any tool usage.**

---

## 1. CLASSIFY TASK

### ⛔ STOP CHECKPOINT #1

| Signal Words | Workflow |
|--------------|----------|
| build, create, add, implement, new | `feature.md` |
| fix, broken, error, crash, bug | `bugfix.md` |
| clean up, improve, restructure, rename | `refactor.md` |
| slow, optimize, performance, speed | `performance.md` |
| review, check, PR, merge | `review.md` |
| PR description, pull request title | `pr.md` |
| document, README, explain | `docs.md` |
| complex, multi-step, plan | `todo.md` |

**Complexity:** 1-2 ops (simple) | 3+ ops (complex → also use `todo.md`)

**Technology:** React (`.jsx`/`.tsx`, react imports, hooks) → `workflows/react/` | Other → `workflows/`

---

## 2. DECLARE BINDING

### ⛔ STOP CHECKPOINT #2

Before ANY tool use, declare:

```
ORCHESTRATION_BINDING:
- Task: [description]
- Classification: [workflow]
- Workflow: [path]
- Complexity: [1-2 ops / 3+ ops]
- Technology: [React / Other / N/A]
```

---

## 3. EXEMPT TASKS

Exemption requires ALL: single file, 1-2 ops, zero architectural impact, obvious correctness, no debugging.

**NOT exempt:** "quick bug fix" (needs investigation), "small feature" (needs context), "make it faster" (needs measurement).

Exempt binding:
```
ORCHESTRATION_BINDING:
- Task: [description]
- Classification: EXEMPT
- Justification: [criteria met]
```

---

## 4. VIOLATIONS

| Type | Indicator |
|------|-----------|
| Missing Binding | Tool use without declaration |
| Premature Tool Use | Edit before workflow read |
| Scope Creep | Unplanned files modified |
| False Exemption | Exempt claim for complex task |

**Self-correct:** STOP → DECLARE violation → RETURN to checkpoint → REBIND → CONTINUE

---

## 5. EXECUTION

**Pre-Work:** Binding declared, workflow read, "Before Coding" answered

**Mid-Work:** Within scope, no unplanned files, todo tracking if 3+ ops

**Completion:** Validation done, then declare:
```
ORCHESTRATION_COMPLETE:
- Task: [description]
- Workflow: [used]
- Files: [modified]
```

---

## 6. WORKFLOW REFERENCE

| Workflow | React | Other |
|----------|-------|-------|
| feature | `workflows/react/feature.md` | `workflows/feature.md` |
| bugfix | `workflows/react/bugfix.md` | `workflows/bugfix.md` |
| refactor | `workflows/react/refactor.md` | `workflows/refactor.md` |
| performance | `workflows/react/performance.md` | `workflows/performance.md` |
| review | `workflows/react/review.md` | `workflows/review.md` |
| pr | `workflows/react/pr.md` | `workflows/pr.md` |
| docs | `workflows/react/docs.md` | `workflows/docs.md` |
| todo | `workflows/react/todo.md` | `workflows/todo.md` |
