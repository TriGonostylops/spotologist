import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';

export interface AuthUser {
  sub: string;
  email?: string;
  name?: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  private tokenKey = 'spotologist.jwt';
  private userKey = 'spotologist.user';
  private nonceKey = 'spotologist.nonce';

  private userSubject = new BehaviorSubject<AuthUser | null>(this.readUser());
  user$ = this.userSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }

  get accessToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  setSession(accessToken: string, user: AuthUser) {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
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
    localStorage.removeItem(this.nonceKey);
    this.userSubject.next(null);
  }

  getNonce(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.nonceKey);
  }

  setNonce(nonce: string) {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.nonceKey, nonce);
  }

  clearNonce() {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.nonceKey);
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
