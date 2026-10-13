import { Button } from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";

export interface DeleteQuestionButtonProps {
  onClick: () => void;
}

export function DeleteQuestionButton({ onClick }: DeleteQuestionButtonProps) {
  return (
    <Button icon={DeleteIcon} variant="plain" tone="critical" onClick={onClick}>
      Delete question
    </Button>
  );
}
