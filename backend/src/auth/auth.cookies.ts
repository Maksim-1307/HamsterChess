import type { Request, Response } from 'express';
import type { TokenPair } from './auth.types';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export interface CookieOptions {
  secure: boolean;
  accessMaxAge: number;
  refreshMaxAge: number;
}

const baseOptions = (secure: boolean) =>
  ({
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
  });

export function setAuthCookies(
  res: Response,
  tokens: TokenPair,
  options: CookieOptions,
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseOptions(options.secure),
    maxAge: options.accessMaxAge,
  });
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseOptions(options.secure),
    maxAge: options.refreshMaxAge,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
}

export function readAccessToken(req: Request): string | undefined {
  const cookie = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
  if (cookie) {
    return cookie;
  }

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }

  return undefined;
}

export function readRefreshToken(req: Request): string | undefined {
  return req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
}

/**
 * Reads the access token from a raw Cookie header. Used outside of the
 * Express request pipeline, e.g. when authenticating a WebSocket handshake.
 */
export function readAccessTokenFromCookieHeader(
  header: string | undefined,
): string | undefined {
  if (!header) {
    return undefined;
  }

  for (const pair of header.split(';')) {
    const separator = pair.indexOf('=');
    if (separator === -1) continue;

    const name = pair.slice(0, separator).trim();
    if (name !== ACCESS_TOKEN_COOKIE) continue;

    return decodeURIComponent(pair.slice(separator + 1).trim());
  }

  return undefined;
}
