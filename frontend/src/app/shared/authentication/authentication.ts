import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [],
  templateUrl: './authentication.html',
  styleUrl: './authentication.scss',
})
export class Authentication {
  @Output() signIn = new EventEmitter<void>();

  // Placeholder click handler for future Google OpenID Connect flow
  onSignInClick(): void {
    // Emit an event so parent shells can react (e.g., trigger OAuth flow later)
    this.signIn.emit();
    // Temporary behavior for now
    // eslint-disable-next-line no-console
    console.log('[Auth] Sign in with Google clicked');
  }
}
