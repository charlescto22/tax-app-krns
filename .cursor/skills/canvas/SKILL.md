---
name: canvas
description: >-
  REQUIRED for this project. Use Cursor Canvas (content windows) to optimize
  presentation of standalone analytical artifacts — feature matrices, admin
  workflows, security/auth reviews, architecture summaries, metrics tables,
  timelines, charts, and any multi-section status report. Prefer a canvas over
  long markdown tables or walls of chat text. Also read this skill whenever
  creating, editing, or debugging any .canvas.tsx file.
metadata:
  surfaces:
    - ide
    - cloud
  required: true
  project: tax-app-krns
---

# Canvas (required — content windows optimization)

This project **requires** the Canvas skill so agents deliver structured work in a **content window** (live React canvas beside chat) instead of flooding the chat context with large tables and reports.

A canvas is a single `.canvas.tsx` file. Follow the workflow below in order.

- If the `cursor-cloud-publish-shared-canvas` MCP tool is available (Cloud Agent), use **Share URL (cloud)**. Do not link a VM file path.
- Otherwise (local IDE/CLI), use **File beside chat (local)**.

## When this skill is REQUIRED (this repo)

Always use a canvas for:

- Unified User Admin / RBAC / device / SSO / password workflow summaries
- Security or Firestore rules audits with categorized findings
- Architecture or feature overviews with tables/matrices
- Metrics, charts, timelines, or comparison tables (> a few rows)
- Standalone analytical artifacts the user will reopen later

Skip the canvas for:

- Ordinary code edits, PR text, or one-line answers
- Work the user asked to land in a specific other tool
- Targeted debugging while implementing a fix

## Workflow

### 1. Decide

Ask: would the user benefit from this as its **own standalone artifact**? If yes → canvas.

### 2. Write the canvas

**Location**

- Cloud: `~/.cursor/projects/<workspace>/canvases/<name>.canvas.tsx`
- Local: workspace managed `canvases/<name>.canvas.tsx` under the Cursor projects path

Write the file directly there. Use kebab-case names ending in `.canvas.tsx`.

**File rules**

- Exactly one `.canvas.tsx` per canvas
- Import **only** from `cursor/canvas`
- Default-export the top-level component
- Embed all data inline — no `fetch()` / network

**Never render empty states.** Omit sections with no data.

**Label every plot** with title, axis units, legend when needed, and source/time range.

**Component discovery:** read `~/.cursor/skills-cursor/canvas/sdk/index.d.ts` (and siblings) for exact exports.

### 3. Design (content windows optimization)

- Flat, minimal, purposeful — no gradients, emojis, box-shadows, or rainbow coloring
- Clear visual hierarchy; one primary focus
- Colors only from `useHostTheme()` tokens — no hardcoded hex
- Mix open sections with cards; avoid a wall of identical cards

### 4. Publish / introduce

- Cloud: after write, call `cursor-cloud-publish-shared-canvas` with a stable `canvasKey`; link the returned `shareUrl`
- Local: link the absolute `.canvas.tsx` path
- First canvas in the workspace: one sentence explaining what a canvas is

## Pre-delivery check

1. Hierarchy clear (one standout)?
2. Composition not a single column of identical blocks?
3. No forbidden slop patterns?
4. Share URL or file link included in the chat reply?
