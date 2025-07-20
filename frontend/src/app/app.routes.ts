import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./app/modules/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./app/modules/dashboard/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
