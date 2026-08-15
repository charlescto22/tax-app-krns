# IEC Taxation Design Guidelines

## Brand

* Product name is **IEC Taxation** (`appName`). Prefer `t("appName")` over hard-coded titles.
* Use `BrandMark` for the IEC mark (navy field + gold ring). Do not invent new logo squares with `bg-blue-600`.
* Visual direction: State Authority — deep cyan-navy primary `#0A4D68`, cool mist canvas `#EEF2F5`, gold seal accent `#C9A227` (rare).

## Tokens

* Prefer semantic classes: `bg-primary`, `text-primary-foreground`, `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`.
* Do not use raw `bg-blue-600` / `hover:bg-blue-700` for primary actions. Use `bg-primary hover:bg-primary/90`.
* Status colors may use existing green / orange / red / purple utilities for badges and alerts only.

## Layout

* Keep the admin shell: sticky header + fixed sidebar + main content (`max-w-7xl`).
* One primary CTA per section. Use outline/ghost for secondary actions.
* Use `PageHeader` for page titles and short supporting copy.

## Typography & language

* UI font: Source Sans 3 + Noto Sans Myanmar. Do not add Inter/Roboto/Arial.
* All user-facing chrome should support EN/MY via `useLanguage()` / `t()`.

## Motion

* Login: brand + form entrance (`login-enter`).
* Sidebar: active nav transition (`nav-item-active`).
* Page switch: short fade (`page-enter`).
* Avoid decorative animation noise.
