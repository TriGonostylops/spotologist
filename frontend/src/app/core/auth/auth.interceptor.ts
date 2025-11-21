import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken;

  const PUBLIC_PATHS: string[] = [
    '/api/auth/google',
    '/api/auth/nonce',
    '/api/spots/hello'
  ];

  const url = req.url.toLowerCase();
  const isPublic = PUBLIC_PATHS.some(p => url.includes(p.toLowerCase()));

  if (token && !isPublic) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
