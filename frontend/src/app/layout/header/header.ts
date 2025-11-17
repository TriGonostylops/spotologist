import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Authentication } from '../../shared/authentication/authentication';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Authentication],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  onSignIn(): void {
    console.log('[Header] Sign in requested');
  }
}
