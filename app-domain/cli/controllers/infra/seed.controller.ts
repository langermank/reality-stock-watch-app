import { BaseController } from "../base.controller";

import { Person } from "../../../data-layer/entities/person";
import { RealityShow } from "../../../data-layer/entities/reality-show";
import { RealityShowSeries } from "../../../data-layer/entities/reality-show-series";
import { RealityShowSeason } from "../../../data-layer/entities/reality-show-season";
import { Game } from "../../../data-layer/entities/game";
import { GameSeason } from "../../../data-layer/entities/game-season";
import { GameSeasonCycle } from "../../../data-layer/entities/game-season-cycle";
import { Participant } from "../../../data-layer/entities/participant";

export class SeedController extends BaseController {
  async fullDev() {
    const appStorage = await this._app.getStore();

    //#region [ Person ]
    const forfafPerson = new Person({
      firstName: "Forfaf",
      lastName: "Guigully",
      nickname: "forf",
    });
    const mikePerson = new Person({
      firstName: "Mike",
      lastName: "Michael",
      nickname: "mike",
    });
    const anaPerson = new Person({
      firstName: "Ana",
      lastName: "Banana",
      nickname: "abana",
    });

    const people = [forfafPerson, mikePerson, anaPerson];
    await Promise.all([
      appStorage.persons.save(forfafPerson),
      appStorage.persons.save(mikePerson),
      appStorage.persons.save(anaPerson),
    ]);
    //#endregion

    //#region [ Reality Show ]
    const mainShow = new RealityShow({
      name: "Older Brother 2",
      slug: "olb-121",
      description: "People in a house having to mentoring college students.",
      genre: "Reality competition",
    });
    await appStorage.shows.save(mainShow);
    console.log(mainShow);

    const mainSeries = new RealityShowSeries({
      name: "Older Brother Post Meridiem",
      slug: "olb-pm-121",
      realityShowId: mainShow.id,
    });
    await appStorage.showSeries.save(mainSeries);

    const mainSeason = new RealityShowSeason({
      name: "Season 15",
      slug: "old-pm-15-121",
      seasonNumber: "15",
      startDate: new Date(Date.now()),
      realityShowSeriesId: mainSeries.id,
    });
    await appStorage.showSeasons.save(mainSeason);

    const participantsPromises = [];
    for (const person of people) {
      const participant = new Participant({
        ingressDate: new Date(Date.now()),
        realityShowSeasonId: mainSeason.id,
        personId: person.id,
      });
      participantsPromises.push(appStorage.showParticipants.save(participant));
    }
    await Promise.all(participantsPromises);
    //#endregion

    //#region [ Game ]
    const mainGame = new Game({
      title: "Older Brother PM - Stock watch",
      //slug: "old-pm",
      realityShowSeriesId: mainSeries.id,
    });
    await appStorage.games.save(mainGame);

    const mainGameSeason = new GameSeason({
      slug: "old-pm-15-121",
      startDate: new Date(Date.now()),
      gameId: mainGame.id,
      realityShowSeasonId: mainSeason.id,
    });
    await appStorage.gameSeasons.save(mainGameSeason);

    const mainGameSeasonCyle = new GameSeasonCycle({
      slug: "week-1",
      startDate: new Date(Date.now()),
      gameSeasonId: mainGameSeason.id,
    });
    await appStorage.gameSeasonCycles.save(mainGameSeasonCyle);
    //#endregion
  }
}
