import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {AuthenticationComponent} from '../../shared/authentication-component/authentication';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AuthenticationComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  isMenuOpen = false;
  protected readonly auth = inject(AuthService);

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onLinkClick(event: Event): void {
    // Close the menu when a link inside the drawer is clicked (mobile UX)
    const target = event.target as HTMLElement;
    if (target.closest('a')) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.closeMenu();
  }

  signOut(): void {
    this.auth.signOut();
    this.closeMenu();
  }
}
