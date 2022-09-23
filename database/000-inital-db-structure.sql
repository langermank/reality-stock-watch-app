-- core schema --
create schema if not exists core
    authorization postgres;

comment on schema core
    is 'core contains all base entities of the domain';

grant all on schema core to postgres;

-- core tables
create table if not exists "core"."person" (
  "id" uuid NOT NULL default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "firstName" varchar(1024) not null,
  "lastName" varchar(2056) default null,
  "nickname" varchar(256) default null,
  "birthDate" date default null,
  PRIMARY KEY("id")
);
create index idx_person_firstName_search ON "core"."person"("firstName" text_pattern_ops);
create index idx_person_lastName_search ON "core"."person"("lastName" text_pattern_ops);

create table if not exists "core"."publicProfile" (
  "id" uuid NOT NULL default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "displayName" varchar(256) not null,
  "avatarUrl" varchar(2056) default null,
  "ownerId" uuid default null,
  CONSTRAINT "fk_publicProfile_person_ownerId" FOREIGN KEY ("ownerId") REFERENCES "core"."person"("id"),
  PRIMARY KEY("id")
);

-- show schema --
create schema if not exists show 
    authorization postgres;

comment on schema show
    is 'shows related meta information';

grant all on schema show to postgres;

-- show tables --
create table if not exists "show"."realityShow" (
  "id" uuid NOT NULL default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "name" varchar(1024) not null,
  "description" text default null,
  "genre" varchar(256) default null,
  "firstAiredDate"  date default null,
  "createdBy" text default null,
  PRIMARY KEY ("id")
);
create index idx_show_name_search on "show"."realityShow"("name" text_pattern_ops);

create table if not exists "show"."realityShowSeries" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "name" varchar(1024) not null,
  "description" text default null,
  "streamingNetworks" text default null,
  "realityShowId" uuid default null,
  CONSTRAINT "fk_realityShowSeries_realityShow_realityShowId" FOREIGN KEY ("realityShowId") REFERENCES "show"."realityShow"("id"),
  PRIMARY KEY ("id")
);
create index idx_realityShowSeries_name_search on "show"."realityShowSeries"("name" text_pattern_ops);

create table if not exists "show"."realityShowSeason" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "name" varchar(1024) not null,
  "seasonNumber" varchar(256) default null,
  "startDate" date default null,
  "endDate" date default null,
  "streamingNetworks" text default null,
  "realityShowSeriesId" uuid not null,
  CONSTRAINT "fk_realityShowSeason_realityShowSeries_realityShowSeriesId"
    FOREIGN KEY ("realityShowSeriesId") REFERENCES "show"."realityShowSeries"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "show"."participant" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "ingressDate" timestamptz default null,
  "exitDate" timestamptz default null,
  "realityShowSeasonId" uuid not null,
  "personId" uuid not null,
  CONSTRAINT "fk_participant_realityShowSeason_realityShowSeasonId"
    FOREIGN KEY ("realityShowSeasonId") REFERENCES "show"."realityShowSeason"("id"),
  CONSTRAINT "fk_participant_person_personId" FOREIGN KEY ("personId") REFERENCES "core"."person"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "show"."realityShowSeasonEvent" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "occurredAt" timestamptz default now(),
  "type" varchar(256) not null,
  "description" text default null,
  "metadata" jsonb default null,
  "realityShowSeasonId" uuid not null,
  CONSTRAINT "fk_realityShowSeasonEvent_realityShowSeason_realityShowSeasonId" FOREIGN KEY ("realityShowSeasonId") REFERENCES "show"."realityShowSeason"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "show"."realityShowSeasonEventParticipant" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "role" varchar(256) default null,
  "description" text default null,
  "metadata" jsonb default null,
  "realityShowSeasonEventId" uuid not null,
  "participantId" uuid not null,
  CONSTRAINT "fk_realityShowSeasonEventParticipant_realityShowSeasonEvent_realityShowSeasonEventId"
    FOREIGN KEY ("realityShowSeasonEventId") REFERENCES "show"."realityShowSeasonEvent"("id"),
  CONSTRAINT "fk_participant_participantId" FOREIGN KEY ("participantId") REFERENCES "show"."participant"("id"),
  PRIMARY KEY ("id")
);

-- game schema --
create schema if not exists game
    authorization postgres;
comment on schema game
    is 'game defines how a game cycle works for a show, but it does not include a market by default';
grant all on schema game to postgres;
 
-- game tables --
create table if not exists "game"."game" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "title" varchar(256) default null,
  "realityShowSeriesId" uuid not null,
  CONSTRAINT "fk_game_realityShowSeries_realityShowSeriesId" 
    FOREIGN KEY ("realityShowSeriesId") REFERENCES "show"."realityShowSeries"("id")
  PRIMARY KEY ("id")
);

create table if not exists "game"."gameSeason" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "startDate" timestamptz default null,
  "endDate" timestamptz default null,
  "gameId" uuid not null,
  "realityShowSeasonId" uuid not null,
  CONSTRAINT "fk_gameSeason_game_gameId" FOREIGN KEY ("gameId") REFERENCES "game"."game"("id"),
  CONSTRAINT "fk_gameSeason_realityShowSeason_realityShowSeasonId"
    FOREIGN KEY ("realityShowSeasonId") REFERENCES "show"."realityShowSeason"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "game"."gameSeasonCycle" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "startDate" timestamptz default null,
  "endDate" timestamptz default null,
  "gameSeasonId" uuid not null,
  CONSTRAINT "fk_gameSeasonCycle_gameSeason_gameSeasonId"
    FOREIGN KEY ("gameSeasonId") REFERENCES "game"."gameSeason"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "game"."gameSeasonPlayer" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "gameSeasonId" uuid not null,
  "personId" uuid not null,
  CONSTRAINT "fk_gameSeasonPlayer_gameSeason_gameSeasonId"
    FOREIGN KEY ("gameSeasonId") REFERENCES "game"."gameSeason"("id"),
  CONSTRAINT "fk_gameSeasonPlayer_person_personId"
    FOREIGN KEY ("personId") REFERENCES "core"."person"("id")
  PRIMARY KEY ("id")
);

create table if not exists "game"."gameSeasonCyclePlayerRating" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "completedAt" timestamptz default null,
  "answers" jsonb default null,
  "playerId" uuid not null,
  "gameSeasonCycleId" uuid not null,
  CONSTRAINT "fk_gameSeasonCyclePlayerRating_gameSeasonPlayer_playerId"
    FOREIGN KEY ("playerId") REFERENCES "game"."gameSeasonPlayer"("id"),
  CONSTRAINT "fk_gameSeasonCyclePlayerRating_gameSeasonCycle_gameSeasonCycleId"
    FOREIGN KEY ("gameSeasonCycleId") REFERENCES "game"."gameSeasonCycle"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "game"."playerRating" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "rating" decimal not null,
  "participantId" uuid not null,
  "gameSeasonCyclePlayerRatingId" uuid not null,
  "previousRatingId" uuid default null,
  CONSTRAINT "fk_playerRating_participant_participantId"
    FOREIGN KEY ("participantId") REFERENCES "show"."participant"("id"),
  CONSTRAINT "fk_playerRationg_gameSeasonCyclePlayerRating"
    FOREIGN KEY ("gameSeasonCyclePlayerRatingId") REFERENCES "game"."gameSeasonCyclePlayerRating"("id"),
  CONSTRAINT "fk_playerRating_playerRating_previousRatingId"
    FOREIGN KEY ("previousRatingId") REFERENCES "game"."playerRating"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "game"."participantRating" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "rating" decimal not null,
  "participantId" uuid not null,
  "gameSeasonCycleId" uuid default null,
  "previousRatingId" uuid default null,
  CONSTRAINT "fk_participantRating_participantId"
    FOREIGN KEY ("participantId") REFERENCES "show"."participant"("id"),
  CONSTRAINT "fk_participantRating_previousRatingId"
    FOREIGN KEY ("previousRatingId") REFERENCES "game"."participantRating"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "game"."panelMember" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "isPermanent" boolean default false,
  "personId" uuid not null,
  "gameSeasonCycleId" uuid not null,
  CONSTRAINT "fk_panelMember_person_personId"
    FOREIGN KEY ("personId") REFERENCES "core"."person"("id"),
  CONSTRAINT "fk_panelMember_gameSeasonCycle_gameSeasonCycleId"
    FOREIGN KEY ("gameSeasonCycleId") REFERENCES "game"."gameSeasonCycle"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "game"."panelMemberRating" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "rating" decimal not null,
  "observation" text default null,
  "panelMemberId" uuid not null,
  PRIMARY KEY ("id")
);

-- gameMarket schema --
create schema if not exists "gameMarket"
    authorization postgres;
  
grant all on "gameMarket" to postgres;

-- gameMarket tables --
create table if not exists "gameMarket"."gameSeasonMarket" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "gameSeason_id" uuid not null,
  CONSTRAINT "fk_market_game_season_id" FOREIGN KEY ("gameSeason_id") REFERENCES "game"."gameSeason"("id"),
  PRIMARY KEY "id"
);

create table if not exists "gameMarket"."playerBankAccount" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "playerId" uuid not null,
  "gameSeasonMarketId" uuid not null,
  CONSTRAINT "fk_playerBankAccount_gameSeasonPlayer_playerId" FOREIGN KEY ("playerId")
    REFERENCES "game"."gameSeasonPlayer"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "gameMarket"."gameSeasonMarketCycle" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "gameSeasonMarketId" uuid not null,
  CONSTRAINT "fk_season_market_market_cycle_id" FOREIGN KEY ("gameSeasonMarket_id") REFERENCES "gameMarket"."gameSeasonMarket"("id"),
  PRIMARY KEY "id"
);

create table if not exists "gameMarket"."stock" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "participantId" uuid not null,
  CONSTRAINT "fk_stock_participant_participantId" FOREIGN KEY ("participantId") REFERENCES "show"."participant"("id"),
  PRIMARY KEY "id"
);

create table if not exists "gameMarket"."stock" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "participant_id" uuid not null,
  CONSTRAINT "fk_stock_participant_id" FOREIGN KEY ("participant_id") REFERENCES "show"."participant"("id"),
  PRIMARY KEY "id"
);

create table if not exists "gameMarket"."stock" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "participant_id" uuid not null,
  CONSTRAINT "fk_stock_participant_id" FOREIGN KEY ("participant_id") REFERENCES "show"."participant"("id"),
  PRIMARY KEY "id"
);

create table if not exists "gameMarket"."stock" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "participant_id" uuid not null,
  CONSTRAINT "fk_stock_participant_id" FOREIGN KEY ("participant_id") REFERENCES "show"."participant"("id"),
  PRIMARY KEY "id"
);