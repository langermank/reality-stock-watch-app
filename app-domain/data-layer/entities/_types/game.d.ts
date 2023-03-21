import type { Core } from "./core";

export namespace Game {
  export interface Game extends Core.EntityRecord {
    title: ?string;
    slug: ?string;
    realityShowSeriesId: ?Core.Uuid;
  }

  export interface GameSeason extends Core.EntityRecord {
    slug: ?string;
    startDate: ?Date;
    endDate: ?Date;
    gameId: ?Core.Uuid;
    realityShowSeasonId: ?Core.Uuid;
  }

  export interface GameSeasonCycle extends Core.EntityRecord {
    slug: ?string;
    startDate: ?Date;
    endDate: ?Date;
    gameSeasonId: ?Core.Uuid;
  }

  export interface GameSeasonPlayer extends Core.EntityRecord {
    gameSeasonId: ?Core.Uuid;
    personId: ?Core.Uuid;
    userId: ?Core.Uuid;
  }

  export interface GameSeasonCyclePlayerRating extends Core.EntityRecord {
    completedAt: ?Date;
    answers: ?string;
    playerId: ?Core.Uuid;
    gameSeasonCycleId: ?Core.Uuid;
  }

  export interface PlayerRating extends Core.EntityRecord {
    rating: number;
    participatingId: ?Core.Uuid;
    gameSeasonCyclePlayerRatingId: ?Core.Uuid;
    previousRatingId: ?Core.Uuid;
  }

  export interface ParticipantRating extends Core.EntityRecord {
    rating: number;
    participantId: ?Core.Uuid;
    gameSeasonCycleId: ?Core.Uuid;
    previousRatingId: ?Core.Uuid;
  }

  export interface PanelMember extends Core.EntityRecord {
    isPermanent: boolean;
    personId: ?Core.Uuid;
    userId: ?Core.Uuid;
    gameSeasonCycleId: ?Core.Uuid;
  }

  export interface PanelMemberRating extends Core.EntityRecord {
    rating: number;
    observation: ?string;
    panelMemberId: ?Core.Uuid;
  }
}
