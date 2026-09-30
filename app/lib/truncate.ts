const DEFAULT_TRUNCATE_LENGTH = 24;

/**
 * Shortens a label to one line with an ellipsis.
 * Pass `length` to change the cut-off; omit it to use the app default.
 */
export function truncateText(
  value: string,
  length: number = DEFAULT_TRUNCATE_LENGTH,
): string {
  const text = value.trim();
  if (length < 1 || text.length <= length) {
    return text;
  }

  return `${text.slice(0, length).trimEnd()}...`;
}
