import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';
import {AuthUser} from '../types/AuthUser';

@Injectable({providedIn: 'root'})
export class AuthService {
  private tokenKey = 'spotologist.jwt';
  private userKey = 'spotologist.user';

  private userSubject = new BehaviorSubject<AuthUser | null>(this.readUser());
  user$ = this.userSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }

  get accessToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  async setSession(accessToken: string, userFactory: () => Promise<AuthUser>): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.tokenKey, accessToken);

    try {
      const user = await userFactory();
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.userSubject.next(user);
    } catch (e) {
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.tokenKey);
      throw e;
    }
  }

  updateCurrentUser(user: AuthUser | null): void {
    if (!this.isBrowser()) return;
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
    this.userSubject.next(user);
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  signOut() {
    if (!this.isBrowser()) return;

    const user = this.userSubject.value;
    if (user?.email && (window as any).google?.accounts?.id?.revoke) {
      (window as any).google.accounts.id.revoke(user.email, () => {
      });
    }

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }

  restoreFromStorage(): void {
    if (!this.isBrowser()) return;
    const user = this.readUser();
    this.userSubject.next(user);
  }

  private readUser(): AuthUser | null {
    if (!this.isBrowser()) return null;
    try {
      return JSON.parse(localStorage.getItem(this.userKey) || 'null');
    } catch {
      return null;
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
