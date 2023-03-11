import { BaseController } from '../base.controller';

export class SeedController extends BaseController {
  async fullDev() {
    const appStorage = await this._app.getStore();

    const mainShow = {
      name: 'Older Brother AM',
      slug: 'lb-am',
      description: 'People in a house having to mentoring college students.',
      genre: 'Reality competition',
    };

    await appStorage.shows.save(mainShow);
  }
}
