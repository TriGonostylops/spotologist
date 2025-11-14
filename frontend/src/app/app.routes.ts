import { Routes } from '@angular/router';
import { SpotsComponent } from './spots/spots';

export const routes: Routes = [
  { path: '', component: SpotsComponent },
  { path: '**', redirectTo: '' }
];
