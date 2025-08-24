import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import type { CookieOptions } from 'express';

@Injectable()
export class AuthCookieService {
  private readonly secure: boolean;
  private readonly domain?: string;

  private readonly atTtlMs: number;
  private readonly rtTtlMs: number;

  constructor(private readonly cfg: ConfigService) {
    this.secure = (this.cfg.get<string>('COOKIE_SECURE') ?? 'false') === 'true';

    const d = this.cfg.get<string>('COOKIE_DOMAIN');
    this.domain = d && d !== 'localhost' ? d : undefined;

    this.atTtlMs = this.parseDurationMs(
      this.cfg.get<string>('ACCESS_TOKEN_TTL'),
      15 * 60 * 1000
    );
    this.rtTtlMs = this.parseDurationMs(
      this.cfg.get<string>('REFRESH_TOKEN_TTL'),
      7 * 24 * 60 * 60 * 1000
    );
  }

  setAccess(res: Response, token: string) {
    res.cookie('sr_at', token, {
      httpOnly: true,
      sameSite: this.sameSite(),
      secure: this.secure,
      domain: this.domain,
      maxAge: this.atTtlMs,
      path: '/',
    });
  }

  setRefresh(res: Response, token: string) {
    res.cookie('sr_rt', token, {
      httpOnly: true,
      sameSite: this.sameSite(),
      secure: this.secure,
      domain: this.domain,
      maxAge: this.rtTtlMs,
      path: '/',
    });
  }

  clear(res: Response) {
    const base: CookieOptions = {
      path: '/',
      secure: this.secure,
      sameSite: this.sameSite(),
      ...(this.domain ? { domain: this.domain } : {}),
    };
    try {
      res.clearCookie('sr_at', base);
      res.clearCookie('sr_rt', base);
    } catch {
      // fallback “best-effort”
      res.clearCookie('sr_at');
      res.clearCookie('sr_rt');
    }
  }

  // --- helpers privados ---
  private parseDurationMs(expr: string | undefined, fallbackMs: number) {
    if (!expr) return fallbackMs;
    const m = /^(\d+)(ms|s|m|h|d)$/.exec(expr);
    if (!m) return fallbackMs;
    const n = Number(m[1]);
    const map = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 } as const;
    return n * map[m[2] as keyof typeof map];
  }

  private sameSite(): CookieOptions['sameSite'] {
    return this.secure ? 'none' : 'lax';
  }
}
