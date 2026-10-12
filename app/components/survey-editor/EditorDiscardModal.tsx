import { Modal, Text } from "@shopify/polaris";

interface EditorDiscardModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmDiscard: () => void;
}

/**
 * Discard confirmation (competitor copy). Polaris Modal — not App Bridge save-bar discard UI.
 */
export function EditorDiscardModal({
  open,
  onClose,
  onConfirmDiscard,
}: EditorDiscardModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Discard all unsaved changes?"
      primaryAction={{
        content: "Discard changes",
        destructive: true,
        onAction: () => {
          onClose();
          onConfirmDiscard();
        },
      }}
      secondaryActions={[
        {
          content: "Continue editing",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Text as="p">
          If you discard changes, you&apos;ll delete any edits you made since you
          last saved.
        </Text>
      </Modal.Section>
    </Modal>
  );
}
