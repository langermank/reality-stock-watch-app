import { BaseController } from './base.controller';

export class DevController extends BaseController {
  async testConfig() {
    console.log('config');
  }

  async testApi() {
    const data = await this._app.apiClient.readSingle(
      'realityShow',
      '5e5026bc-8605-4a44-bc43-3f3ede8bab5a',
    );

    console.log(data, data.value);
  }
}
