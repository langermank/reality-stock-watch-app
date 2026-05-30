import { describe, expect, it } from 'vitest'

import {
  buildPublicState,
  calculateMovements,
  calculateStats,
  calculateVisualRank,
  getActivePlayersForWeek,
  visibleEntriesForWeek,
} from './rankings'
import { mockPlayers, mockRankings, mockSeason, mockWeeks } from './fixtures'
import {
  aggregate,
  averageRankStrategy,
  bordaStrategy,
  type RankingSubmission,
} from './aggregate'

// Expected values below were captured by running the ORIGINAL
// big-brother-season-data-vis/src/lib/rankings.ts against its mockData.ts.
// These tests lock our port to the original's exact behavior.

describe('visibleEntriesForWeek — reveal gating (top-first, rank-ascending)', () => {
  it('reveals the top `revealCount` entries of the current week, hides the rest', () => {
    const visible = visibleEntriesForWeek(mockRankings, 7, 3).map((e) => ({
      playerId: e.playerId,
      rank: e.rank,
      revealed: e.revealed,
    }))

    expect(visible).toEqual([
      { playerId: 'rachel', rank: 1, revealed: true },
      { playerId: 'ashley', rank: 2, revealed: true },
      { playerId: 'will', rank: 3, revealed: true },
      { playerId: 'morgan', rank: 4, revealed: false },
      { playerId: 'ava', rank: 5, revealed: false },
      { playerId: 'vince', rank: 6, revealed: false },
      { playerId: 'lauren', rank: 7, revealed: false },
      { playerId: 'katherine', rank: 8, revealed: false },
      { playerId: 'mickey', rank: 9, revealed: false },
      { playerId: 'keanu', rank: 10, revealed: false },
      { playerId: 'kelley', rank: 11, revealed: false },
    ])
  })

  it('respects pre-set `revealed: true` on entries even when revealCount is 0', () => {
    // Week 6 fixtures already have revealed:true, so revealCount 0 still shows all.
    const visible = visibleEntriesForWeek(mockRankings, 6, 0)
    expect(visible.every((e) => e.revealed)).toBe(true)
  })

  it('orders entries by rank ascending regardless of input order', () => {
    const ranks = visibleEntriesForWeek(mockRankings, 7, 3).map((e) => e.rank)
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
  })
})

describe('getActivePlayersForWeek', () => {
  it('excludes players eliminated on or before the week', () => {
    // joey out wk3, jessica out wk5, kelley out wk7
    expect(getActivePlayersForWeek(mockPlayers, 7).map((p) => p.id)).toEqual([
      'rachel',
      'ashley',
      'will',
      'morgan',
      'ava',
      'vince',
      'lauren',
      'katherine',
      'mickey',
      'keanu',
    ])
  })

  it('keeps a player active in weeks before their eliminatedWeek', () => {
    // kelley (eliminatedWeek 7) is still active in week 5
    expect(getActivePlayersForWeek(mockPlayers, 5).map((p) => p.id)).toContain('kelley')
  })
})

describe('calculateVisualRank', () => {
  it('maps rank 1 to 1 and bottom rank to 11 across the active field', () => {
    expect(calculateVisualRank(1, 11)).toBe(1)
    expect(calculateVisualRank(11, 11)).toBe(11)
  })

  it('returns 1 when there is at most one active player', () => {
    expect(calculateVisualRank(5, 1)).toBe(1)
  })
})

describe('calculateMovements', () => {
  it('computes rank, previousRank, movement, and visualRank for the selected week', () => {
    expect(calculateMovements(7, mockRankings, mockPlayers)).toEqual([
      { playerId: 'rachel', rank: 1, previousRank: 1, movement: 0, visualRank: 1 },
      { playerId: 'ashley', rank: 2, previousRank: 8, movement: 6, visualRank: 2 },
      { playerId: 'will', rank: 3, previousRank: 3, movement: 0, visualRank: 3 },
      { playerId: 'morgan', rank: 4, previousRank: 9, movement: 5, visualRank: 4 },
      { playerId: 'ava', rank: 5, previousRank: 2, movement: -3, visualRank: 5 },
      { playerId: 'vince', rank: 6, previousRank: 7, movement: 1, visualRank: 6 },
      { playerId: 'lauren', rank: 7, previousRank: 5, movement: -2, visualRank: 7 },
      { playerId: 'katherine', rank: 8, previousRank: 4, movement: -4, visualRank: 8 },
      { playerId: 'mickey', rank: 9, previousRank: 10, movement: 1, visualRank: 9 },
      { playerId: 'keanu', rank: 10, previousRank: 6, movement: -4, visualRank: 10 },
      { playerId: 'kelley', rank: 11, previousRank: 11, movement: 0, visualRank: 11 },
    ])
  })
})

describe('calculateStats', () => {
  it('produces Most Improved / Most Consistent / Biggest Drop cards', () => {
    expect(calculateStats(7, mockRankings, mockPlayers)).toEqual([
      {
        label: 'Most Improved',
        playerId: 'ashley',
        value: 'Ashley',
        detail: 'Rose 6 spots this week',
        tone: 'up',
      },
      {
        label: 'Most Consistent',
        playerId: 'rachel',
        value: 'Rachel',
        detail: 'Held the steadiest recent ranking arc',
        tone: 'steady',
      },
      {
        label: 'Biggest Drop',
        playerId: 'katherine',
        value: 'Katherine',
        detail: 'Fell 4 spots this week',
        tone: 'down',
      },
    ])
  })
})

describe('buildPublicState — mid-reveal (week 7, revealCount 3)', () => {
  const state = buildPublicState(
    mockSeason,
    mockWeeks,
    mockPlayers,
    mockRankings,
    'week-7',
    'week-7',
    3,
    'FIXED-TS',
  )

  it('marks all prior weeks fully revealed', () => {
    const priorWeeks = state.rankings.filter((r) => r.weekNumber < 7)
    expect(priorWeeks.every((r) => r.entries.every((e) => e.revealed))).toBe(true)
  })

  it('reveals only the top `revealCount` entries of the selected week', () => {
    const week7 = state.rankings.find((r) => r.weekNumber === 7)!
    expect(week7.entries.map((e) => ({ rank: e.rank, revealed: e.revealed }))).toEqual([
      { rank: 1, revealed: true },
      { rank: 2, revealed: true },
      { rank: 3, revealed: true },
      { rank: 4, revealed: false },
      { rank: 5, revealed: false },
      { rank: 6, revealed: false },
      { rank: 7, revealed: false },
      { rank: 8, revealed: false },
      { rank: 9, revealed: false },
      { rank: 10, revealed: false },
      { rank: 11, revealed: false },
    ])
  })

  it('passes through the reveal pointer verbatim', () => {
    expect(state.reveal).toEqual({
      seasonId: 'season-30',
      currentWeekId: 'week-7',
      selectedWeekId: 'week-7',
      revealCount: 3,
      updatedAt: 'FIXED-TS',
    })
  })

  it('attaches movements and stats for the selected week', () => {
    expect(state.movements).toEqual(calculateMovements(7, mockRankings, mockPlayers))
    expect(state.stats).toEqual(calculateStats(7, mockRankings, mockPlayers))
  })
})

describe('aggregate — Borda points (default strategy)', () => {
  it('awards (N - position) points per submission and ranks by score desc', () => {
    const submissions: RankingSubmission[] = [
      { order: ['a', 'b', 'c'] }, // a:3 b:2 c:1
      { order: ['b', 'a', 'c'] }, // b:3 a:2 c:1
    ]
    // a:5 b:5 c:2 -> tie between a,b broken by id (localeCompare): a before b
    expect(aggregate(submissions)).toEqual([
      { contestantId: 'a', score: 5, rank: 1 },
      { contestantId: 'b', score: 5, rank: 2 },
      { contestantId: 'c', score: 2, rank: 3 },
    ])
  })

  it('sums points across many submissions to produce a clear winner', () => {
    const submissions: RankingSubmission[] = [
      { order: ['x', 'y', 'z'] },
      { order: ['x', 'z', 'y'] },
      { order: ['y', 'x', 'z'] },
    ]
    // x: 3+3+2 = 8, y: 2+1+3 = 6, z: 1+2+1 = 4
    const result = aggregate(submissions)
    expect(result).toEqual([
      { contestantId: 'x', score: 8, rank: 1 },
      { contestantId: 'y', score: 6, rank: 2 },
      { contestantId: 'z', score: 4, rank: 3 },
    ])
  })

  it('handles a single submission (ranks mirror the submitted order)', () => {
    expect(aggregate([{ order: ['p', 'q', 'r'] }])).toEqual([
      { contestantId: 'p', score: 3, rank: 1 },
      { contestantId: 'q', score: 2, rank: 2 },
      { contestantId: 'r', score: 1, rank: 3 },
    ])
  })

  it('returns an empty list for no submissions', () => {
    expect(aggregate([])).toEqual([])
  })

  it('bordaStrategy is the default', () => {
    const submissions: RankingSubmission[] = [{ order: ['a', 'b'] }]
    expect(aggregate(submissions)).toEqual(aggregate(submissions, bordaStrategy))
  })
})

describe('aggregate — average-rank strategy (swappable)', () => {
  it('ranks by mean finishing position (lower mean = better), inverted for score', () => {
    const submissions: RankingSubmission[] = [
      { order: ['a', 'b', 'c'] }, // a:1 b:2 c:3
      { order: ['b', 'a', 'c'] }, // b:1 a:2 c:3
    ]
    // mean ranks: a 1.5, b 1.5, c 3. maxN=3 -> score = 4 - mean
    const result = aggregate(submissions, averageRankStrategy)
    expect(result).toEqual([
      { contestantId: 'a', score: 2.5, rank: 1 },
      { contestantId: 'b', score: 2.5, rank: 2 },
      { contestantId: 'c', score: 1, rank: 3 },
    ])
  })
})
