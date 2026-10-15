import { Button, ButtonGroup } from "@shopify/polaris";
import { editorPanelTabsForUi } from "../../../lib/survey/editor-panels";
import type { EditorPanel } from "../../../lib/survey/types";

interface PanelTabsProps {
  panel: EditorPanel;
  onPanel: (panel: EditorPanel) => void;
}

/** Content / Channel / Discount switcher for the left editor panel. */
export function PanelTabs({ panel, onPanel }: PanelTabsProps) {
  const panelTabs = editorPanelTabsForUi();

  return (
    <ButtonGroup variant="segmented" fullWidth>
      {panelTabs.map((tab) => (
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
