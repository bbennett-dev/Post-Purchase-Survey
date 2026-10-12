import { Button, ButtonGroup } from "@shopify/polaris";
import type { EditorPanel } from "../../../lib/survey/types";

const PANEL_TABS: { id: EditorPanel; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "channel", label: "Channel" },
  { id: "discount", label: "Discount" },
];

interface PanelTabsProps {
  panel: EditorPanel;
  onPanel: (panel: EditorPanel) => void;
}

/** Content / Channel / Discount switcher for the left editor panel. */
export function PanelTabs({ panel, onPanel }: PanelTabsProps) {
  return (
    <ButtonGroup variant="segmented" fullWidth>
      {PANEL_TABS.map((tab) => (
        <Button
          key={tab.id}
          pressed={panel === tab.id}
          onClick={() => onPanel(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
