export const NOTIFICATION_PREFERENCES_KEY = "notificationPreferences";

export type NotificationPreferenceKey =
  | "dailyQuestReminder"
  | "streakProtection"
  | "bossDeadlineWarning"
  | "rewardActivity";

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export const defaultNotificationPreferences: NotificationPreferences = {
  dailyQuestReminder: true,
  streakProtection: true,
  bossDeadlineWarning: true,
  rewardActivity: false,
};

export function normalizeNotificationPreferences(
  preferences?: Partial<NotificationPreferences>,
): NotificationPreferences {
  return {
    ...defaultNotificationPreferences,
    ...preferences,
  };
}
