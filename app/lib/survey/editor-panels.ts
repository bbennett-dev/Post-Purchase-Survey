import { isV1EditorLimited } from "../v1-product";
import type { EditorPanel } from "./types";

const ALL_PANEL_TABS: { id: EditorPanel; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "channel", label: "Channel" },
  { id: "discount", label: "Discount" },
];

/** Left-panel tabs (Content / Channel / Discount), respecting v1 scope. */
export function editorPanelTabsForUi(): { id: EditorPanel; label: string }[] {
  if (!isV1EditorLimited()) {
    return ALL_PANEL_TABS;
  }
  return ALL_PANEL_TABS.filter((tab) => tab.id !== "discount");
}
