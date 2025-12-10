import {Component, ElementRef, OnDestroy, OnInit, AfterViewInit, ViewChild, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/services/auth.service';
import { Observable, Subscription } from 'rxjs';
import {AuthUser} from '../../core/auth/types/AuthUser';
import {GoogleIdentityService} from '../../core/auth/services/google.identity.service';
import {UsernamePromptComponent} from '../username-prompt/username-prompt';
import {UsernameService} from '../../core/user/username.service';

@Component({
  selector: 'authentication-component',
  standalone: true,
  imports: [CommonModule, UsernamePromptComponent],
  templateUrl: './authentication.html',
  styleUrl: './authentication.scss',
})
export class AuthenticationComponent implements OnInit, AfterViewInit, OnDestroy {
  private _googleBtn?: ElementRef<HTMLElement>;
  private readonly googleIdentityService = inject(GoogleIdentityService);
  private readonly usernameService = inject(UsernameService);

  @ViewChild('googleBtn', { static: false })
  set googleBtn(el: ElementRef<HTMLElement> | undefined) {
    this._googleBtn = el;
    if (el && !this.currentUser) {
      setTimeout(() => this.googleIdentityService.renderGoogleButton(el.nativeElement), 0);
    }
  }

  user$!: Observable<AuthUser | null>;
  private sub?: Subscription;
  private currentUser: AuthUser | null = null;
  showUsernamePrompt = false;

  constructor(private auth: AuthService) {
    this.user$ = this.auth.user$;
  }

  ngOnInit(): void {
    this.sub = this.user$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        setTimeout(() => this.tryRenderButton(user), 0);
        this.showUsernamePrompt = false;
      } else {
        this.showUsernamePrompt = !user.username;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.tryRenderButton(null), 0);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // Note: Menu logic removed; this component only handles Google sign-in when unauthenticated
  // and username prompt flow for users without a username.

  private tryRenderButton(user: AuthUser | null) {
    if (!user && this._googleBtn?.nativeElement) {
      this.googleIdentityService.renderGoogleButton(this._googleBtn.nativeElement);
    }
  }

  async onUsernameCompleted() {
    try {
      const refreshed = await this.usernameService.me();
      this.auth.updateCurrentUser(refreshed);
    } finally {
      this.showUsernamePrompt = false;
    }
  }

  onUsernameCancelled() {
    // Optional: keep the user logged in but hide prompt; or sign out to force choice later
    this.showUsernamePrompt = false;
  }
}
