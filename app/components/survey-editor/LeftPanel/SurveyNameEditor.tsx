import { useEffect, useRef } from "react";
import { Button, InlineStack, Text, TextField } from "@shopify/polaris";
import { EditIcon } from "@shopify/polaris-icons";

interface SurveyNameEditorProps {
  name: string;
  renaming: boolean;
  onRenaming: (renaming: boolean) => void;
  onRename: (name: string) => void;
}

/**
 * Survey title with inline rename; pen opens field with focus + full selection.
 */
export function SurveyNameEditor({
  name,
  renaming,
  onRenaming,
  onRename,
}: SurveyNameEditorProps) {
  const fieldId = "survey-name-editor-field";
  const didFocusRef = useRef(false);

  useEffect(() => {
    if (!renaming) {
      didFocusRef.current = false;
      return;
    }
    if (didFocusRef.current) {
      return;
    }

    const focusAndSelect = () => {
      const input = document.getElementById(fieldId) as HTMLInputElement | null;
      if (!input) {
        return;
      }
      input.focus();
      input.select();
      didFocusRef.current = true;
    };

    const frame = requestAnimationFrame(focusAndSelect);
    return () => cancelAnimationFrame(frame);
  }, [renaming]);

  if (renaming) {
    return (
      <TextField
        id={fieldId}
        label="Survey name"
        labelHidden
        value={name}
        onChange={onRename}
        onBlur={() => onRenaming(false)}
        autoComplete="off"
        autoFocus
        selectTextOnFocus
      />
    );
  }

  return (
    <InlineStack gap="200" blockAlign="center">
      <Text as="h2" variant="headingMd">
        {name}
      </Text>
      <Button
        icon={EditIcon}
        variant="tertiary"
        accessibilityLabel="Rename survey"
        onClick={() => onRenaming(true)}
      />
    </InlineStack>
  );
}
