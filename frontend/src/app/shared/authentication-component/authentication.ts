import {Component, ElementRef, OnDestroy, OnInit, AfterViewInit, ViewChild, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { Observable, Subscription } from 'rxjs';
import {AuthUser} from '../../core/auth/types/AuthUser';
import {GoogleIdentityService} from '../../core/auth/services/google.identity.service';

@Component({
  selector: 'authentication-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './authentication.html',
  styleUrl: './authentication.scss',
})
export class AuthenticationComponent implements OnInit, AfterViewInit, OnDestroy {
  private _googleBtn?: ElementRef<HTMLElement>;
  private readonly googleIdentityService = inject(GoogleIdentityService);

  @ViewChild('googleBtn', { static: false })
  set googleBtn(el: ElementRef<HTMLElement> | undefined) {
    this._googleBtn = el;
    if (el && !this.currentUser) {
      setTimeout(() => this.googleIdentityService.renderGoogleButton(el.nativeElement), 0);
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
    return user.username || user.email || 'Account';
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  signOut() { this.auth.signOut(); this.menuOpen = false; }

  private tryRenderButton(user: AuthUser | null) {
    if (!user && this._googleBtn?.nativeElement) {
      this.googleIdentityService.renderGoogleButton(this._googleBtn.nativeElement);
    }
  }
}
