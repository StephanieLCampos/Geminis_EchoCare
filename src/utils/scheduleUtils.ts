import type { ReminderSchedule } from '../types';

/**
 * Converts our UI schedule format to Ray's sendScheduledReminders format.
 * Ray expects: { type, time, daysOfWeek, dayOfMonth, startDate }
 */
export function toRayScheduleFormat(schedule: ReminderSchedule): Record<string, unknown> {
  const type = schedule.frequency ?? 'daily';
  const base: Record<string, unknown> = {
    type,
    time: schedule.time,
  };

  if (type === 'weekly' && schedule.days && schedule.days.length > 0) {
    base.daysOfWeek = schedule.days;
  }

  if (type === 'monthly' && schedule.dayOfMonth !== undefined) {
    base.dayOfMonth = schedule.dayOfMonth;
  }

  if (type === 'once') {
    const [hours, mins] = schedule.time.split(':').map(Number);
    const startDate = schedule.startDate ?? new Date();
    const combined = new Date(startDate);
    combined.setHours(hours ?? 9, mins ?? 0, 0, 0);
    base.startDate = combined;
  }

  return base;
}
