import { AccessTokenPayload } from '../auth/types/payload';
import { RefreshTokenPayload } from '../auth/types/payload';

declare global {
  namespace Express {
    interface Request {
      rawAccessToken?: string;
      refreshToken?: string;
      user?: AccessTokenPayload | RefreshTokenPayload | any;
    }
  }
}