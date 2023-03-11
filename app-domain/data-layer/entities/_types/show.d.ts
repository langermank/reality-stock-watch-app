/// <reference path="./core.d.ts" />

export namespace Show {
  export interface RealityShow extends Core.EntityRecord {
    name: string;
    slug: string;
    description: ?string;
    genre: ?string;
    firstAiredDate: ?Date;
    createdBy: ?string;
  }

  export interface RealityShowSeries extends Core.EntityRecord {
    name: string;
    slug: string;
    description: ?string;
    streamingNetworks: ?string;
    realityShowId: Core.Uuid;
  }

  export interface RealityShowSeason extends Core.EntityRecord {
    name: string;
    slug: string;
    seasonNumber: ?string;
    startDate: ?Date;
    endDate: ?Date;
    streamingNetworks: ?string;
    realityShowSeriesId: Core.Uuid;
  }

  export interface Participant extends Core.EntityRecord {
    ingressDate: ?Date;
    exitDate: ?Date;
    realityShowSeasonId: Core.Uuid;
    personId: Core.Uuid;
  }

  export interface RealityShowSeasonEvent extends Core.EntityRecord {
    occurredAt: Date;
    type: string;
    description: ?string;
    metadata: ?string;
    realityShowSeasonId: Core.Uuid;
  }

  export interface RealityShowSeasonEventParticipant extends Core.EntityRecord {
    role: ?string;
    description: ?string;
    metadata: ?string;
    realityShowSeasonEventId: Core.Uuid;
    participantId: Core.Uuid;
  }
}
