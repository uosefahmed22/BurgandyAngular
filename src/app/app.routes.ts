import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/product-list/product-list.component').then(
        (m) => m.ProductListComponent,
      ),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-details/product-details.component').then(
        (m) => m.ProductDetailsComponent,
      ),
    data: { prerender: false },
  },
  {
    path: 'reserve/:productId',
    loadComponent: () =>
      import('./features/reservation/create-reservation/create-reservation.component').then(
        (m) => m.CreateReservationComponent,
      ),
    data: { prerender: false },
  },
  {
    path: 'track',
    loadComponent: () =>
      import('./features/reservation/track-reservation/track-reservation.component').then(
        (m) => m.TrackReservationComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
