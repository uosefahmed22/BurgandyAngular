# Burgandy Angular Frontend

Customer-facing Angular 21+ frontend for the Burgandy fashion/clothing reservation system. The app is built with standalone components, Tailwind CSS, RTL-ready layout support, and is wired to the Burgandy API.

## Highlights
- Angular 21+ standalone architecture with strict TypeScript
- Tailwind CSS with a custom burgundy palette
- Mobile-first responsive UI
- RTL/Arabic-ready layout and typography
- API integration for settings, categories, products, and reservations
- SSR-ready build output

## Tech Stack
- Framework: Angular 21+
- Language: TypeScript 5.9
- Styling: Tailwind CSS 3
- SSR: Angular SSR
- Server (SSR): Express 5
- Testing: Angular unit test runner + Vitest

## Requirements
- Node.js 18+
- npm 11+
- Backend API available at `https://localhost:7156/api`

## Quick Start
```bash
npm install
npm start
```
Open `http://localhost:4200`.

## Scripts
```bash
npm start        # Dev server
npm run build    # Production build
npm run watch    # Build in watch mode
npm test         # Unit tests
```

## Configuration
- API base URL: `src/environments/environment.ts`
- Proxy config: `src/proxy.conf.json`
- Tailwind config: `tailwind.config.js`
- Global styles: `src/styles.css`

## Project Structure
```
src/
  app/
    core/
      models/
      services/
    features/
    shared/
  environments/
  assets/
  styles.css
```

## API Integration
The frontend expects a backend that returns `{ statusCode, message, data }` and supports:
- Settings: `GET /api/Settings`, `PUT /api/Settings`
- Categories: `GET /api/Categories?activeOnly=true`, `GET /api/Categories/{id}`
- Products: `GET /api/Products`, `GET /api/Products/{id}`
- Reservations: `POST /api/Reservations`, `GET /api/Reservations/track`

For detailed integration steps and test data, see `API_INTEGRATION_CHECKLIST.md`.

## Notes
- CORS must allow `http://localhost:4200` in development.
- Production output is generated under `dist/`.

## Additional Docs
- `API_INTEGRATION_CHECKLIST.md`
- `FRONTEND_SETUP_COMPLETE.md`
