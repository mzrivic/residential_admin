import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./app/modules/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./app/modules/dashboard/dashboard/dashboard').then(m => m.DashboardComponent),
    children: [
      {
        path: 'users',
        loadChildren: () => import('./app/modules/users/users.module').then(m => m.UsersModule)
      }
    ]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
