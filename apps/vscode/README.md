# APISentry - API Contract Guard 🛡️

> **Catch frontend ↔ backend API contract mismatches before runtime.**

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-v1.3.0-blue.svg)](https://marketplace.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Engine](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/support-VS%20Code%20%7C%20Cursor%20%7C%20Antigravity-purple.svg)](https://github.com/biswa-ganguly/APISentry)

**APISentry** is a local-first, zero-config static analysis engine and extension for **VS Code**, **Cursor**, and **Antigravity IDE**. It statically parses your codebase to detect broken API contracts between your frontend callers (React, Next.js, Axios, Fetch) and your backend endpoints (Node.js/Express, Python FastAPI, Flask, Django REST Framework) before you run your application or deploy to production.

---

## ✨ Production Features

### 🛡️ Multi-Language Backend & Polyglot Engine
- **Node.js / Express**: Resolves complex nested router chains (`app.use('/api', apiRouter)`, `router.use('/users', usersRouter)`, `usersRouter.get('/:id', handler)`).
- **Python FastAPI**: Statically parses `@app.get`, `@router.post`, and extracts expected payload schemas from Pydantic models (`class BaseModel`).
- **Python Flask**: Resolves `@app.route` and `@blueprint.route` decorator verbs and route converter parameters (`<int:item_id>` → `:item_id`).
- **Django REST Framework**: Resolves `path('api/v1/orders/', ...)` route definitions and parameters.

### 🌐 Frontend Client Verification
- **Axios & Native Fetch**: Statically analyzes `axios.post()`, `axios.get()`, `fetch()`, custom API instances, and dynamic URL template literals.
- **Zero OpenAPI/Swagger Needed**: Infers API contracts directly from source code without requiring external specs or runtime server traffic.

### ⚡ Auto-Activation & Status Bar Health Indicator
- **Instant Status Bar**: Displays `$(shield) APISentry: Healthy` or live error counters right in your IDE status bar.
- **Background File Watcher**: Automatically rescans modified files in real time as you edit frontend or backend code.

### 🔍 Request & Response Field Diffing
- **Missing Required Fields**: Highlights payload fields expected by the backend but omitted in frontend API calls (e.g., missing `firstName` or `lastName`).
- **Unexpected Fields**: Flag fields sent by frontend that backend validators (Zod / Pydantic) do not recognize.
- **HTTP Method Mismatches**: Catches frontend `POST` requests targeted at backend `PUT` or `GET` endpoints.
- **Unresolved & Broken Endpoints**: Identifies frontend API calls pointing to non-existent backend routes.

### 📊 Production Webview & Web Preview Dashboard
- **Interactive Endpoint Sidebar**: Browse all discovered frontend and backend endpoints with method badges (`GET`, `POST`, `PUT`, `DELETE`).
- **Click-to-Filter Issues**: Click any endpoint in the sidebar to instantly filter contract issues for that endpoint.
- **Responsive Dual-Panel UI**: Screen-fitted dual column layout with independent scrolling and zero empty space gaps.
- **One-Click Code Navigation**: Click any location link (e.g., `📍 api.ts:4:10`) to jump directly to the exact source code line in the editor.

---

## 🚀 How to Use

### 1. Open Your Project
Open any monorepo or single-repository project combining React/Next.js frontend with Express or Python backends in VS Code, Cursor, or Antigravity IDE.

### 2. Run Workspace Scan
- Click **`$(shield) APISentry`** in the status bar, or
- Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and execute **`APISentry: Scan Workspace`**.

### 3. Inspect Issues & Fix
- Check the **API Contract Guard** sidebar view in your activity bar.
- View inline squiggly diagnostics in your source files.
- Click **`APISentry: Open Contract Explorer`** to open the interactive live webview dashboard.

---

## 🛠️ Supported Tech Stack Matrix

| Category | Supported Frameworks & Libraries |
| :--- | :--- |
| **Frontend Clients** | React, Next.js, Axios, Native `fetch()` API |
| **Node.js Backend** | Express.js, Zod Schema Validation |
| **Python Backend** | FastAPI (Pydantic), Flask, Django REST Framework |
| **IDE Platforms** | VS Code, Cursor, Antigravity IDE |

---

## 📦 Extension Commands

| Command | Title | Description |
| :--- | :--- | :--- |
| `apisentry.scanWorkspace` | `APISentry: Scan Workspace` | Runs full static analysis across workspace files. |
| `apisentry.refreshContracts` | `APISentry: Refresh Contracts` | Rescans workspace and updates status bar and diagnostics. |
| `apisentry.openContractExplorer` | `APISentry: Open Contract Explorer` | Launches the interactive Webview dashboard. |

---

## 📄 License

MIT © [APISentry](https://github.com/biswa-ganguly/APISentry)
