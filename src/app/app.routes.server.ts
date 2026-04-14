import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [], // Empty - will be rendered on demand
  },
  {
    path: 'reserve/:productId',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [], // Empty - will be rendered on demand
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
