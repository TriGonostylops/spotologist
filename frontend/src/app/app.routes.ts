import { Routes } from '@angular/router';
import { SpotsComponent } from './features/spots/spots';
import { ProfileComponent } from './features/profile-component/profile-component';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: SpotsComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
