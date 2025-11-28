import {Inject, inject, Injectable, NgZone, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {AuthService} from './auth.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {TokenResponse} from '../types/TokenResponse';
import {AuthUser} from '../types/AuthUser';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({providedIn: 'root'})
export class GoogleIdentityService {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private currentNonce: string | null = null;

  constructor(
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  renderGoogleButton(el: HTMLElement) {
    if (!this.isBrowser()) return;

    this.initGoogle(true).then(() => {
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

  private async initGoogle(withFreshNonce: boolean = true) {
    const clientId = this.getClientId();
    if (!clientId) return;

    let nonce: string | null = null;
    if (withFreshNonce || !this.currentNonce) {
      try {
        const issued = await this.fetchNonce();
        nonce = issued?.nonce ?? null;
      } catch (e) {
        console.warn('Nonce fetch failed; will retry init later');
        return;
      }
    } else {
      nonce = this.currentNonce;
    }

    const tryInit = () => {
      if (!window.google?.accounts?.id) {
        setTimeout(tryInit, 50);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        nonce: nonce ?? undefined,
        callback: (resp: any) => this.zone.run(() => this.onGoogleCredential(resp)),
      });
      this.currentNonce = nonce ?? null;
      // initialized successfully
    };
    tryInit();
  }

  private async onGoogleCredential(resp: { credential: string }) {
    const idToken = resp.credential;
    const nonce = this.currentNonce;

    const base = this.getApiBaseUrl();
    const url = base ? `${base}/api/auth/google` : `/api/auth/google`;

    try {
      const data = await firstValueFrom(
        this.http.post<TokenResponse>(url, { idToken, nonce })
      );

      this.currentNonce = null;

      if (data?.accessToken && data?.userId) {
        const userPromise = this.fetchUserDto(data.accessToken, data.userId);
        await this.authService.setSession(data.accessToken, userPromise);
      }

    } catch (error: any) {
      console.error('Google Login Failed', error);
      if (error?.status === 401) {
        await this.initGoogle(true);
      }
    }
  }

  private async fetchNonce(): Promise<{ nonce: string }> {
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/api/auth/nonce` : `/api/auth/nonce`;
    return await firstValueFrom(this.http.get<{ nonce: string }>(url));
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

  private async fetchUserDto(accessToken: string, userId: string): Promise<AuthUser> {
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/user/name` : `/user/name`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`
    });

    try {
      const dto = await firstValueFrom(this.http.get<any>(url, { headers }));
      return {
        id: userId,
        email: dto?.email,
        username: dto?.username ?? "PLACEHOLDER"
      };
    } catch (e) {
      return { id: userId } as AuthUser;
    }
  }
}
