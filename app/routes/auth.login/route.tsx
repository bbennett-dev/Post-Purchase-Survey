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

import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export const action = async ({ request }: ActionFunctionArgs) => {
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
