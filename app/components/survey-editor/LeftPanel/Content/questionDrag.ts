import type { SurveyQuestion } from "../../../../lib/survey/types";

/** Pixels of pointer travel before a press becomes a drag. */
export const DRAG_THRESHOLD = 5;

export interface DragSession {
  id: string;
  x: number;
  y: number;
  insertAt: number;
}

export function questionOrder(questions: SurveyQuestion[]): string[] {
  return questions.map((question) => question.id);
}

export function orderWithInsert(
  order: string[],
  dragId: string,
  insertAt: number,
): string[] {
  const others = order.filter((id) => id !== dragId);
  const index = Math.max(0, Math.min(insertAt, others.length));
  return [...others.slice(0, index), dragId, ...others.slice(index)];
}

/**
 * Drop index among the rows that are not being dragged.
 * Uses layout boxes from the row wrappers, not s-box hosts.
 * s-box often reports a 0-height rect, which previously always
 * inserted at the end of the list.
 */
export function insertAtFromPoint(
  order: string[],
  dragId: string,
  y: number,
  rows: Map<string, HTMLElement>,
  fallback: number,
): number {
  const others = order.filter((id) => id !== dragId);
  let measured = false;
  let insertAt = others.length;

  for (let index = 0; index < others.length; index += 1) {
    const row = rows.get(others[index]);
    if (!row) {
      continue;
    }

    const rect = row.getBoundingClientRect();
    if (rect.height < 2) {
      continue;
    }

    measured = true;
    if (y < rect.top + rect.height / 2) {
      insertAt = index;
      break;
    }
  }

  return measured ? insertAt : fallback;
}
