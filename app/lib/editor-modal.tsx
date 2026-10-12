import { Modal, SaveBar, TitleBar } from "@shopify/app-bridge-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  EDITOR_BRIDGE_CHANNEL,
  postEditorBridgeCommand,
  type EditorBridgeMessage,
} from "./editor-bridge";
import { surveyEditorPath } from "./open-survey-editor";

export const EDITOR_MODAL_ID = "survey-editor-modal";

interface EditorModalContextValue {
  openEditor: (input?: { templateId?: string; surveyId?: string }) => void;
}

const EditorModalContext = createContext<EditorModalContextValue>({
  openEditor: () => {},
});

/** Hook: open the survey editor max-modal from any page. */
export function useOpenEditor() {
  return useContext(EditorModalContext).openEditor;
}

interface EditorModalProviderProps {
  children: ReactNode;
}

/**
 * Max modal shell: `TitleBar` + `SaveBar` are **children of `Modal`** on this
 * page so Shopify renders them in the grey modal chrome. The editor route loads
 * in `src` and syncs dirty/name via `BroadcastChannel`.
 */
export function EditorModalProvider({ children }: EditorModalProviderProps) {
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editorName, setEditorName] = useState("Survey");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const openEditor = useCallback(
    (input: { templateId?: string; surveyId?: string } = {}) => {
      setEditorSrc(surveyEditorPath(input, { maxModal: true }));
      setEditorName("Survey");
      setDirty(false);
      setSaving(false);
      setOpen(true);
    },
    [],
  );

  useEffect(() => {
    const channel = new BroadcastChannel(EDITOR_BRIDGE_CHANNEL);
    channel.onmessage = (event: MessageEvent<EditorBridgeMessage>) => {
      const data = event.data;
      if (data?.type === "state") {
        setEditorName(data.name.trim().length > 0 ? data.name : "Survey");
        setDirty(data.dirty);
        setSaving(data.saving);
      }
    };
    return () => channel.close();
  }, []);

  const handleHide = useCallback(() => {
    setOpen(false);
    setEditorSrc(null);
    setDirty(false);
    setSaving(false);
  }, []);

  return (
    <EditorModalContext.Provider value={{ openEditor }}>
      {children}
      {editorSrc ? (
        <Modal
          id={EDITOR_MODAL_ID}
          variant="max"
          src={editorSrc}
          open={open}
          onHide={handleHide}
        >
          <TitleBar title={editorName} />
          {/* App Home WC: SaveBar must be a Modal child on the parent document. */}
          <SaveBar open={dirty}>
            <button
              type="button"
              variant="primary"
              disabled={saving}
              onClick={() => postEditorBridgeCommand({ type: "save" })}
            />
            <button
              type="button"
              onClick={() => postEditorBridgeCommand({ type: "discard" })}
            />
          </SaveBar>
        </Modal>
      ) : null}
    </EditorModalContext.Provider>
  );
}
