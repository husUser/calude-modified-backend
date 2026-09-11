// utils/bookingPeriod.js
//
// Single source of truth for the two-week booking period.
//
// - Periods are exactly 14 days long.
// - A new period opens at 8:30 AM IST, and — because 14 is a
//   multiple of 7 — that transition instant always falls on a Wednesday.
// - IST = UTC+5:30, a fixed offset with no DST, so it's safe to hardcode.
// - All math below is done in UTC milliseconds, so results are identical
//   no matter what timezone the server (or the requester's browser) runs in.
//
// This module is intentionally stateless: nothing needs to be written to
// the database to "open" a new period, and nothing needs to run on a
// schedule. The active period is always derivable from the current instant.
// Historical bookings are never touched — period membership is derived
// from each booking's own `slotDate`, not by moving/deleting rows.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+5:30
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const PERIOD_LENGTH_DAYS = 14;

// Reference anchor: 2024-01-03 is a Wednesday.
// 8:30 AM IST on that date = 3:00 AM UTC.
// Every period boundary, past or future, is `anchor + n * 14 days` for some
// integer n, so it always lands on a Wednesday at 8:30 AM IST.
const ANCHOR_UTC_MS = Date.UTC(2024, 0, 3, 3, 0, 0);

function pad(n) {
  return String(n).padStart(2, "0");
}

// Convert a UTC-ms timestamp into its IST calendar/time parts without
// depending on the server's local timezone or an ICU tz database.
function toISTParts(utcMs) {
  const shifted = new Date(utcMs + IST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(), // 0-based
    date: shifted.getUTCDate(),
  };
}

function isoFromParts(year, month, date) {
  return `${year}-${pad(month + 1)}-${pad(date)}`;
}

// Add `days` calendar days to an (year, month, date) triple.
// Uses Date.UTC purely as a calendar calculator — no timezone is involved
// here since we're just adding whole days to a Y/M/D triple.
function addDays(year, month, date, days) {
  const d = new Date(Date.UTC(year, month, date + days));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    date: d.getUTCDate(),
  };
}

/**
 * Returns the active booking period for a given instant (defaults to now).
 *
 * {
 *   periodIndex,
 *   startDate: 'YYYY-MM-DD',        // first bookable calendar date (IST), inclusive
 *   endDate:   'YYYY-MM-DD',        // last bookable calendar date (IST), inclusive
 *   dates: ['YYYY-MM-DD', ...],     // all 14 calendar dates in the period, in order
 *   transitionAt: Date,             // instant (UTC) this period opened
 *   nextTransitionAt: Date,         // instant (UTC) this period closes
 * }
 */
function getActivePeriod(nowUtcMs = Date.now()) {
  const elapsed = nowUtcMs - ANCHOR_UTC_MS;
  const periodIndex = Math.floor(elapsed / (PERIOD_LENGTH_DAYS * MS_PER_DAY));
  const periodStartUTCms =
    ANCHOR_UTC_MS + periodIndex * PERIOD_LENGTH_DAYS * MS_PER_DAY;
  const periodEndUTCms = periodStartUTCms + PERIOD_LENGTH_DAYS * MS_PER_DAY;

  const { year, month, date } = toISTParts(periodStartUTCms);

  const dates = [];
  for (let i = 0; i < PERIOD_LENGTH_DAYS; i++) {
    const p = addDays(year, month, date, i);
    dates.push(isoFromParts(p.year, p.month, p.date));
  }

  return {
    periodIndex,
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    dates,
    transitionAt: new Date(periodStartUTCms),
    nextTransitionAt: new Date(periodEndUTCms),
  };
}

// Is the given 'YYYY-MM-DD' date within the currently active period?
// Safe to compare as plain strings because they're always fixed-width ISO dates.
function isDateInActivePeriod(dateStr, nowUtcMs = Date.now()) {
  const { startDate, endDate } = getActivePeriod(nowUtcMs);
  return dateStr >= startDate && dateStr <= endDate;
}

// Is the given 'YYYY-MM-DD' date a Saturday or Sunday?
// Pure calendar-date check — no timezone/time-of-day involved.
function isWeekendDate(dateStr) {
  const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const date = Number(m[3]);
  const day = new Date(Date.UTC(year, month, date)).getUTCDay(); // 0=Sun..6=Sat
  return day === 0 || day === 6;
}

module.exports = {
  getActivePeriod,
  isDateInActivePeriod,
  isWeekendDate,
  PERIOD_LENGTH_DAYS,
};
