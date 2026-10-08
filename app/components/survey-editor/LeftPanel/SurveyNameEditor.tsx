import { useCallback } from "react";
import { fieldValue } from "../field-value";

interface SurveyNameEditorProps {
  name: string;
  renaming: boolean;
  onRenaming: (renaming: boolean) => void;
  onRename: (name: string) => void;
}

/**
 * Survey title with inline rename.
 * Polaris has no autofocus prop for App Home fields; after a user click,
 * call focus() on the s-text-field host (Shopify’s recommended approach).
 */
export function SurveyNameEditor({
  name,
  renaming,
  onRenaming,
  onRename,
}: SurveyNameEditorProps) {
  const focusField = useCallback((field: HTMLElement | null) => {
    field?.focus();
  }, []);

  if (renaming) {
    return (
      <s-text-field
        label="Survey name"
        labelAccessibilityVisibility="exclusive"
        value={name}
        onInput={(event) => onRename(fieldValue(event))}
        onBlur={() => onRenaming(false)}
        ref={focusField}
      />
    );
  }

  return (
    <s-stack direction="inline" gap="small-200" alignItems="center">
      <s-heading>{name}</s-heading>
      <s-button
        icon="edit"
        variant="tertiary"
        accessibilityLabel="Rename survey"
        onClick={() => onRenaming(true)}
      />
    </s-stack>
  );
}
