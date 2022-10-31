begin;

-- core schema --
create schema if not exists "core"
  authorization postgres;
comment on schema "core"
  is 'core contains all base entities of the domain';

grant all on schema "core" to postgres;

-- core table --
create table if not exists "core"."person" (
  "id" uuid NOT NULL default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "firstName" varchar(1024) not null,
  "lastName" varchar(2056) default null,
  "nickname" varchar(256) default null,
  "birthDate" date default null,
  "userId" uuid default null,
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
  "userId" uuid default null,
  CONSTRAINT fk_cpp_cp_ownerId
    FOREIGN KEY ("ownerId") REFERENCES "core"."person"("id"),
  PRIMARY KEY("id")
);

-- show schema --
create schema if not exists "show"
  authorization postgres;
comment on schema "show"
  is 'reality shows related meta information';

grant all on schema "show" to postgres;

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
  "realityShowId" uuid default not null,
  CONSTRAINT fk_rss_rs_realityShowId
    FOREIGN KEY ("realityShowId") REFERENCES "show"."realityShow"("id"),
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
  CONSTRAINT fk_srss_srss_realityShowSeriesId
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
  CONSTRAINT fk_sp_srss_realityShowSeasonId
    FOREIGN KEY ("realityShowSeasonId") REFERENCES "show"."realityShowSeason"("id"),
  CONSTRAINT fk_sp_cp_personId
    FOREIGN KEY ("personId") REFERENCES "core"."person"("id"),
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
  CONSTRAINT fk_srsse_srss_realityShowSeasonId
    FOREIGN KEY ("realityShowSeasonId") REFERENCES "show"."realityShowSeason"("id"),
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
  CONSTRAINT fk_srssep_srsse_realityShowSeasonEventId
    FOREIGN KEY ("realityShowSeasonEventId") REFERENCES "show"."realityShowSeasonEvent"("id"),
  CONSTRAINT fk_srssep_sp_participantId
    FOREIGN KEY ("participantId") REFERENCES "show"."participant"("id"),
  PRIMARY KEY ("id")
);

-- game schema --
create schema if not exists "game"
  authorization postgres;
comment on schema "game"
  is 'game defines how a game cycle works for a show, but it does not include a market by default';
grant all on schema "game" to postgres;
 
-- game tables --
create table if not exists "game"."game" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "title" varchar(256) default null,
  "realityShowSeriesId" uuid not null,
  CONSTRAINT fk_gg_srss_realityShowSeriesId 
    FOREIGN KEY ("realityShowSeriesId") REFERENCES "show"."realityShowSeries"("id"),
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
  CONSTRAINT fk_ggs_gg_gameId
    FOREIGN KEY ("gameId") REFERENCES "game"."game"("id"),
  CONSTRAINT fk_ggs_srss_realityShowSeasonId
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
  CONSTRAINT fk_ggsc_ggs_gameSeasonId
    FOREIGN KEY ("gameSeasonId") REFERENCES "game"."gameSeason"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "game"."gameSeasonPlayer" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "gameSeasonId" uuid not null,
  "personId" uuid not null,
  CONSTRAINT fk_ggsp_ggs_gameSeasonId
    FOREIGN KEY ("gameSeasonId") REFERENCES "game"."gameSeason"("id"),
  CONSTRAINT fk_ggsp_cp_personId
    FOREIGN KEY ("personId") REFERENCES "core"."person"("id"),
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
  CONSTRAINT fk_ggscpr_ggsp_playerId
    FOREIGN KEY ("playerId") REFERENCES "game"."gameSeasonPlayer"("id"),
  CONSTRAINT fk_ggscpr_ggsc_gameSeasonCycleId
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
  CONSTRAINT fk_gpr_sp_participantId
    FOREIGN KEY ("participantId") REFERENCES "show"."participant"("id"),
  CONSTRAINT fk_gpr_ggscpr_gameSeasonCyclePlayerRatingId
    FOREIGN KEY ("gameSeasonCyclePlayerRatingId") REFERENCES "game"."gameSeasonCyclePlayerRating"("id"),
  CONSTRAINT fk_gpr_gpr_previousRatingId
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
  CONSTRAINT fk_gpr_sp_participantId
    FOREIGN KEY ("participantId") REFERENCES "show"."participant"("id"),
  CONSTRAINT fk_gpr_gpr_previousRatingId
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
  CONSTRAINT fk_gpm_cp_personId
    FOREIGN KEY ("personId") REFERENCES "core"."person"("id"),
  CONSTRAINT fk_gpm_ggsc_gameSeasonCycleId
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
comment on schema "gameMarket"
  is '';
  
grant all on schema "gameMarket" to postgres;

-- gameMarket tables --
create table if not exists "gameMarket"."gameSeasonMarket" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "startDate" timestamptz default null,
  "endDate" timestamptz default null,
  "gameSeasonId" uuid not null,
  CONSTRAINT fk_gmgsm_ggs_gameSeasonId
    FOREIGN KEY ("gameSeasonId") REFERENCES "game"."gameSeason"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "gameMarket"."gameSeasonMarketCycle" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "startDate" timestamptz default null,
  "endDate" timestamptz default null,
  "gameSeasonMarketId" uuid not null,
  "previousGameSeasonMarketCycleId" uuid null,
  CONSTRAINT fk_gmgsmc_gmgsm_gameSeasonMarketId
    FOREIGN KEY ("gameSeasonMarketId") REFERENCES "gameMarket"."gameSeasonMarket"("id"),
  CONSTRAINT fk_gmgsmc_gmgsmc_previousGameSeasonMarketCycleId
    FOREIGN KEY ("gameSeasonMarketId") REFERENCES "gameMarket"."gameSeasonMarketCycle"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "gameMarket"."playerBankAccount" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "availableFunds" decimal default(0),
  "playerId" uuid not null,
  "gameSeasonMarketId" uuid not null,
  CONSTRAINT fk_gmpba_ggsp_playerId
    FOREIGN KEY ("playerId") REFERENCES "game"."gameSeasonPlayer"("id"),
  CONSTRAINT fk_gmpba_gmgsm_gameSeasonMarketId
    FOREIGN KEY ("gameSeasonMarketId") REFERENCES "gameMarket"."gameSeasonMarket"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "gameMarket"."stock" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "price" decimal not null,
  "participantId" uuid not null,
  "gameSeasonMarketId" uuid not null,
  CONSTRAINT fk_gms_sp_participantId
    FOREIGN KEY ("participantId") REFERENCES "show"."participant"("id"),
  CONSTRAINT fk_gms_gmgsm_gameSeasonMarketId
    FOREIGN KEY ("gameSeasonMarketId") REFERENCES "gameMarket"."gameSeasonMarket"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "gameMarket"."stockSnapshot" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "snapshotTimestamp" timestamptz default now(),
  "price" decimal not null,
  "participantId" uuid not null,
  "gameSeasonMarketCycleId" uuid not null,
  CONSTRAINT fk_gmss_sp_participantId
    FOREIGN KEY ("participantId") REFERENCES "show"."participant"("id"),
  CONSTRAINT fk_gmss_gmgsmc_gameSeasonMarketCycleId
    FOREIGN KEY ("gameSeasonMarketCycleId") REFERENCES "gameMarket"."gameSeasonMarketCycle"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "gameMarket"."stockOwnership" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "ammountOfStocksHold" integer default(0), 
  "stockId" uuid not null,
  "playerBankAccountId" uuid not null,
  CONSTRAINT fk_gmso_gms_stockId
    FOREIGN KEY ("stockId") REFERENCES "gameMarket"."stock"("id"),
  CONSTRAINT fk_gmso_gmpba_playerBankAccountId
    FOREIGN KEY ("playerBankAccountId") REFERENCES "gameMarket"."playerBankAccount"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "gameMarket"."stockTransaction" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "transactionTimestamp" timestamptz default now(),
  "stockAmmount" integer default(0), 
  "priceAtTransaction" decimal not null,
  "stockId" uuid not null,
  "stockOwnershipId" uuid not null,
  CONSTRAINT fk_gmst_gms_stockId
    FOREIGN KEY ("stockId") REFERENCES "gameMarket"."stock"("id"),
  CONSTRAINT fk_gmst_gmso_stockOwnershipId
    FOREIGN KEY ("stockOwnershipId") REFERENCES "gameMarket"."stockOwnership"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "gameMarket"."leaderboardPlayerRank" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "position" integer not null,
  "gameSeasonMarketId" uuid not null,
  "gameSeasonPlayerId" uuid not null,
  CONSTRAINT fk_gmlpr_gmgsm_gameSeasonMarketId
    FOREIGN KEY ("gameSeasonMarketId") REFERENCES "gameMarket"."gameSeasonMarket"("id"),
  CONSTRAINT fk_gmlpr_ggsp_gameSeasonPlayerId
    FOREIGN KEY ("gameSeasonPlayerId") REFERENCES "game"."gameSeasonPlayer"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "gameMarket"."leaderboardBadge" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(), 
  "badgeDescription" varchar(256) not null,
  "badgeImage" varchar(1024) null,
  "leaderboardPlayerRankId" uuid not null,
  CONSTRAINT fk_gmlb_gmlpr_learderboardPlayerRankId
    FOREIGN KEY ("leaderboardPlayerRankId") REFERENCES "gameMarket"."leaderboardPlayerRank"("id"),
  PRIMARY KEY ("id")
);

commit;
