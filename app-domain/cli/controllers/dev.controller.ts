import type { CliApp } from '../cli-app';

export class DevController {
  app: CliApp;

  constructor({ app }: { app: CliApp }) {
    this.app = app;
  }

  async testConfig() {}

  async testApi() {
    await this.app.boot();

    const data = await this.app.apiClient.readSingle(
      'realityShow',
      '5e5026bc-8605-4a44-bc43-3f3ede8bab5a',
    );

    console.log(data, data.value);
  }
}
