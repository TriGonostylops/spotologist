import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpotsService {
  private readonly http = inject(HttpClient);

  hello(): Observable<string> {
    return this.http.get('http://localhost:8080/api/spots/hello', { responseType: 'text' as const });
  }
}
