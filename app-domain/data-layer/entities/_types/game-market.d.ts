/// <reference path="./core.d.ts" />

export namespace GameMarket {
  export interface GameSeasonMarket extends Core.EntityRecord {
    startDate: ?Date;
    endDate: ?Date;
    gameSeasonId: Core.Uuid;
  }

  export interface GameSeasonMarketCycle extends Core.EntityRecord {
    startDate: ?Date;
    endDate: ?Date;
    gameSeasonMarketId: Core.Uuid;
    previousGameSeasonMarketCycleId: Core.Uuid;
  }

  export interface PlayerBankAccount extends Core.EntityRecord {
    availableFunds: number;
    playerId: Core.Uuid;
    gameSeasonMarketId: Core.Uuid;
  }

  export interface Stock extends Core.EntityRecord {
    price: number;
    participantId: Core.Uuid;
    gameSeasonMarketId: Core.Uuid;
  }

  export interface StockSnapshot extends Core.EntityRecord {
    snapshotTimestamp: ?Date;
    price: number;
    rParticipantId: ?Core.Uuid;
    stockId: Core.Uuid;
  }

  export interface StockOwnership extends Core.EntityRecord {
    amountOfStocksHold: number;
    stockId: Core.Uuid;
    playerBankAccountId: Core.Uuid;
  }

  export interface StockTransaction extends Core.EntityRecord {
    transactionTimestamp: ?Date;
    stockAmount: number;
    priceAtTransaction: number;
    stockId: Core.Uuid;
    stockOwnershipId: Core.Uuid;
  }

  export interface LeaderboardPlayerRankSnapshot extends Core.EntityRecord {
    snapshotTimestamp: number;
    position: number;
    gameSeasonMarketCycleId: Core.Uuid;
    gameSeasonPlayerId: Core.Uuid;
  }

  export interface LeaderboardBadge extends Core.EntityRecord {
    badgeDescription: string;
    badgeImage: string;
    upperPositionRange: number;
    lowerPositionRange: number;
    gameSeasonMarketId: Core.Uuid;
  }

  export interface LeaderboardBadgePlayer extends Core.EntityRecord {
    leaderboardBadgeId: Core.Uuid;
    leaderboardPlayerRankId: ?Core.Uuid;
    playerId: Core.Uuid;
  }
}
