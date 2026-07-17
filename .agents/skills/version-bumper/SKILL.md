---
name: version-bumper
description: Automates project version bumping across code, config, and documentation. Updates src/version.ts, package.json, README.md, and release history files. Use when the user requests a version bump (e.g., "bump to 1.5.2").
---

# Version Bumper

This skill handles multi-file orchestration to bump the application version with maximum context efficiency.

## 🛠 Strategic Approach

To keep the session fast and minimize history bloat, **delegate the batch editing phase to the `generalist` sub-agent**.

## Workflow

### 1. Fast Research (1 Turn)

Gather current version and recent context in a single parallel command:

- `git log -n 15 --oneline && grep "APP_VERSION" src/version.ts && grep "\"version\"" package.json && head -n 3 README.md && head -n 10 docs/RELEASE_HISTORY.md`

### 2. Strategy & Draft

Briefly state the new version and draft the release notes based on the project format in `docs/RELEASE_HISTORY.md`.

### 3. Execution (Delegated)

Invoke the `generalist` sub-agent to apply all changes across the 5 target files. This prevents the main session from ballooning with repetitive file edits.

- **Files:** `src/version.ts`, `package.json`, `README.md`, `docs/RELEASE_HISTORY.md`, `docs/DEVELOPMENT_STATUS.md`.
- **Instruction:** "Update these 5 files to version X.Y.Z and add these release notes: [DRAFT]".

### 4. Verification & Finalization

- Verify `src/version.ts` matches the target version.
- Perform a single consolidated commit:
  `git add src/version.ts package.json README.md docs/RELEASE_HISTORY.md docs/DEVELOPMENT_STATUS.md && git commit -m "chore: bump version to vX.Y.Z"`
