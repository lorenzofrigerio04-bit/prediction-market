import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import {
  getSessionTokenCookieName,
  getSessionCookieWriteOptions,
  purgeLegacyNextAuthCookies,
} from '@/lib/auth-session-cookie';
import { createDbSessionForPasswordLogin } from '@/lib/auth-password-login';

export const dynamic = 'force-dynamic';

const LOGIN_LIMIT = 10;

export async function POST(request: Request) {
  const res = NextResponse.json({ ok: true });
  purgeLegacyNextAuthCookies(res);

  const ip = getClientIp(request);
  const limited = rateLimit(`login-creds:${ip}`, LOGIN_LIMIT);
  if (limited) {
    const err = NextResponse.json(
      { error: 'Troppe richieste di accesso. Riprova tra un minuto.' },
      { status: 429 }
    );
    purgeLegacyNextAuthCookies(err);
    return err;
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) {
    return NextResponse.json({ error: 'Email e password obbligatorie' }, { status: 400 });
  }

  try {
    const session = await createDbSessionForPasswordLogin(email, password);
    if (!session) {
      return NextResponse.json(
        { error: 'Email o password non corretti' },
        { status: 401 }
      );
    }

    res.cookies.set(
      getSessionTokenCookieName(),
      session.sessionToken,
      getSessionCookieWriteOptions()
    );
    return res;
  } catch (e) {
    console.error('[login-credentials]', e);
    return NextResponse.json(
      { error: 'Errore durante l\'accesso. Riprova tra poco.' },
      { status: 500 }
    );
  }
}
