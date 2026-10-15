/**
 * Typed helpers for checkout web component events (`checkJs` safe).
 */

/** @param {Event} event */
export function readChoiceListValues(event) {
  const el = /** @type {{ values?: string[] }} */ (event.currentTarget);
  return (el.values ?? []).map(String);
}

/** @param {Event} event */
export function readTextFieldValue(event) {
  const el = /** @type {{ value?: string }} */ (event.currentTarget);
  return el.value ?? "";
}

/** @param {Event} event */
export function readCheckboxChecked(event) {
  const el = /** @type {{ checked?: boolean }} */ (event.currentTarget);
  return Boolean(el.checked);
}
