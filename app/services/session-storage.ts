import { createCookieSessionStorage } from '@remix-run/node';

export type SessionData = {
  username: string;
  token: string;
};

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__authtoken',
    sameSite: 'lax',
    path: '/',
    secrets: ['testingsecret'],
    secure: true,
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
