import { CliApp } from './cli-app';

(async () => {
  const app = new CliApp();

  await app.boot();
  await app.run();
})();