import { useEffect, useState } from "react";

/** Avoids SSR/client Intl timezone mismatches on timestamps. */
export function useClientFormattedDate(
  iso: string,
  format: (iso: string) => string,
): string {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(format(iso));
  }, [iso, format]);
  return text;
}
