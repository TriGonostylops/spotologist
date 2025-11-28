import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';
import {AuthUser} from '../types/AuthUser';

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

  async setSession(accessToken: string, userPromise: Promise<AuthUser>): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.tokenKey, accessToken);

    try {
      const user = await userPromise;
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.userSubject.next(user);
    } catch (e) {
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.tokenKey);
      throw e;
    }
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

  public hasStoredUser(): boolean {
    if (!this.isBrowser()) return false;
    try {
      const raw = localStorage.getItem(this.userKey);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!parsed;
    } catch {
      return false;
    }
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
