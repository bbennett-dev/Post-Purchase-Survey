import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import {
  AppProvider as PolarisAppProvider,
  BlockStack,
  Button,
  Card,
  FormLayout,
  Page,
  TextField,
} from "@shopify/polaris";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import en from "@shopify/polaris/locales/en.json";

import { AUTH_LOGIN_LIMIT } from "../../lib/security/rate-limit-config.server";
import {
  checkRateLimit,
  clientIpFromRequest,
} from "../../lib/security/rate-limit.server";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

function enforceLoginRateLimit(request: Request): Response | null {
  const result = checkRateLimit(
    `auth-login:${clientIpFromRequest(request)}`,
    AUTH_LOGIN_LIMIT,
  );
  if (!result.allowed) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    });
  }
  return null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const limited = enforceLoginRateLimit(request);
  if (limited) {
    return limited;
  }
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const limited = enforceLoginRateLimit(request);
  if (limited) {
    return limited;
  }
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <ShopifyAppProvider embedded={false}>
      <PolarisAppProvider i18n={en}>
        <Page narrowWidth>
          <Card>
            <BlockStack gap="400">
              <Form method="post">
                <FormLayout>
                  <TextField
                    label="Shop domain"
                    name="shop"
                    helpText="example.myshopify.com"
                    value={shop}
                    onChange={setShop}
                    autoComplete="on"
                    error={errors.shop}
                  />
                  <Button submit variant="primary">
                    Log in
                  </Button>
                </FormLayout>
              </Form>
            </BlockStack>
          </Card>
        </Page>
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}
