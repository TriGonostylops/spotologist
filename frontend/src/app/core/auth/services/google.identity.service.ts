import {Injectable, NgZone, Inject, PLATFORM_ID, inject} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {AuthService, AuthUser} from './auth.service';

declare global {
  interface Window {
    google: any;
  }
}

interface TokenResponse {
  accessToken: string;
  user?: AuthUser;
}

@Injectable({providedIn: 'root'})
export class GoogleIdentityService {
  private readonly authService = inject(AuthService);

  constructor(
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  renderGoogleButton(el: HTMLElement) {
    if (!this.isBrowser()) return;

    this.initGoogle().then(() => {
      const tryRender = () => {
        if (!window.google?.accounts?.id) {
          setTimeout(tryRender, 50);
          return;
        }
        window.google.accounts.id.renderButton(el, {
          theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill'
        });
      };
      tryRender();
    });
  }

  private async initGoogle() {
    const clientId = this.getClientId();
    if (!clientId) return;

    let nonce: string | null = null;
    try {
      const issued = await this.fetchNonce();
      if (issued?.nonce) {
        nonce = issued.nonce;
        this.authService.setNonce(nonce);
      }
    } catch (e) {
      console.warn('Nonce fetch failed, proceeding without');
    }

    const tryInit = () => {
      if (!window.google?.accounts?.id) {
        setTimeout(tryInit, 50);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        nonce: nonce,
        callback: (resp: any) => this.zone.run(() => this.onGoogleCredential(resp)),
      });
    };
    tryInit();
  }

  private async onGoogleCredential(resp: { credential: string }) {
    const idToken = resp.credential;
    const nonce = this.authService.getNonce();
    this.authService.clearNonce(); // Consume the nonce

    const base = this.getApiBaseUrl();
    const url = base ? `${base}/api/auth/google` : `/api/auth/google`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({idToken, nonce}),
      });

      if (!res.ok) throw new Error('Auth failed');

      const data: TokenResponse = await res.json();

      let user = data.user || this.decodeUserFromToken(data.accessToken);

      this.authService.setSession(data.accessToken, user);

    } catch (error) {
      console.error('Google Login Failed', error);
    }
  }

  private decodeUserFromToken(token: string): AuthUser {
    try {
      const [, payload] = token.split('.');
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return { sub: json.sub, email: json.email, name: json.name };
    } catch {
      return { sub: 'unknown' };
    }
  }

  private async fetchNonce(): Promise<{ nonce: string }> {
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/api/auth/nonce` : `/api/auth/nonce`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch nonce');
    return res.json();
  }

  private getApiBaseUrl(): string {
    if (!this.isBrowser()) return '';
    const meta = document.querySelector('meta[name="api-base-url"]') as HTMLMetaElement;
    return meta?.content || '';
  }

  private getClientId(): string | null {
    if (!this.isBrowser()) return null;
    const meta = document.querySelector('meta[name="google-client-id"]') as HTMLMetaElement;
    return meta?.content || null;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
