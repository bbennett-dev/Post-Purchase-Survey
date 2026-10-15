import {
  ActionList,
  Box,
  Button,
  ButtonGroup,
  Icon,
  InlineGrid,
  InlineStack,
  Popover,
  Select,
} from "@shopify/polaris";
import {
  ConnectIcon,
  DesktopIcon,
  EditIcon,
  MaximizeIcon,
  MobileIcon,
  StoreIcon,
} from "@shopify/polaris-icons";
import { useState } from "react";
import type { CheckoutEditorLinks } from "../../lib/shopify/checkout-editor-url.server";
import type { EditorWorkspace, PreviewDevice } from "../../lib/survey/types";
import { isV1EditorLimited } from "../../lib/v1-product";

interface EditorToolbarProps {
  workspace: EditorWorkspace;
  device: PreviewDevice;
  isActive: boolean;
  checkoutEditor: CheckoutEditorLinks;
  onWorkspace: (workspace: EditorWorkspace) => void;
  onDevice: (device: PreviewDevice) => void;
  onActive: (isActive: boolean) => void;
}

/**
 * Editor control row: workspace tabs, preview surface + device, preview link, status.
 */
export function EditorToolbar({
  workspace,
  device,
  isActive,
  checkoutEditor,
  onWorkspace,
  onDevice,
  onActive,
}: EditorToolbarProps) {
  const [statusOpen, setStatusOpen] = useState(false);

  const statusLabel = isActive ? "Active" : "Inactive";
  const showAdvancedLogic = !isV1EditorLimited();

  return (
    <Box
      padding="300"
      paddingBlock="200"
      background="bg-surface"
      borderBlockEndWidth="025"
      borderColor="border"
    >
      <InlineGrid columns="auto 1fr auto" gap="400" alignItems="center">
        {!isV1EditorLimited() && (
          <ButtonGroup variant="segmented">
            <Button
              icon={EditIcon}
              pressed={workspace === "build"}
              onClick={() => onWorkspace("build")}
            >
              Build survey
            </Button>
            <Button
              icon={ConnectIcon}
              pressed={workspace === "logic"}
              onClick={() => onWorkspace("logic")}
            >
              Advanced logic
            </Button>
          </ButtonGroup>
        )}

        <InlineStack gap="300" blockAlign="center" align="center">
          <InlineStack gap="200" blockAlign="center">
            <Icon source={StoreIcon} tone="subdued" />
            <Box minWidth="160px">
              <Select
                label="Survey surface"
                labelHidden
                options={[{ label: "On-site survey", value: "onsite" }]}
                value="onsite"
                onChange={() => {}}
              />
            </Box>
          </InlineStack>
          <ButtonGroup variant="segmented">
            <Button
              icon={DesktopIcon}
              pressed={device === "desktop"}
              accessibilityLabel="Desktop preview"
              onClick={() => onDevice("desktop")}
            />
            <Button
              icon={MobileIcon}
              pressed={device === "mobile"}
              accessibilityLabel="Mobile preview"
              onClick={() => onDevice("mobile")}
            />
            <Button
              icon={MaximizeIcon}
              pressed={device === "fullscreen"}
              accessibilityLabel="Fullscreen preview"
              onClick={() => onDevice("fullscreen")}
            />
          </ButtonGroup>
        </InlineStack>

        <InlineStack gap="300" blockAlign="center" align="end">
          <Popover
            active={statusOpen}
            activator={
              <Button
                disclosure={statusOpen ? "up" : "down"}
                onClick={() => setStatusOpen((open) => !open)}
              >
                {statusLabel}
              </Button>
            }
            onClose={() => setStatusOpen(false)}
          >
            <ActionList
              items={[
                {
                  content: "Active",
                  active: isActive,
                  onAction: () => {
                    onActive(true);
                    setStatusOpen(false);
                  },
                },
                {
                  content: "Inactive",
                  active: !isActive,
                  onAction: () => {
                    onActive(false);
                    setStatusOpen(false);
                  },
                },
              ]}
            />
          </Popover>
        </InlineStack>
      </InlineGrid>
    </Box>
  );
}
