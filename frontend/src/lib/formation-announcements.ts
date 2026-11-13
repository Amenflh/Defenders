const PILATES_ANNOUNCEMENT_END = Date.parse("2026-12-06T23:59:59+01:00");

export function isFeaturedPilatesCoursePast(now: Date = new Date()): boolean {
  return now.getTime() > PILATES_ANNOUNCEMENT_END;
}
