import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {AuthenticationComponent} from '../../shared/authentication-component/authentication';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AuthenticationComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  onSignIn(): void {
    console.log('[Header] Sign in requested');
  }
}
