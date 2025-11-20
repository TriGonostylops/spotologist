import {AuthUser} from './AuthUser';

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  user?: AuthUser;
}
