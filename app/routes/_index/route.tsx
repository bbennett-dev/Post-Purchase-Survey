import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>SnapPlux Post-Purchase Survey</h1>
        <p className={styles.text}>
          A lightweight How did you hear about us? survey on Thank you and Order
          status pages, built for DTC merchants running paid traffic.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Zero-bloat checkout block</strong>. Ask HDYHAU on the Thank
            you and Order status pages without slowing confirmation.
          </li>
          <li>
            <strong>Merchant-owned answers</strong>. Edit the question and
            options in the app. Buyers can choose more than one source.
          </li>
          <li>
            <strong>One response per order</strong>. Duplicate submits are
            ignored so attribution stays clean.
          </li>
        </ul>
      </div>
    </div>
  );
}
