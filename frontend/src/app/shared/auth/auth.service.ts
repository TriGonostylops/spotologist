import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AuthUser {
  sub: string;
  email?: string;
  name?: string;
  username?: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  user?: AuthUser;
}

interface IssuedNonce {
  nonce: string;
  expiresIn: number;
}

declare global {
  interface Window { google: any }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'spotologist.jwt';
  private userKey = 'spotologist.user';
  private nonceKey = 'spotologist.nonce';

  private userSubject = new BehaviorSubject<AuthUser | null>(this.readUser());
  user$ = this.userSubject.asObservable();

  get accessToken(): string | null {
    if (!this.isBrowser()) return null;
    try { return localStorage.getItem(this.tokenKey); } catch { return null; }
  }

  constructor(private zone: NgZone) {}

  private getClientId(): string | null {
    if (!this.isBrowser()) return null;
    const meta = document.querySelector('meta[name="google-client-id"]') as HTMLMetaElement | null;
    return meta?.content || null;
  }

  private getApiBaseUrl(): string {
    if (!this.isBrowser()) return '';
    const meta = document.querySelector('meta[name="api-base-url"]') as HTMLMetaElement | null;
    return meta?.content || '';
  }

  async initGoogle() {
    if (!this.isBrowser()) return;
    const clientId = this.getClientId();
    if (!clientId) {
      console.warn('[Auth] Missing google-client-id meta tag content');
      return;
    }
    let issued: IssuedNonce | null = null;
    try {
      issued = await this.fetchNonce();
      if (issued?.nonce) {
        localStorage.setItem(this.nonceKey, issued.nonce);
      }
    } catch {
      console.warn('[Auth] Failed to fetch nonce; proceeding without it');
    }

    const tryInit = () => {
      if (!window.google?.accounts?.id) { setTimeout(tryInit, 50); return; }
      window.google.accounts.id.initialize({
        client_id: clientId,
        nonce: issued?.nonce,
        callback: (resp: any) => this.zone.run(() => this.onGoogleCredential(resp)),
      });
    };
    tryInit();
  }

  renderGoogleButton(el: HTMLElement) {
    if (!this.isBrowser()) return;
    this.initGoogle();
    const tryRender = () => {
      if (!window.google?.accounts?.id) { setTimeout(tryRender, 50); return; }
      window.google.accounts.id.renderButton(el, {
        theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill'
      });
    };
    tryRender();
  }

  private async onGoogleCredential(resp: { credential: string }) {
    const idToken = resp.credential;
    let nonce: string | null = null;
    try { nonce = localStorage.getItem(this.nonceKey); } catch {}
    try { localStorage.removeItem(this.nonceKey); } catch {}
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/api/auth/google` : `/api/auth/google`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, nonce }),
    });
    if (!res.ok) {
      console.error('[Auth] Auth failed', res.status, await res.text().catch(()=>'') );
      throw new Error('Auth failed');
    }
    const data: TokenResponse = await res.json();
    localStorage.setItem(this.tokenKey, data.accessToken);

    let user = data.user;
    if (!user) {
      try {
        const [, payload] = data.accessToken.split('.');
        const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        user = { sub: json.sub, email: json.email, name: json.name };
      } catch {
        user = { sub: 'unknown' } as AuthUser;
      }
    }
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  signOut() {
    if (!this.isBrowser()) return;
    const user = this.userSubject.value;
    if (user?.email && window.google?.accounts?.id?.revoke) {
      window.google.accounts.id.revoke(user.email, () => {});
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    try { localStorage.removeItem(this.nonceKey); } catch {}
    this.userSubject.next(null);
  }

  private readUser(): AuthUser | null {
    if (!this.isBrowser()) return null;
    try { return JSON.parse(localStorage.getItem(this.userKey) || 'null'); } catch { return null; }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  private async fetchNonce(): Promise<IssuedNonce> {
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/api/auth/nonce` : `/api/auth/nonce`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error('Failed to fetch nonce');
    return res.json();
  }
}
