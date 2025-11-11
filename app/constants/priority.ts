/**
 * 優先度に関する定数定義
 */

/**
 * 優先度の値
 * - HIGH: 高優先度（1）
 * - MEDIUM: 中優先度（2）
 * - LOW: 低優先度（3）
 */
export const PRIORITY = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
} as const;

/**
 * 優先度の最小値
 */
export const PRIORITY_MIN = PRIORITY.HIGH;

/**
 * 優先度の最大値
 */
export const PRIORITY_MAX = PRIORITY.LOW;

/**
 * デフォルト優先度
 * 新しいTODOアイテムを作成する際のデフォルト値
 */
export const DEFAULT_PRIORITY = PRIORITY.MEDIUM;

/**
 * 優先度のラベル
 * 各優先度に対応する表示用のラベル
 */
export const PRIORITY_LABELS: Record<number, string> = {
  [PRIORITY.HIGH]: '🔴 高',
  [PRIORITY.MEDIUM]: '🟡 中',
  [PRIORITY.LOW]: '🟢 低',
};

/**
 * 優先度の型
 */
export type PriorityValue = typeof PRIORITY[keyof typeof PRIORITY];

