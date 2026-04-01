export interface Course {
  id: string
  title: string
  emoji: string
  coverColor: string
  coverImage?: string
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  duration: number
  starsToUnlock: number
  content: {
    sheet?: SheetSource
    chordDiagram?: string
    musicXml?: string
  }
  standardNotes?: Note[]
}

export interface SheetSource {
  type: 'upload' | 'url'
  imageUrl?: string
  localPath?: string
}

export interface Note {
  time: number      // seconds
  string: number    // 1-6 (high E to low E)
  fret: number      // 0 = open
  duration?: number
}

export interface Progress {
  totalStars: number
  earnedBadges: string[]
  outfits: string[]
  lessons: {
    [lessonId: string]: {
      completed: boolean
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
  lessonId: string
  studentId: string
  audioBlob?: Blob
  audioUrl?: string
  score?: number
  reviewText?: string
  reviewedAt?: string
  createdAt: string
}
