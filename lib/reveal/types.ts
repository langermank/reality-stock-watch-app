// Ported verbatim from big-brother-season-data-vis/src/types/domain.ts.
// FROZEN: the original author owns these shapes. Do not redesign or rename.

export type PlayerStatus = 'active' | 'eliminated'

export type SeasonStatus = 'current' | 'previous'

export type Player = {
  id: string
  seasonId: string
  name: string
  color: string
  imageUrl: string
  status: PlayerStatus
  eliminatedWeek: number | null
}

export type Week = {
  id: string
  seasonId: string
  weekNumber: number
  status: SeasonStatus
  title: string
  isPublished: boolean
}

export type RankingEntry = {
  playerId: string
  rank: number
  score: number
  revealed: boolean
}

export type WeekRanking = {
  weekId: string
  weekNumber: number
  entries: RankingEntry[]
}

export type RevealState = {
  seasonId: string
  currentWeekId: string
  selectedWeekId: string
  revealCount: number
  updatedAt: string
}

export type PlayerMovement = {
  playerId: string
  rank: number
  previousRank: number | null
  movement: number
  visualRank: number
}

export type StatCard = {
  label: string
  playerId: string | null
  value: string
  detail: string
  tone: 'up' | 'steady' | 'down'
}

export type PublicState = {
  season: {
    id: string
    number: number
    status: SeasonStatus
  }
  weeks: Week[]
  players: Player[]
  rankings: WeekRanking[]
  reveal: RevealState
  movements: PlayerMovement[]
  stats: StatCard[]
}

export type AdminState = PublicState & {
  authenticated: true
}
