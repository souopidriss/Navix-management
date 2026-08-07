/**
 * Navix Notifications — Schémas de validation du module Notifications
 */
export {
  notificationSchema,
  sanitizeNotification,
  NOTIFICATION_CHANNEL_KEYS,
  NOTIFICATION_PREFERENCE_TYPE_KEYS,
  notificationPreferenceSchema,
  notificationPreferenceDefaultValues,
  sanitizeNotificationPreferences,
  toNotificationPreferenceView,
  notificationFiltersSchema,
  notificationFilterSchema,
  notificationFilterDefaultValues,
  sanitizeNotificationFilters,
} from './notification.schema';
