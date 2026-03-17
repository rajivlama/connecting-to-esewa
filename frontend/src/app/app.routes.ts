import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'transfer', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  {
    path: 'transfer/:id',
    loadComponent: () => import('./features/history/transfer-detail.component').then(m => m.TransferDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'transfer',
    loadComponent: () => import('./features/transfer/transfer.component').then(m => m.TransferComponent),
    canActivate: [authGuard],
  },
  {
    path: 'recipients',
    loadComponent: () => import('./features/recipients/recipients.component').then(m => m.RecipientsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'transfer' },
];
