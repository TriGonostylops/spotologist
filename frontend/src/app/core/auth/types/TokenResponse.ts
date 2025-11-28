import {AuthUser} from './AuthUser';

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  userId: string;
  user?: AuthUser;
}
