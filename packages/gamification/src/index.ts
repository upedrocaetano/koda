// @koda/gamification — XP, níveis, streaks e display

export {
  calculateXP,
  calculateLevel,
  type XPAction,
  type LevelInfo,
} from './xp-calculator.js'

export {
  updateStreak,
  type StreakResult,
} from './streak-tracker.js'

export {
  formatXPNotification,
  formatLevelUp,
} from './progress-display.js'
