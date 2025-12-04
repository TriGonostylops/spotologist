import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {AuthService} from '../auth/services/auth.service';
import {AuthUser} from '../auth/types/AuthUser';

@Injectable({ providedIn: 'root' })
export class UsernameService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private getApiBaseUrl(): string {
    const meta = document.querySelector('meta[name="api-base-url"]') as HTMLMetaElement | null;
    return meta?.content || '';
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.accessToken;
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    }

  async checkAvailability(name: string): Promise<boolean> {
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/user/username/check` : `/user/username/check`;
    const params = new HttpParams().set('name', name);
    try {
      await firstValueFrom(this.http.get<void>(url, { params, headers: this.authHeaders() }));
      return true;
    } catch (e: any) {
      if (e?.status === 409) return false;
      throw e;
    }
  }

  async setUsername(name: string): Promise<void> {
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/user/username` : `/user/username`;
    await firstValueFrom(this.http.put<void>(url, { userName: name }, { headers: this.authHeaders() }));
  }

  async me(): Promise<AuthUser> {
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/user/me` : `/user/me`;
    const headers = this.authHeaders();
    const dto: any = await firstValueFrom(this.http.get<any>(url, { headers }));
    return {
      id: this.auth.currentUser?.id ?? '',
      email: dto?.email,
      username: dto?.userName ?? undefined
    } as AuthUser;
  }
}
