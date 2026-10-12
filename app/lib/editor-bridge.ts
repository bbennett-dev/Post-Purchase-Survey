/** BroadcastChannel name for max-modal parent ↔ editor iframe coordination. */
export const EDITOR_BRIDGE_CHANNEL = "survey-editor-bridge";

export type EditorBridgeMessage =
  | {
      type: "state";
      dirty: boolean;
      name: string;
      saving: boolean;
    }
  | { type: "save" }
  | { type: "discard" };

/**
 * Posts editor chrome state to the parent frame (SaveBar / TitleBar on `Modal`).
 */
export function publishEditorChromeState(state: {
  dirty: boolean;
  name: string;
  saving: boolean;
}): void {
  if (typeof window === "undefined") {
    return;
  }
  const channel = new BroadcastChannel(EDITOR_BRIDGE_CHANNEL);
  channel.postMessage({
    type: "state",
    dirty: state.dirty,
    name: state.name,
    saving: state.saving,
  } satisfies EditorBridgeMessage);
  channel.close();
}

export function postEditorBridgeCommand(
  command: Extract<EditorBridgeMessage, { type: "save" | "discard" }>,
): void {
  if (typeof window === "undefined") {
    return;
  }
  const channel = new BroadcastChannel(EDITOR_BRIDGE_CHANNEL);
  channel.postMessage(command);
  channel.close();
}
