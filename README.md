<div align="center">

# 🍷 Burgandy — Angular Frontend

**Customer-facing Angular 21+ frontend for the Burgandy fashion & clothing reservation system.**  
Standalone Components · Tailwind CSS · RTL-Ready · SSR · API-Integrated

[![Angular](https://img.shields.io/badge/Angular-21+-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SSR](https://img.shields.io/badge/SSR-Angular_SSR-DD0031?style=flat-square&logo=angular)](https://angular.dev/guide/ssr)
[![Node](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Highlights](#-highlights)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Requirements](#-requirements)
- [Quick Start](#-quick-start)
- [Scripts](#-scripts)
- [Configuration](#-configuration)
- [API Integration](#-api-integration)
- [Notes](#-notes)
- [Additional Docs](#-additional-docs)

---

## 🧭 Overview

**Burgandy Frontend** is the customer-facing layer of the Burgandy reservation platform — a fashion and clothing rental/retail app. It connects to the [Burgandy API](../BurgandyApi/) to provide a seamless browsing and reservation experience, built with a mobile-first, RTL-aware design system.

---

## ✨ Highlights

- ⚡ **Angular 21+ standalone architecture** — no NgModules, fully tree-shakable
- 🎨 **Tailwind CSS** with a custom burgundy design palette
- 📱 **Mobile-first responsive UI** across all screen sizes
- 🌍 **RTL / Arabic-ready** layout and typography
- 🔌 **Full API integration** — settings, categories, products, and reservations
- 🖥 **SSR-ready** via Angular SSR + Express 5 for fast initial loads
- 🧪 **Testing** with Angular unit test runner and Vitest

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 21+ |
| Language | TypeScript 5.9 (strict mode) |
| Styling | Tailwind CSS 3 |
| SSR | Angular SSR + Express 5 |
| Testing | Angular test runner + Vitest |
| Build | Angular CLI |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/         # TypeScript interfaces and types
│   │   └── services/       # API services and shared logic
│   ├── features/           # Feature modules (products, reservations, etc.)
│   └── shared/             # Reusable standalone components
├── environments/
│   ├── environment.ts      # Development config (API base URL, flags)
│   └── environment.prod.ts # Production config
├── assets/                 # Static assets (images, icons, fonts)
└── styles.css              # Global styles and Tailwind imports
```

**Key config files at root:**

| File | Purpose |
|------|---------|
| `tailwind.config.js` | Custom palette and theme extensions |
| `src/proxy.conf.json` | Dev proxy to backend API |
| `angular.json` | Build targets and SSR config |

---

## ✅ Requirements

- **Node.js** 18 or higher — [download](https://nodejs.org/)
- **npm** 11 or higher (bundled with Node)
- **Burgandy API** running at `https://localhost:7156/api`

> See the [backend README](../README.md) for API setup instructions.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
```

Open your browser at **[http://localhost:4200](http://localhost:4200)**.

> The dev server proxies `/api` requests to the backend via `src/proxy.conf.json` — make sure the API is running first.

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the development server at `localhost:4200` |
| `npm run build` | Production build — output to `dist/` |
| `npm run watch` | Incremental build in watch mode |
| `npm test` | Run unit tests |

---

## ⚙️ Configuration

### API Base URL

Update the API base URL in `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7156/api'
};
```

For production, update `environment.prod.ts` accordingly.

### Dev Proxy

`src/proxy.conf.json` handles `/api` request forwarding during development:

```json
{
  "/api": {
    "target": "https://localhost:7156",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Tailwind

Customize the design system in `tailwind.config.js`. The default config extends Tailwind with a burgundy-focused color palette. Tailwind is imported globally via `src/styles.css`.

---

## 📡 API Integration

The frontend expects JSON responses in the following shape from the backend:

```ts
{
  statusCode: number;
  message: string;
  data: T;
}
```

### Endpoints Used

| Feature | Method | Endpoint |
|---------|--------|----------|
| Store settings | `GET` | `/api/Settings` |
| Update settings | `PUT` | `/api/Settings` |
| All categories | `GET` | `/api/Categories?activeOnly=true` |
| Single category | `GET` | `/api/Categories/{id}` |
| All products | `GET` | `/api/Products` |
| Single product | `GET` | `/api/Products/{id}` |
| Create reservation | `POST` | `/api/Reservations` |
| Track reservation | `GET` | `/api/Reservations/track` |

> For detailed integration steps and mock data, refer to [`API_INTEGRATION_CHECKLIST.md`](./API_INTEGRATION_CHECKLIST.md).

---

## 📝 Notes

- **CORS**: The backend must allow `http://localhost:4200` during development. This is configured on the API side.
- **Production output**: Build artifacts are placed under `dist/` after `npm run build`.
- **RTL support**: The layout is designed with RTL-readiness in mind. Arabic text rendering is handled via global typography styles in `styles.css`.
- **SSR**: The server-side rendering entry is configured in `angular.json` under the `server` build target, served via Express 5.

---

## 📚 Additional Docs

- [`API_INTEGRATION_CHECKLIST.md`](./API_INTEGRATION_CHECKLIST.md) — Step-by-step backend integration guide
- [`FRONTEND_SETUP_COMPLETE.md`](./FRONTEND_SETUP_COMPLETE.md) — Full setup and environment notes

---

<div align="center">

Built with Angular 21 · Styled with Tailwind · Powered by Burgandy API

</div>
