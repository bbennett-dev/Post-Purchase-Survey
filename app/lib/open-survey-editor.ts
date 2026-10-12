interface SurveyEditorInput {
  /** Template id when the merchant starts from a template. */
  templateId?: string;
  /** Existing survey id when the merchant is editing. */
  surveyId?: string;
}

interface SurveyEditorPathOptions {
  /** When true, editor hides in-iframe Save/Discard (parent Modal owns chrome). */
  maxModal?: boolean;
}

/**
 * Builds the editor route path for the given input.
 * Used by EditorModalProvider to set the modal `src`.
 */
export function surveyEditorPath(
  input: SurveyEditorInput = {},
  options: SurveyEditorPathOptions = {},
): string {
  const params = new URLSearchParams();
  if (input.templateId) {
    params.set("template", input.templateId);
  }
  if (input.surveyId) {
    params.set("survey", input.surveyId);
  }
  if (options.maxModal) {
    params.set("modal", "1");
  }
  const query = params.toString();
  return query ? `/app/surveys/editor?${query}` : "/app/surveys/editor";
}
