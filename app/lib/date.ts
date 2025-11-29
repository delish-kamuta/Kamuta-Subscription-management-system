// Centralized date utilities for consistent parsing & range checks
// Supports formats like:
//  - "YYYY-MM-DD"
//  - "Mon D, YYYY" (e.g., "Jan 6, 2022")
//  - Meal logs format "Jan 6, 2022 07:00 AM" (date part extracted)

const MONTHS: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

// Convert supported date string into comparable yyyymmdd numeric key.
export function toDateKey(value: string | undefined | null): number | null {
  if (!value) return null;
  const v = value.trim();

  // Full date-time with time portion -> split and keep first 3 segments for date
  // Example: "Jan 6, 2022 07:00 AM" => ["Jan", "6,", "2022", ...]
  const parts = v.split(" ");
  if (parts.length >= 3 && /[A-Za-z]{3}/.test(parts[0]) && parts[1].includes(",")) {
    // Normalize like subscription format "Mon D, YYYY"
    const cleanedDate = `${parts[0]} ${parts[1].replace(",", "")} ${parts[2]}`;
    return monDayYearToKey(cleanedDate);
  }

  // ISO yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split("-").map(Number);
    if (!y || !m || !d) return null;
    return y * 10000 + m * 100 + d;
  }

  // "Mon D, YYYY" direct
  if (/[A-Za-z]{3} \d{1,2}, \d{4}/.test(v)) {
    return monDayYearToKey(v.replace(",", ""));
  }

  return null;
}

function monDayYearToKey(value: string): number | null {
  const segs = value.split(/\s+/); // [Mon, D, YYYY]
  if (segs.length !== 3) return null;
  const mon = MONTHS[segs[0]];
  const d = Number(segs[1]);
  const y = Number(segs[2]);
  if (!mon || !d || !y) return null;
  return y * 10000 + mon * 100 + d;
}

export function isWithinRange(
  key: number | null,
  fromKey: number | null,
  toKey: number | null
): boolean {
  if (!key) return true; // if parsing failed, don't exclude
  if (fromKey && key < fromKey) return false;
  if (toKey && key > toKey) return false;
  return true;
}

// Convenience for building ISO date keys from "YYYY-MM-DD"
export function isoToKey(iso: string | undefined): number | null {
  if (!iso) return null;
  return toDateKey(iso);
}
