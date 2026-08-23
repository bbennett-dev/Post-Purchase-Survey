import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData, useRouteError } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { ensureSurveyConfig, saveAdminSurvey, SurveyHttpError } from "../lib/survey.server";
import type { AdminSurveyOptionInput, SurveyConfigDto } from "../types/survey";

interface ActionData {
  ok?: boolean;
  error?: string;
  config?: SurveyConfigDto;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const config = await ensureSurveyConfig(session.shop);
  return { config };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  try {
    const body = (await request.json()) as {
      heading: string;
      isEnabled: boolean;
      allowOther: boolean;
      options: AdminSurveyOptionInput[];
    };
    const config = await saveAdminSurvey(session.shop, body);
    return { ok: true, config } satisfies ActionData;
  } catch (error) {
    if (error instanceof SurveyHttpError) {
      return Response.json({ error: error.message } satisfies ActionData, {
        status: error.status,
      });
    }
    console.error("Failed to save survey settings", error);
    return Response.json(
      { error: "Unable to save survey settings." } satisfies ActionData,
      { status: 500 },
    );
  }
};

export default function Index() {
  const { config: initialConfig } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();
  const shopify = useAppBridge();
  const config = fetcher.data?.config ?? initialConfig;
  const [heading, setHeading] = useState(config.heading);
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [allowOther, setAllowOther] = useState(config.allowOther);
  const [options, setOptions] = useState<AdminSurveyOptionInput[]>(config.options);

  useEffect(() => {
    setHeading(config.heading);
    setIsEnabled(config.isEnabled);
    setAllowOther(config.allowOther);
    setOptions(config.options);
  }, [config]);

  useEffect(() => {
    if (fetcher.data?.ok) {
      shopify.toast.show("Survey settings saved");
    } else if (fetcher.data?.error) {
      shopify.toast.show(fetcher.data.error, { isError: true });
    }
  }, [fetcher.data, shopify]);

  const isSaving = fetcher.state !== "idle";

  const canSave = useMemo(() => {
    return heading.trim().length > 0 && options.some((option) => option.label.trim());
  }, [heading, options]);

  const updateOption = (index: number, patch: Partial<AdminSurveyOptionInput>) => {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    );
  };

  const moveOption = (index: number, direction: -1 | 1) => {
    setOptions((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  const addOption = () => {
    setOptions((current) => {
      const otherIndex = current.findIndex((option) => option.isOther);
      const next = [...current];
      const option: AdminSurveyOptionInput = {
        label: "",
        isActive: true,
        isOther: false,
      };
      if (otherIndex === -1) {
        next.push(option);
      } else {
        next.splice(otherIndex, 0, option);
      }
      return next;
    });
  };

  const save = () => {
    fetcher.submit(
      JSON.stringify({
        heading,
        isEnabled,
        allowOther,
        options,
      }),
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  return (
    <s-page heading="Post-purchase survey">
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={save}
        {...(isSaving || !canSave ? { disabled: true } : {})}
        {...(isSaving ? { loading: true } : {})}
      >
        Save
      </s-button>

      <s-section heading="Survey">
        <s-paragraph>
          Buyers see this block on the Thank you page and Order status page. Keep
          it short so it does not slow confirmation.
        </s-paragraph>
        <s-text-field
          label="Question"
          name="heading"
          value={heading}
          onInput={(event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            setHeading(target.value);
          }}
        />
        <s-checkbox
          label="Show survey to buyers"
          name="isEnabled"
          checked={isEnabled}
          onChange={(event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            setIsEnabled(target.checked);
          }}
        />
        <s-checkbox
          label='Allow an "Other" option with a short text answer'
          name="allowOther"
          checked={allowOther}
          onChange={(event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            setAllowOther(target.checked);
          }}
        />
      </s-section>

      <s-section heading="Options">
        <s-stack gap="base">
          {options.map((option, index) => (
            <s-box
              key={option.id ?? `new-${index}`}
              padding="base"
              borderWidth="base"
              borderRadius="base"
            >
              <s-stack gap="base">
                <s-text-field
                  label={option.isOther ? "Other label" : `Option ${index + 1}`}
                  name={`option-${index}`}
                  value={option.label}
                  onInput={(event: Event) => {
                    const target = event.currentTarget as HTMLInputElement;
                    updateOption(index, { label: target.value });
                  }}
                />
                <s-stack direction="inline" gap="base">
                  {option.isOther ? (
                    <s-text color="subdued">Always last. Buyers can add a short note.</s-text>
                  ) : (
                    <s-checkbox
                      label="Active"
                      checked={option.isActive}
                      onChange={(event: Event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        updateOption(index, { isActive: target.checked });
                      }}
                    />
                  )}
                  <s-button
                    variant="tertiary"
                    onClick={() => moveOption(index, -1)}
                    disabled={index === 0 || option.isOther}
                  >
                    Move up
                  </s-button>
                  <s-button
                    variant="tertiary"
                    onClick={() => moveOption(index, 1)}
                    disabled={index === options.length - 1 || option.isOther}
                  >
                    Move down
                  </s-button>
                </s-stack>
              </s-stack>
            </s-box>
          ))}
          <s-button variant="secondary" onClick={addOption}>
            Add option
          </s-button>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Checkout placement">
        <s-paragraph>
          After you save, add the survey blocks in Checkout and customer accounts
          editor: Thank you page, and Order status page.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
