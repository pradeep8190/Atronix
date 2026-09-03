---
name: atronix-auditor
description: Automated code quality, props parity, and WebGL shader standards inspector for Atronix UI components.
---

# Atronix Quality Auditor Skill

This skill allows Antigravity agents to instantly audit all UI components in Atronix for:
1. **Zero Fluff**: Dead or unused props declared in TypeScript interfaces.
2. **100% Props Parity**: Ensuring all component props are documented in the respective `Footer.tsx` table.
3. **Shader Bleed Rule**: Verifying WebGL Signed Distance Field canvases have negative offset padding buffers (`-20px` to `-35px`).
4. **Registry Integrity**: Ensuring every component has a dedicated file in `src/data/registry/`.

## Running the Audit

Execute the automated inspector from the workspace root:
```bash
npm run audit
```
or
```bash
node scripts/audit-quality.js
```
