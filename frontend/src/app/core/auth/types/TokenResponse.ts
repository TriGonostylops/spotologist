import {AuthUser} from './AuthUser';

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  // Backend user identifier to persist as AuthUser.sub for multi-SSO
  userId: string;
  // (Optional backward-compat) Some versions might still send full user
  user?: AuthUser;
}
