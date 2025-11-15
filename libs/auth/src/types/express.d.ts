declare global {
  namespace Express {
    interface Request {
      rawAccessToken?: string;
      refreshToken?: string;
      user?: any;
    }
  }
}

export {};