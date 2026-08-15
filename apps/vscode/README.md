# APISentry - API Contract Guard

> **Automatically catch frontend ↔ backend API contract mismatches before runtime.**

APISentry is a local-first static-analysis engine and extension for VS Code, Cursor, and Antigravity IDE. It scans your JavaScript and TypeScript codebase to catch broken API integrations between your frontend (React, Next.js, Axios, Fetch) and your backend (Node.js, Express, Zod) before you even run your application.

---

## ✨ Key Features

- 🛡️ **Instant Static Contract Verification**: Scans Axios calls, Fetch requests, Express routes, and Zod schemas without needing OpenAPI or Swagger docs.
- ⚡ **Auto-Activation & Instant Status Bar**: Shows `$(shield) APISentry: Healthy` or error counters right on your status bar.
- 🗺️ **Nested Express Router Resolution**: Resolves complex nested Express route prefix chains like `app.use('/api', apiRouter)`, `apiRouter.use('/users', usersRouter)`, `usersRouter.get('/:id', handler)`.
- 🔍 **Request & Response Field Diffing**: Highlights missing required fields (e.g. `firstName`, `lastName`) and unexpected fields (e.g. `fullName`).
- 🌐 **Instant IDE Web Preview**: Built-in interactive Webview panel and Web Preview dashboard to visualize endpoints, metric cards, and contract diffs.

---

## 🚀 How to Use

1. Open any React/Next.js + Express project.
2. Click **`$(shield) APISentry`** on the status bar or run **`APISentry: Scan Workspace`** from the Command Palette (`Cmd+Shift+P`).
3. Click any diagnostic issue to jump directly between the frontend caller and backend definition file line!
