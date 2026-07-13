/**
 * Open the native date picker from any click inside a date field.
 * Chromium normally reserves this action for the small calendar indicator,
 * which makes custom full-width date controls feel visually misaligned.
 */
export function openDatePicker(input: HTMLInputElement): boolean {
  input.focus({ preventScroll: true });

  if (typeof input.showPicker !== "function") {
    return false;
  }

  try {
    input.showPicker();
    return true;
  } catch {
    // Browsers can reject showPicker() for disabled/read-only inputs or when
    // the call is not considered a direct user gesture. Native behavior stays
    // available as the fallback.
    return false;
  }
}
