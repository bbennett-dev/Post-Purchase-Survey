import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";

export default async () => {
  render(<Extension />, document.body);
};

function getAppUrl() {
  const url = process.env.SHOPIFY_APP_URL;
  return typeof url === "string" ? url.replace(/\/$/, "") : "";
}

async function authorizedFetch(path, options = {}) {
  const appUrl = getAppUrl();
  if (!appUrl) {
    throw new Error("Missing app URL");
  }

  const token = await shopify.sessionToken.get();
  return fetch(`${appUrl}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}

function Extension() {
  const orderId = shopify.orderConfirmation.value?.order?.id;
  const orderNumber = shopify.orderConfirmation.value?.number;
  const checkoutToken = shopify.checkoutToken.value;
  const [status, setStatus] = useState("loading");
  const [heading, setHeading] = useState(
    shopify.i18n.translate("headingFallback"),
  );
  const [options, setOptions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [otherText, setOtherText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;

    async function loadSurvey() {
      try {
        const response = await authorizedFetch(
          `/api/survey?shopifyOrderGid=${encodeURIComponent(orderId)}`,
        );
        const payload = await response.json();
        if (cancelled) {
          return;
        }
        if (!response.ok) {
          setStatus("error");
          setError(payload.error || shopify.i18n.translate("loadError"));
          return;
        }
        if (!payload.isEnabled || payload.alreadySubmitted) {
          setStatus(payload.alreadySubmitted ? "thanks" : "hidden");
          return;
        }
        setHeading(payload.heading || shopify.i18n.translate("headingFallback"));
        setOptions(payload.options ?? []);
        setStatus("ready");
      } catch (loadError) {
        if (!cancelled) {
          console.error(loadError);
          setStatus("error");
          setError(shopify.i18n.translate("loadError"));
        }
      }
    }

    loadSurvey();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const otherOption = useMemo(
    () => options.find((option) => option.isOther),
    [options],
  );
  const otherSelected = Boolean(
    otherOption && selectedIds.includes(otherOption.id),
  );

  /**
   * @param {Event & {currentTarget: {values: string[]}}} event
   */
  function handleChoiceChange(event) {
    setSelectedIds(event.currentTarget.values);
  }

  /**
   * @param {Event & {currentTarget: {value: string}}} event
   */
  function handleOtherInput(event) {
    setOtherText(event.currentTarget.value);
  }

  async function submit() {
    setError("");
    if (selectedIds.length === 0) {
      setError(shopify.i18n.translate("selectOne"));
      return;
    }
    if (otherSelected && !otherText.trim()) {
      setError(shopify.i18n.translate("otherLabel"));
      return;
    }

    setStatus("submitting");
    try {
      const response = await authorizedFetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopifyOrderGid: orderId,
          shopifyOrderNumber: orderNumber,
          checkoutToken,
          optionIds: selectedIds,
          otherText: otherSelected ? otherText.trim() : null,
          source: "thank_you",
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setStatus("ready");
        setError(payload.error || shopify.i18n.translate("submitError"));
        return;
      }
      setStatus("thanks");
    } catch (submitError) {
      console.error(submitError);
      setStatus("ready");
      setError(shopify.i18n.translate("submitError"));
    }
  }

  if (!orderId || status === "hidden") {
    return null;
  }

  if (status === "loading") {
    return <s-spinner />;
  }

  if (status === "thanks") {
    return (
      <s-banner tone="success">{shopify.i18n.translate("thanks")}</s-banner>
    );
  }

  if (status === "error" && options.length === 0) {
    return <s-banner tone="warning">{error}</s-banner>;
  }

  return (
    <s-stack gap="base">
      <s-choice-list
        label={heading}
        name="hdyhau"
        multiple
        values={selectedIds}
        onChange={handleChoiceChange}
      >
        {options.map((option) => (
          <s-choice key={option.id} value={option.id}>
            {option.label}
          </s-choice>
        ))}
      </s-choice-list>
      {otherSelected ? (
        <s-text-field
          label={shopify.i18n.translate("otherLabel")}
          name="otherText"
          value={otherText}
          onInput={handleOtherInput}
        />
      ) : null}
      {error ? <s-banner tone="critical">{error}</s-banner> : null}
      <s-button
        variant="primary"
        onClick={submit}
        {...(status === "submitting" ? { loading: true, disabled: true } : {})}
      >
        {shopify.i18n.translate("submit")}
      </s-button>
    </s-stack>
  );
}
