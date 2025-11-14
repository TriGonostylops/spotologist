import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * SpotsService
 *
 * Best practice in Angular is to keep data access in an @Injectable service
 * and have components delegate to it. This service exposes methods to interact
 * with the Spots backend API.
 */
@Injectable({ providedIn: 'root' })
export class SpotsService {
  private readonly http = inject(HttpClient);

  /**
   * Calls the backend health/hello endpoint and returns plain text.
   */
  hello(): Observable<string> {
    // Use absolute URL during development to avoid needing a dev proxy
    // CORS is enabled on the backend for http://localhost:4200
    return this.http.get('http://localhost:8080/api/spots/hello', { responseType: 'text' as const });
  }
}
