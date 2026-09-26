const SURVEY_EDITOR_ID = "survey-editor";

interface OpenSurveyEditorInput {
  /** Template id when the merchant starts from a template. */
  templateId?: string;
  /** Existing survey id when the merchant is editing. */
  surveyId?: string;
}

/**
 * Builds the editor route loaded inside the fullscreen app window.
 * One route serves blank create, template create, and edit.
 */
export function surveyEditorPath(input: OpenSurveyEditorInput = {}): string {
  const params = new URLSearchParams();
  if (input.templateId) {
    params.set("template", input.templateId);
  }
  if (input.surveyId) {
    params.set("survey", input.surveyId);
  }
  const query = params.toString();
  return query ? `/app/surveys/editor?${query}` : "/app/surveys/editor";
}

/**
 * True when the app window is already aimed at this editor route.
 * `src` is often absolute (`https://…/app/surveys/editor`) while we store a path.
 */
function isSameEditorSrc(current: string, nextPath: string): boolean {
  try {
    const currentUrl = new URL(current, window.location.origin);
    const nextUrl = new URL(nextPath, window.location.origin);
    return (
      currentUrl.pathname === nextUrl.pathname &&
      currentUrl.search === nextUrl.search
    );
  } catch {
    return false;
  }
}

/**
 * Opens the shared survey editor in a fullscreen app window.
 * App Home has no side drawer; `s-app-window` is the fullscreen workflow
 * documented for editors that need their own screen.
 * https://shopify.dev/docs/api/app-home/latest/app-bridge-web-components/app-window
 *
 * Assigning `src` reloads the iframe. Skip that when the route is unchanged
 * so the window can open the document it already has.
 */
export function openSurveyEditor(input: OpenSurveyEditorInput = {}): void {
  const editor = document.getElementById(
    SURVEY_EDITOR_ID,
  ) as SAppWindowElement | null;
  if (!editor?.show) {
    return;
  }

  const nextSrc = surveyEditorPath(input);
  if (!isSameEditorSrc(editor.src ?? "", nextSrc)) {
    editor.src = nextSrc;
  }

  void editor.show();
}

/** Closes the editor from inside its iframe. Direct visits have no parent window. */
export function closeSurveyEditor(): void {
  try {
    const editor = window.parent.document.getElementById(
      SURVEY_EDITOR_ID,
    ) as SAppWindowElement | null;
    if (editor?.hide) {
      void editor.hide();
      return;
    }
  } catch {
    // The parent is cross-origin when this route is opened outside the app window.
  }

  window.history.back();
}
