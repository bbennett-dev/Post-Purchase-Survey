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

/**
 * Content / Channel / Discount switcher.
 * App Home has no s-tabs. Official pattern: segmented s-button-group
 * (gap="none"). Active state uses s-press-button pressed for the native
 * pressed look; check icon reinforces the selected panel.
 * @see https://shopify.dev/docs/apps/build/app-home/migrate-from-polaris-react/tabs
 * @see https://shopify.dev/docs/api/app-home/v1.0/web-components/actions/button-group
 */
export function PanelTabs({ panel, onPanel }: PanelTabsProps) {
  return (
    <s-stack alignItems="stretch">
      <s-button-group gap="none" accessibilityLabel="Survey sections">
        {PANEL_TABS.map((tab) => {
          const active = panel === tab.id;
          return (
            <s-press-button
              key={tab.id}
              slot="secondary-actions"
              variant="secondary"
              pressed={active}
              icon={active ? "check" : ""}
              inlineSize="fill"
              onClick={() => onPanel(tab.id)}
            >
              {tab.label}
            </s-press-button>
          );
        })}
      </s-button-group>
    </s-stack>
  );
}
