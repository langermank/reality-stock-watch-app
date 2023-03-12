--supabase tables for local tests--
create schema if not exists "auth"
  authorization postgres;

create table if not exists "auth"."users" (
  instance_id uuid,
  id uuid NOT NULL,
  aud character varying(255) COLLATE pg_catalog."default",
  role character varying(255) COLLATE pg_catalog."default",
  email character varying(255) COLLATE pg_catalog."default",
  encrypted_password character varying(255) COLLATE pg_catalog."default",
  email_confirmed_at timestamp with time zone,
  invited_at timestamp with time zone,
  confirmation_token character varying(255) COLLATE pg_catalog."default",
  confirmation_sent_at timestamp with time zone,
  recovery_token character varying(255) COLLATE pg_catalog."default",
  recovery_sent_at timestamp with time zone,
  email_change_token_new character varying(255) COLLATE pg_catalog."default",
  email_change character varying(255) COLLATE pg_catalog."default",
  email_change_sent_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  phone character varying(15) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
  phone_confirmed_at timestamp with time zone,
  phone_change character varying(15) COLLATE pg_catalog."default" DEFAULT ''::character varying,
  phone_change_token character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
  phone_change_sent_at timestamp with time zone,
  confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
  email_change_token_current character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
  email_change_confirm_status smallint DEFAULT 0,
  banned_until timestamp with time zone,
  reauthentication_token character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
  reauthentication_sent_at timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_phone_key UNIQUE (phone),
  CONSTRAINT users_email_change_confirm_status_check CHECK (email_change_confirm_status >= 0 AND email_change_confirm_status <= 2)
);


-- public schema
create schema if not exists "public"
  authorization postgres;


-- core tables --
create table if not exists "public"."_core_migrations" (
  "id" uuid not null default gen_random_uuid(),
  "executedAt" timestamptz default now(),
  "name" varchar(512) default null,
  "hash" varchar(1024) default null,
  "queryContent" text default null,
  PRIMARY KEY("id")
);

create table if not exists "public"."core_persons" (
  "id" uuid NOT NULL default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "firstName" varchar(1024) not null,
  "lastName" varchar(2056) default null,
  "nickname" varchar(256) default null,
  "birthDate" date default null,
  "userId" uuid default null,
  PRIMARY KEY("id"),
  CONSTRAINT cp_au_userId
    FOREIGN KEY("userId") REFERENCES "auth"."users"("id")
);
create index if not exists 
  idx_cp_firstName_search ON "public"."core_persons"("firstName" text_pattern_ops);
create index if not exists
  idx_cp_lastName_search ON "public"."core_persons"("lastName" text_pattern_ops);
create index if not exists
  idx_cp_userId ON "public"."core_persons"("userId");

create table if not exists "public"."core_public_profiles" (
  "id" uuid NOT NULL default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "displayName" varchar(256) not null,
  "avatarUrl" varchar(2056) default null,
  "ownerId" uuid default null,
  "rUserId" uuid default null,
  CONSTRAINT fk_cpp_cp_ownerId
    FOREIGN KEY ("ownerId") REFERENCES "public"."core_persons"("id"),
  PRIMARY KEY("id")
);

-- show tables --
create table if not exists "public"."reality_shows" (
  "id" uuid NOT NULL default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "name" varchar(1024) not null,
  "slug" varchar(512) default null,
  "description" text default null,
  "genre" varchar(256) default null,
  "firstAiredDate"  date default null,
  "createdBy" text default null,
  CONSTRAINT uq_rs_slug_key UNIQUE ("slug"),
  PRIMARY KEY ("id")
);
create index if not exists
  idx_show_name_search on "public"."reality_shows"("name" text_pattern_ops);

create table if not exists "public"."reality_show_series" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "name" varchar(1024) not null,
  "slug" varchar(512) default null,
  "description" text default null,
  "streamingNetworks" text default null,
  "realityShowId" uuid not null,
  CONSTRAINT fk_rss_rs_realityShowId
    FOREIGN KEY ("realityShowId") REFERENCES "public"."reality_shows"("id"),
  CONSTRAINT uq_rsses_slug_key UNIQUE ("slug"),
  PRIMARY KEY ("id")
);
create index if not exists
  idx_realityShowSeries_name_search on "public"."reality_show_series"("name" text_pattern_ops);

create table if not exists "public"."reality_show_seasons" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "name" varchar(1024) not null,
  "slug" varchar(512) default null,
  "seasonNumber" varchar(256) default null,
  "startDate" date default null,
  "endDate" date default null,
  "streamingNetworks" text default null,
  "realityShowSeriesId" uuid not null,
  CONSTRAINT fk_srss_srss_realityShowSeriesId
    FOREIGN KEY ("realityShowSeriesId") REFERENCES "public"."reality_show_series"("id"),
  CONSTRAINT uq_rssea_slug_key UNIQUE ("slug"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."reality_show_participants" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "ingressDate" timestamptz default null,
  "exitDate" timestamptz default null,
  "realityShowSeasonId" uuid not null,
  "personId" uuid not null,
  CONSTRAINT fk_sp_srss_realityShowSeasonId
    FOREIGN KEY ("realityShowSeasonId") REFERENCES "public"."reality_show_seasons"("id"),
  CONSTRAINT fk_sp_cp_personId
    FOREIGN KEY ("personId") REFERENCES "public"."core_persons"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."reality_show_season_events" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "occurredAt" timestamptz default now(),
  "type" varchar(256) not null,
  "description" text default null,
  "metadata" jsonb default null,
  "realityShowSeasonId" uuid not null,
  CONSTRAINT fk_srsse_srss_realityShowSeasonId
    FOREIGN KEY ("realityShowSeasonId") REFERENCES "public"."reality_show_seasons"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."reality_show_season_event_participants" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "role" varchar(256) default null,
  "description" text default null,
  "metadata" jsonb default null,
  "realityShowSeasonEventId" uuid not null,
  "participantId" uuid not null,
  CONSTRAINT fk_srssep_srsse_realityShowSeasonEventId
    FOREIGN KEY ("realityShowSeasonEventId") REFERENCES "public"."reality_show_season_events"("id"),
  CONSTRAINT fk_srssep_sp_participantId
    FOREIGN KEY ("participantId") REFERENCES "public"."reality_show_participants"("id"),
  PRIMARY KEY ("id")
);

 
-- game tables --
create table if not exists "public"."games" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "title" varchar(256) default null,
  "slug" varchar(512) not null,
  "realityShowSeriesId" uuid not null,
  CONSTRAINT fk_gg_srss_realityShowSeriesId 
    FOREIGN KEY ("realityShowSeriesId") REFERENCES "public"."reality_show_series"("id"),
  CONSTRAINT uq_g_slug_key UNIQUE ("slug"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_seasons" (
  "id" uuid not null default gen_random_uuid(),
  "slug" varchar(512) not null,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "startDate" timestamptz default null,
  "endDate" timestamptz default null,
  "gameId" uuid not null,
  "realityShowSeasonId" uuid not null,
  CONSTRAINT fk_ggs_gg_gameId
    FOREIGN KEY ("gameId") REFERENCES "public"."games"("id"),
  CONSTRAINT fk_ggs_srss_realityShowSeasonId
    FOREIGN KEY ("realityShowSeasonId") REFERENCES "public"."reality_show_seasons"("id"),
  CONSTRAINT uq_gs_slug_key UNIQUE ("slug"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_season_cycles" (
  "id" uuid not null default gen_random_uuid(),
  "slug" varchar(512) not null,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "startDate" timestamptz default null,
  "endDate" timestamptz default null,
  "gameSeasonId" uuid not null,
  CONSTRAINT fk_ggsc_ggs_gameSeasonId
    FOREIGN KEY ("gameSeasonId") REFERENCES "public"."game_seasons"("id"),
  CONSTRAINT uq_gsc_slug_key UNIQUE ("slug"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_season_players" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "gameSeasonId" uuid not null,
  "personId" uuid not null,
  CONSTRAINT fk_ggsp_ggs_gameSeasonId
    FOREIGN KEY ("gameSeasonId") REFERENCES "public"."game_seasons"("id"),
  CONSTRAINT fk_ggsp_cp_personId
    FOREIGN KEY ("personId") REFERENCES "public"."core_persons"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_season_cycle_player_ratings" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "completedAt" timestamptz default null,
  "answers" jsonb default null,
  "playerId" uuid not null,
  "gameSeasonCycleId" uuid not null,
  CONSTRAINT fk_ggscpr_ggsp_playerId
    FOREIGN KEY ("playerId") REFERENCES "public"."game_season_players"("id"),
  CONSTRAINT fk_ggscpr_ggsc_gameSeasonCycleId
    FOREIGN KEY ("gameSeasonCycleId") REFERENCES "public"."game_season_cycles"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_player_ratings" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "rating" decimal not null,
  "participantId" uuid not null,
  "gameSeasonCyclePlayerRatingId" uuid not null,
  "previousRatingId" uuid default null,
  CONSTRAINT fk_gpr_sp_participantId
    FOREIGN KEY ("participantId") REFERENCES "public"."reality_show_participants"("id"),
  CONSTRAINT fk_gpr_ggscpr_gameSeasonCyclePlayerRatingId
    FOREIGN KEY ("gameSeasonCyclePlayerRatingId") REFERENCES "public"."game_season_cycle_player_ratings"("id"),
  CONSTRAINT fk_gpr_gpr_previousRatingId
    FOREIGN KEY ("previousRatingId") REFERENCES "public"."game_player_ratings"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_participant_ratings" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "rating" decimal not null,
  "participantId" uuid not null,
  "gameSeasonCycleId" uuid default null,
  "previousRatingId" uuid default null,
  CONSTRAINT fk_gpr_sp_participantId
    FOREIGN KEY ("participantId") REFERENCES "public"."reality_show_participants"("id"),
  CONSTRAINT fk_gpr_gpr_previousRatingId
    FOREIGN KEY ("previousRatingId") REFERENCES "public"."game_participant_ratings"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_panel_member" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "isPermanent" boolean default false,
  "personId" uuid not null,
  "gameSeasonCycleId" uuid not null,
  CONSTRAINT fk_gpm_cp_personId
    FOREIGN KEY ("personId") REFERENCES "public"."core_persons"("id"),
  CONSTRAINT fk_gpm_ggsc_gameSeasonCycleId
    FOREIGN KEY ("gameSeasonCycleId") REFERENCES "public"."game_season_cycles"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_panel_member_ratings" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
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
create table if not exists "public"."game_market_seasons" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "startDate" timestamptz default null,
  "endDate" timestamptz default null,
  "gameSeasonId" uuid not null,
  CONSTRAINT fk_gmgsm_ggs_gameSeasonId
    FOREIGN KEY ("gameSeasonId") REFERENCES "public"."game_seasons"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_market_season_cycles" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "startDate" timestamptz default null,
  "endDate" timestamptz default null,
  "gameSeasonMarketId" uuid not null,
  "previousGameSeasonMarketCycleId" uuid null,
  CONSTRAINT fk_gmgsmc_gmgsm_gameSeasonMarketId
    FOREIGN KEY ("gameSeasonMarketId") REFERENCES "public"."game_market_seasons"("id"),
  CONSTRAINT fk_gmgsmc_gmgsmc_previousGameSeasonMarketCycleId
    FOREIGN KEY ("gameSeasonMarketId") REFERENCES "public"."game_market_season_cycles"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_market_player_bank_accounts" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "availableFunds" decimal default(0),
  "playerId" uuid not null,
  "gameSeasonMarketId" uuid not null,
  CONSTRAINT fk_gmpba_ggsp_playerId
    FOREIGN KEY ("playerId") REFERENCES "public"."game_season_players"("id"),
  CONSTRAINT fk_gmpba_gmgsm_gameSeasonMarketId
    FOREIGN KEY ("gameSeasonMarketId") REFERENCES "public"."game_market_seasons"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_market_stocks" (
  "id" uuid not null default gen_random_uuid(),
  "slug" varchar(512) not null,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "price" decimal not null,
  "participantId" uuid not null,
  "gameSeasonMarketId" uuid not null,
  CONSTRAINT fk_gms_sp_participantId
    FOREIGN KEY ("participantId") REFERENCES "public"."reality_show_participants"("id"),
  CONSTRAINT fk_gms_gmgsm_gameSeasonMarketId
    FOREIGN KEY ("gameSeasonMarketId") REFERENCES "public"."game_market_seasons"("id"),
  CONSTRAINT uq_gms_slug_key UNIQUE ("slug"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_market_stock_snapshots" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "snapshotTimestamp" timestamptz default now(),
  "price" decimal not null,
  "rParticipantId" uuid not null,
  "stockId" uuid not null,
  CONSTRAINT fk_gmss_sp_participantId
    FOREIGN KEY ("rParticipantId") REFERENCES "public"."reality_show_participants"("id"),
  CONSTRAINT fk_gmss_gmgsmc_gameSeasonMarketCycleId
    FOREIGN KEY ("stockId") REFERENCES "public"."game_market_stocks"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_market_stock_ownerships" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "amountOfStocksHold" integer default(0),
  "stockId" uuid not null,
  "playerBankAccountId" uuid not null,
  CONSTRAINT fk_gmso_gms_stockId
    FOREIGN KEY ("stockId") REFERENCES "public"."game_market_stocks"("id"),
  CONSTRAINT fk_gmso_gmpba_playerBankAccountId
    FOREIGN KEY ("playerBankAccountId") REFERENCES "public"."game_market_player_bank_accounts"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_market_stock_transactions" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "transactionTimestamp" timestamptz default now(),
  "stockAmount" integer default(0),
  "priceAtTransaction" decimal not null,
  "stockId" uuid not null,
  "stockOwnershipId" uuid not null,
  CONSTRAINT fk_gmst_gms_stockId
    FOREIGN KEY ("stockId") REFERENCES "public"."game_market_stocks"("id"),
  CONSTRAINT fk_gmst_gmso_stockOwnershipId
    FOREIGN KEY ("stockOwnershipId") REFERENCES "public"."game_market_stock_ownerships"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_market_leaderboard_player_snapshots" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "snapshotTimestamp" timestamptz default now(),
  "position" integer not null,
  "gameSeasonMarketCycleId" uuid not null,
  "gameSeasonPlayerId" uuid not null,
  CONSTRAINT fk_gmlpr_gmgsm_gameSeasonMarketId
    FOREIGN KEY ("gameSeasonMarketCycleId") REFERENCES "public"."game_market_season_cycles"("id"),
  CONSTRAINT fk_gmlpr_ggsp_gameSeasonPlayerId
    FOREIGN KEY ("gameSeasonPlayerId") REFERENCES "public"."game_season_players"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_market_leaderboard_badges" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "badgeDescription" varchar(256) not null,
  "badgeImage" varchar(1024) null,
  "upperPositionRange" integer not null,
  "lowerPositionRange" integer not null,
  "gameSeasonMarketId" uuid not null,
  CONSTRAINT fk_gmlb_gmgsm_gameSeasonMakerId
    FOREIGN KEY ("gameSeasonMarketId") REFERENCES "public"."game_market_seasons"("id"),
  PRIMARY KEY ("id")
);

create table if not exists "public"."game_market_leaderboard_badge_players" (
  "id" uuid not null default gen_random_uuid(),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default null,
  "deletedAt" timestamptz default null,
  "leaderboardBadgeId" uuid not null,
  "leaderboardPlayerRankSnapshotId" uuid null,
  "playerId" uuid not null,
  CONSTRAINT fk_gmlbp_gmlb_leaderboardBadgeId
    FOREIGN KEY ("leaderboardBadgeId") REFERENCES "public"."game_market_leaderboard_badges"("id"),
  CONSTRAINT fk_gmlbp_gmlprs_learderboardPlayerRankId
    FOREIGN KEY ("leaderboardPlayerRankSnapshotId") REFERENCES "public"."game_market_leaderboard_player_snapshots"("id"),
  CONSTRAINT fk_gmlbp_gp_playerId
    FOREIGN KEY ("playerId") REFERENCES "public"."game_season_players"("id"),
  PRIMARY KEY ("id")
);
