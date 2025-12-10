import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
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

  async checkAvailability(name: string): Promise<boolean> {
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/user/username/check` : `/user/username/check`;
    const params = new HttpParams().set('name', name);
    try {
      // Authorization header will be injected by the auth interceptor
      await firstValueFrom(this.http.get<void>(url, { params }));
      return true;
    } catch (e: any) {
      if (e?.status === 409) return false;
      throw e;
    }
  }

  async setUsername(name: string): Promise<void> {
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/user/username` : `/user/username`;
    // Authorization header will be injected by the auth interceptor
    await firstValueFrom(this.http.put<void>(url, { userName: name }));
  }

  async me(): Promise<AuthUser> {
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/user/me` : `/user/me`;
    // Authorization header will be injected by the auth interceptor
    const dto: any = await firstValueFrom(this.http.get<any>(url));
    return {
      id: this.auth.currentUser?.id ?? '',
      email: dto?.email,
      username: dto?.userName ?? undefined
    } as AuthUser;
  }
}
