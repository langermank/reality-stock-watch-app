import type { SessionData } from './session-storage';

import { Authenticator, AuthorizationError } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { getApp } from './app';
import { sessionStorage } from './session-storage';

export type LoginType = 'password' | 'authProvider';

export const webAuth = new Authenticator<SessionData | Error | null>(sessionStorage, {
  sessionKey: 'authToken',
  sessionErrorKey: 'authError',
});

webAuth.use(
  new FormStrategy(async ({ form }) => {
    let loginType = form.get('loginType');
    if (!loginType) loginType = 'password';

    if (loginType === 'password') {
      const username = form.get('username');
      if (!username) throw new AuthorizationError('username required');

      const password = form.get('password');
      if (!password) throw new AuthorizationError('password required');

      const appDomain = await getApp();
      const token = await appDomain.authenticator.login(username.toString(), password.toString());
      console.log('token', token);

      if (!token) throw new AuthorizationError('credentials invalid');

      return {
        username: username.toString(),
        token: 'dummy-data',
      };
    }

    //todo: auth providers

    return {
      username: '',
      token: '',
    } as SessionData;
  }),
);
