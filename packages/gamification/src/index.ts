// @koda/gamification — XP, níveis, streaks e display

export {
  calculateXP,
  calculateLevel,
  type XPAction,
  type LevelInfo,
} from './xp-calculator'

export {
  updateStreak,
  type StreakResult,
} from './streak-tracker'

export {
  formatXPNotification,
  formatLevelUp,
} from './progress-display'
