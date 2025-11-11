export const VALIDATION_RULES = {
  GROUP_NAME_MIN_LENGTH: 3,
  DESCRIPTION_MIN_LENGTH: 10,
  PARTICIPANT_NAME_MIN_LENGTH: 2,
  TIME_FORMAT: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  EMAIL_FORMAT: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
