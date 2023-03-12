import { BaseController } from "../base.controller";

import { RealityShow } from "../../../data-layer/entities/reality-show";
import { RealityShowSeries } from "../../../data-layer/entities/reality-show-series";

export class SeedController extends BaseController {
  async fullDev() {
    const appStorage = await this._app.getStore();

    const mainShow = new RealityShow({
      name: "Older Brother 2",
      slug: "olb-2",
      description: "People in a house having to mentoring college students.",
      genre: "Reality competition",
    });
    await appStorage.shows.save(mainShow);
    console.log(mainShow);

    const mainSeries = new RealityShowSeries({
      name: "Older Brother Post Meridiem",
      slug: "olb-pm",
      realityShowId: mainShow.id,
    });
    await appStorage.showSeries.save(mainSeries);
  }
}
