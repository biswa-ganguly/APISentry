# APISentry - API Contract Guard 🛡️

> **Catch frontend ↔ backend API contract mismatches before runtime.**

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-v1.3.0-blue.svg)](https://marketplace.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Engine](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/support-VS%20Code%20%7C%20Cursor%20%7C%20Antigravity-purple.svg)](https://github.com/biswa-ganguly/APISentry)

**APISentry** is a production-ready, local-first static-analysis engine and extension for **VS Code**, **Cursor**, and **Antigravity IDE**. It scans JavaScript, TypeScript, and Python codebases to catch broken API integrations between your frontend (React, Next.js, Axios, Fetch) and your backend (Node.js/Express, Zod, Python FastAPI, Flask, Django REST Framework) before runtime.

---

## 🏗️ Monorepo Architecture

APISentry is built as a high-performance modular monorepo powered by `pnpm`:

```text
APISentry Monorepo
├── apps/
│   ├── vscode/       # VS Code / Cursor / Antigravity Extension & Webview Panel
│   └── cli/          # CLI tool (`apisentry scan`, `apisentry preview`)
└── packages/
    ├── analyzer/     # Core static analysis & AST project scanner
    ├── adapters/     # Polyglot adapters (Axios, Fetch, Express, FastAPI, Flask, Django, Zod)
    ├── contract-engine/ # Path matching, request/response schema diffing engine
    ├── ui/           # React dashboard & design system component library
    ├── types/        # TypeScript contract domain models
    ├── shared/       # Common utilities & path normalizers
    └── config/       # Zod configuration validator (.apisentry.json)
```

---

## ✨ Production Features

### 🛡️ Polyglot Backend Adapters
- **Express.js (Node.js)**: Resolves complex nested router chains (`app.use('/api', apiRouter)`, `router.use('/users', usersRouter)`, `usersRouter.get('/:id', handler)`).
- **FastAPI (Python)**: Statically parses `@app.get`, `@router.post`, and extracts expected payload schemas from Pydantic models (`class BaseModel`).
- **Flask (Python)**: Resolves `@app.route` and `@blueprint.route` decorator verbs and route converter parameters (`<int:item_id>` → `:item_id`).
- **Django REST Framework (Python)**: Resolves `path('api/v1/orders/', ...)` route definitions and parameters.

### 🌐 Frontend Client Analyzers
- **Axios & Native Fetch**: Statically analyzes `axios.post()`, `axios.get()`, `fetch()`, custom API instances, and dynamic URL template literals.
- **Zero OpenAPI/Swagger Needed**: Infers API contracts directly from source code without requiring external specs or runtime server traffic.

### 🔍 Static Contract Verification Engine
- **Missing Required Fields**: Highlights payload fields expected by the backend but omitted in frontend API calls (e.g., missing `firstName` or `lastName`).
- **Unexpected Fields**: Flags fields sent by frontend that backend validators (Zod / Pydantic) do not recognize.
- **HTTP Method Mismatches**: Catches frontend `POST` requests targeted at backend `PUT` or `GET` endpoints.
- **Unresolved & Broken Endpoints**: Identifies frontend API calls pointing to non-existent backend routes.

### 📊 Webview & Live Web Preview Dashboard
- **Interactive Endpoint Sidebar**: Browse all discovered frontend and backend endpoints with method badges (`GET`, `POST`, `PUT`, `DELETE`).
- **Click-to-Filter Issues**: Click any endpoint in the sidebar to instantly filter contract issues for that endpoint.
- **Responsive Dual-Panel UI**: Screen-fitted dual column layout with independent scrolling and zero empty space gaps.
- **One-Click Code Navigation**: Click any location link (e.g., `📍 api.ts:4:10`) to jump directly to the exact source code line in the editor.

---

## ⚡ CLI Usage & Development

### Installation & Build

```bash
# Clone the repository
git clone https://github.com/biswa-ganguly/APISentry.git
cd APISentry

# Install dependencies
pnpm install

# Build all monorepo packages
pnpm build

# Run unit & integration tests
pnpm test
```

### Running Live Preview Server

```bash
# Start APISentry live preview web server
pnpm preview
```

### Packaging the Extension (.vsix)

```bash
# Build extension package
cd apps/vscode
npx vsce package --allow-missing-repository --no-dependencies
```

Package artifacts are placed in [`versions/`](file:///Users/biswaganguly/Desktop/APISentry/versions/).

---

## 📄 License

MIT © [APISentry](https://github.com/biswa-ganguly/APISentry)
