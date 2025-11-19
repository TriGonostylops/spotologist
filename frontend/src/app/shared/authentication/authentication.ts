import { Component, ElementRef, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../auth/auth.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './authentication.html',
  styleUrl: './authentication.scss',
})
export class Authentication implements OnInit, AfterViewInit, OnDestroy {
  private _googleBtn?: ElementRef<HTMLElement>;
  @ViewChild('googleBtn', { static: false })
  set googleBtn(el: ElementRef<HTMLElement> | undefined) {
    this._googleBtn = el;
    if (el && !this.currentUser) {
      setTimeout(() => this.auth.renderGoogleButton(el.nativeElement), 0);
    }
  }

  user$!: Observable<AuthUser | null>;
  menuOpen = false;
  private sub?: Subscription;
  private currentUser: AuthUser | null = null;

  constructor(private auth: AuthService) {
    this.user$ = this.auth.user$;
  }

  ngOnInit(): void {
    this.sub = this.user$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        setTimeout(() => this.tryRenderButton(user), 0);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.tryRenderButton(null), 0);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  displayLabel(user: AuthUser): string {
    return user.username || user.email || user.name || 'Account';
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  signOut() { this.auth.signOut(); this.menuOpen = false; }

  private tryRenderButton(user: AuthUser | null) {
    if (!user && this._googleBtn?.nativeElement) {
      this.auth.renderGoogleButton(this._googleBtn.nativeElement);
    }
  }
}
