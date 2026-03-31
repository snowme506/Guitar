export type PracticeStatus = 'pending' | 'in_progress' | 'completed'

export interface Practice {
  id: string
  title: string
  emoji: string
  coverColor: string
  date: string  // 上课日期
  sheet?: SheetSource
  status: PracticeStatus
  score?: number
  attempts: number
}

export interface SheetSource {
  type: 'upload' | 'url'
  imageUrl?: string
  localPath?: string
}

export interface Note {
  time: number
  string: number
  fret: number
  duration?: number
}

export interface Progress {
  totalStars: number
  earnedBadges: string[]
  outfits: string[]
  practices: {
    [practiceId: string]: {
      status: PracticeStatus
      bestScore: number
      starsEarned: number
      attempts: number
      lastPlayed: string
    }
  }
}

export interface Reward {
  id: string
  name: string
  cost: number
  type: 'outfit' | 'badge' | 'effect'
  emoji: string
}

export interface Review {
  id: string
  practiceId: string
  studentId: string
  audioBlob?: Blob
  audioUrl?: string
  score?: number
  reviewText?: string
  reviewedAt?: string
  createdAt: string
}
