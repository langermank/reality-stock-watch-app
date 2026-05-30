// Ported verbatim from big-brother-season-data-vis/src/lib/rankings.ts.
// FROZEN: behavior-preserving port. Do not redesign, rename, or "improve".
// Locked by parity tests in rankings.test.ts.

import type {
  Player,
  PlayerMovement,
  PublicState,
  RankingEntry,
  StatCard,
  Week,
  WeekRanking,
} from './types'

export function entriesForWeek(rankings: WeekRanking[], weekNumber: number) {
  return rankings.find((ranking) => ranking.weekNumber === weekNumber)?.entries ?? []
}

export function visibleEntriesForWeek(
  rankings: WeekRanking[],
  weekNumber: number,
  revealCount: number,
) {
  return entriesForWeek(rankings, weekNumber)
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .map((entry, index) => ({
      ...entry,
      revealed: index < revealCount || entry.revealed,
    }))
}

export function getActivePlayersForWeek(players: Player[], weekNumber: number) {
  return players.filter(
    (player) => player.eliminatedWeek === null || player.eliminatedWeek > weekNumber,
  )
}

export function calculateVisualRank(rank: number, activeCount: number) {
  if (activeCount <= 1) {
    return 1
  }

  return 1 + ((rank - 1) / (activeCount - 1)) * 10
}

export function calculateMovement(
  playerId: string,
  weekNumber: number,
  rankings: WeekRanking[],
  players: Player[],
) {
  const currentEntries = entriesForWeek(rankings, weekNumber)
  const previousEntries = entriesForWeek(rankings, weekNumber - 1)
  const current = currentEntries.find((entry) => entry.playerId === playerId)
  const previous = previousEntries.find((entry) => entry.playerId === playerId)

  if (!current || !previous) {
    return 0
  }

  const removedAbove = previousEntries.filter((entry) => {
    const player = players.find((candidate) => candidate.id === entry.playerId)
    return (
      entry.rank < previous.rank &&
      player?.eliminatedWeek !== null &&
      player?.eliminatedWeek === weekNumber
    )
  }).length

  const expectedRank = previous.rank - removedAbove
  return expectedRank - current.rank
}

export function calculateMovements(
  selectedWeekNumber: number,
  rankings: WeekRanking[],
  players: Player[],
): PlayerMovement[] {
  const entries = entriesForWeek(rankings, selectedWeekNumber).slice().sort((a, b) => a.rank - b.rank)
  const previousEntries = entriesForWeek(rankings, selectedWeekNumber - 1)
  const activeCount = Math.max(entries.length, 1)

  return entries.map((entry) => ({
    playerId: entry.playerId,
    rank: entry.rank,
    previousRank: previousEntries.find((previous) => previous.playerId === entry.playerId)?.rank ?? null,
    movement: calculateMovement(entry.playerId, selectedWeekNumber, rankings, players),
    visualRank: calculateVisualRank(entry.rank, activeCount),
  }))
}

function playerName(players: Player[], playerId: string | null) {
  return players.find((player) => player.id === playerId)?.name ?? 'No data'
}

export function calculateStats(
  selectedWeekNumber: number,
  rankings: WeekRanking[],
  players: Player[],
): StatCard[] {
  const movements = calculateMovements(selectedWeekNumber, rankings, players)
  const improved = movements.reduce<PlayerMovement | null>(
    (best, movement) => (best === null || movement.movement > best.movement ? movement : best),
    null,
  )
  const dropped = movements.reduce<PlayerMovement | null>(
    (worst, movement) => (worst === null || movement.movement < worst.movement ? movement : worst),
    null,
  )

  const recentWeeks = rankings
    .filter((ranking) => ranking.weekNumber <= selectedWeekNumber)
    .slice(-4)

  const consistency = players
    .map((player) => {
      const ranks = recentWeeks
        .map((ranking) => ranking.entries.find((entry) => entry.playerId === player.id)?.rank)
        .filter((rank): rank is number => typeof rank === 'number')

      if (ranks.length < 2) {
        return null
      }

      const average = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length
      const variance =
        ranks.reduce((sum, rank) => sum + Math.abs(rank - average), 0) / ranks.length
      return { playerId: player.id, variance, bestRank: Math.min(...ranks) }
    })
    .filter((entry): entry is { playerId: string; variance: number; bestRank: number } => entry !== null)
    .sort((a, b) => a.variance - b.variance || a.bestRank - b.bestRank)[0]

  return [
    {
      label: 'Most Improved',
      playerId: improved?.playerId ?? null,
      value: playerName(players, improved?.playerId ?? null),
      detail:
        improved && improved.movement > 0
          ? `Rose ${improved.movement} ${improved.movement === 1 ? 'spot' : 'spots'} this week`
          : 'No upward movement this week',
      tone: 'up',
    },
    {
      label: 'Most Consistent',
      playerId: consistency?.playerId ?? null,
      value: playerName(players, consistency?.playerId ?? null),
      detail: consistency ? 'Held the steadiest recent ranking arc' : 'Needs more weeks of data',
      tone: 'steady',
    },
    {
      label: 'Biggest Drop',
      playerId: dropped?.playerId ?? null,
      value: playerName(players, dropped?.playerId ?? null),
      detail:
        dropped && dropped.movement < 0
          ? `Fell ${Math.abs(dropped.movement)} ${Math.abs(dropped.movement) === 1 ? 'spot' : 'spots'} this week`
          : 'No downward movement this week',
      tone: 'down',
    },
  ]
}

export function buildPublicState(
  season: PublicState['season'],
  weeks: Week[],
  players: Player[],
  rankings: WeekRanking[],
  currentWeekId: string,
  selectedWeekId: string,
  revealCount: number,
  updatedAt = new Date().toISOString(),
): PublicState {
  const selectedWeek = weeks.find((week) => week.id === selectedWeekId) ?? weeks.at(-1)
  const selectedWeekNumber = selectedWeek?.weekNumber ?? 1
  const hydratedRankings = rankings.map((ranking) => ({
    ...ranking,
    entries: orderEntries(ranking.entries).map((entry, index) => ({
      ...entry,
      revealed:
        ranking.weekNumber < selectedWeekNumber ||
        (ranking.weekNumber === selectedWeekNumber && index < revealCount) ||
        entry.revealed,
    })),
  }))

  return {
    season,
    weeks,
    players,
    rankings: hydratedRankings,
    reveal: {
      seasonId: season.id,
      currentWeekId,
      selectedWeekId,
      revealCount,
      updatedAt,
    },
    movements: calculateMovements(selectedWeekNumber, rankings, players),
    stats: calculateStats(selectedWeekNumber, rankings, players),
  }
}

export function orderEntries(entries: RankingEntry[]) {
  return entries.slice().sort((a, b) => a.rank - b.rank)
}
