/** Reads the value from a Polaris field event. */
export function fieldValue(event: Event): string {
  return (event.currentTarget as HTMLElement & { value?: string }).value ?? "";
}
