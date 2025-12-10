import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpotsService {
  private readonly http = inject(HttpClient);

  private getApiBaseUrl(): string {
    const meta = document.querySelector('meta[name="api-base-url"]') as HTMLMetaElement | null;
    return meta?.content || '';
  }

  hello(): Observable<string> {
    const base = this.getApiBaseUrl();
    const url = base ? `${base}/user/me` : `/user/me`;
    return this.http.get(url, { responseType: 'text' as const });
  }
}
