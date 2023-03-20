import { BaseController } from "../base.controller";

import { RealityShow } from "../../../data-layer/entities/reality-show";
import { RealityShowSeries } from "../../../data-layer/entities/reality-show-series";
import { RealityShowSeason } from "../../../data-layer/entities/reality-show-season";

export class SeedController extends BaseController {
  async fullDev() {
    const appStorage = await this._app.getStore();

    //#region [ Reality Show ]
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

    const mainSeason = new RealityShowSeason({
      name: "Season 15",
      slug: "old-pm-15",
      seasonNumber: "15",
      startDate: new Date(Date.now()),
      realityShowSeriesId: mainSeries.id,
    });
    await appStorage.showSeasons.save(mainSeason);
    //#endregion
  }
}
