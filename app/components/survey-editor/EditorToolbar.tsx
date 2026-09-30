import type { EditorWorkspace, PreviewDevice } from "../../lib/survey/types";

interface EditorToolbarProps {
  workspace: EditorWorkspace;
  device: PreviewDevice;
  isActive: boolean;
  onWorkspace: (workspace: EditorWorkspace) => void;
  onDevice: (device: PreviewDevice) => void;
  onActive: (isActive: boolean) => void;
}

/**
 * Editor top bar: build or logic, preview surface and device, then status.
 */
export function EditorToolbar({
  workspace,
  device,
  isActive,
  onWorkspace,
  onDevice,
  onActive,
}: EditorToolbarProps) {
  return (
    <s-box padding="small" background="base" border="base" borderRadius="base">
      <s-grid gridTemplateColumns="1fr auto 1fr" gap="base" alignItems="center">
        <s-button-group gap="none">
          <s-button
            variant={workspace === "build" ? "primary" : "secondary"}
            icon="edit"
            onClick={() => onWorkspace("build")}
          >
            Build survey
          </s-button>
          <s-button
            variant={workspace === "logic" ? "primary" : "secondary"}
            icon="automation"
            onClick={() => onWorkspace("logic")}
          >
            Advanced logic
          </s-button>
        </s-button-group>
        <s-stack direction="inline" gap="small-200" alignItems="center">
          <s-button
            icon="cart"
            variant="tertiary"
            commandFor="preview-surface-menu"
          >
            Thank you page
          </s-button>
          <s-menu id="preview-surface-menu" accessibilityLabel="Preview surface">
            <s-button icon="cart">Thank you page</s-button>
            <s-button icon="order">Order status</s-button>
          </s-menu>
          <s-button
            icon="desktop"
            variant={device === "desktop" ? "primary" : "tertiary"}
            accessibilityLabel="Desktop view"
            onClick={() => onDevice("desktop")}
          />
          <s-button
            icon="mobile"
            variant={device === "mobile" ? "primary" : "tertiary"}
            accessibilityLabel="Mobile view"
            onClick={() => onDevice("mobile")}
          />
          <s-button
            icon="maximize"
            variant={device === "fullscreen" ? "primary" : "tertiary"}
            accessibilityLabel="Fullscreen"
            onClick={() => onDevice("fullscreen")}
          />
        </s-stack>
        <s-stack direction="inline" gap="none" justifyContent="end">
          <s-button
            icon="caret-down"
            variant="secondary"
            commandFor="survey-status-menu"
          >
            {isActive ? "Active" : "Inactive"}
          </s-button>
          <s-menu id="survey-status-menu" accessibilityLabel="Survey status">
            <s-button onClick={() => onActive(true)}>Active</s-button>
            <s-button onClick={() => onActive(false)}>Inactive</s-button>
          </s-menu>
        </s-stack>
      </s-grid>
    </s-box>
  );
}
