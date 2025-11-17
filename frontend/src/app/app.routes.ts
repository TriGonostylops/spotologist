import { Routes } from '@angular/router';
import { SpotsComponent } from './features/spots/spots';

export const routes: Routes = [
  { path: '', component: SpotsComponent },
  { path: '**', redirectTo: '' }
];
