// Ported from big-brother-season-data-vis/src/lib/mockData.ts.
// Typed fixtures for tests + the data seam's "now" path. 13 players, 7 weeks.
// Preserves the original's exact shapes and values so parity tests are meaningful.

import type { Player, PublicState, Week, WeekRanking } from './types'
import { buildPublicState } from './rankings'

export const mockSeason = {
  id: 'season-30',
  number: 30,
  status: 'current' as const,
}

export const mockPlayers: Player[] = [
  ['rachel', 'Rachel', '#f0445f', 'active', null],
  ['ashley', 'Ashley', '#9b39d0', 'active', null],
  ['will', 'Will', '#3d8b8b', 'active', null],
  ['morgan', 'Morgan', '#58bf63', 'active', null],
  ['ava', 'Ava', '#fb8f3d', 'active', null],
  ['vince', 'Vince', '#8f1f12', 'active', null],
  ['lauren', 'Lauren', '#ffe34a', 'active', null],
  ['katherine', 'Katherine', '#e243d8', 'active', null],
  ['mickey', 'Mickey', '#586ce5', 'active', null],
  ['keanu', 'Keanu', '#a8732b', 'active', null],
  ['kelley', 'Kelley', '#a9ffc2', 'eliminated', 7],
  ['joey', 'Joey', '#f7b7b2', 'eliminated', 3],
  ['jessica', 'Jessica', '#f8f1b4', 'eliminated', 5],
].map(([id, name, color, status, eliminatedWeek]) => ({
  id: String(id),
  seasonId: mockSeason.id,
  name: String(name),
  color: String(color),
  imageUrl: `/players/${String(id)}.svg`,
  status: status as Player['status'],
  eliminatedWeek: eliminatedWeek === null ? null : Number(eliminatedWeek),
}))

export const mockWeeks: Week[] = Array.from({ length: 7 }, (_, index) => {
  const weekNumber = index + 1
  return {
    id: `week-${weekNumber}`,
    seasonId: mockSeason.id,
    weekNumber,
    title: `Week ${weekNumber}`,
    status: weekNumber === 7 ? 'current' : 'previous',
    isPublished: true,
  }
})

const weeklyOrders = [
  ['rachel', 'morgan', 'lauren', 'mickey', 'ashley', 'katherine', 'will', 'joey', 'jessica', 'ava', 'vince', 'keanu', 'kelley'],
  ['ava', 'rachel', 'mickey', 'morgan', 'will', 'joey', 'katherine', 'jessica', 'ashley', 'lauren', 'vince', 'kelley', 'keanu'],
  ['ava', 'rachel', 'mickey', 'morgan', 'will', 'joey', 'ashley', 'jessica', 'katherine', 'lauren', 'vince', 'kelley'],
  ['ava', 'rachel', 'ashley', 'will', 'lauren', 'jessica', 'katherine', 'vince', 'keanu', 'morgan', 'mickey', 'kelley'],
  ['rachel', 'ava', 'ashley', 'will', 'lauren', 'morgan', 'jessica', 'vince', 'keanu', 'mickey', 'kelley'],
  ['rachel', 'ava', 'will', 'katherine', 'lauren', 'keanu', 'vince', 'ashley', 'morgan', 'mickey', 'kelley'],
  ['rachel', 'ashley', 'will', 'morgan', 'ava', 'vince', 'lauren', 'katherine', 'mickey', 'keanu', 'kelley'],
]

export const mockRankings: WeekRanking[] = weeklyOrders.map((order, index) => ({
  weekId: `week-${index + 1}`,
  weekNumber: index + 1,
  entries: order.map((playerId, orderIndex) => ({
    playerId,
    rank: orderIndex + 1,
    score: Math.round((100 - orderIndex * 5.7 + index * 1.3) * 10) / 10,
    revealed: index + 1 < 7,
  })),
}))

export const mockPublicState: PublicState = buildPublicState(
  mockSeason,
  mockWeeks,
  mockPlayers,
  mockRankings,
  'week-7',
  'week-7',
  3,
)
