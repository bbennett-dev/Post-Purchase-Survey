import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useState } from "react";
import { uploadShopifyFile } from "../lib/images/upload-shopify-file.client";

/**
 * Uploads editor images to the merchant's Shopify Files CDN.
 */
export function useShopifyImageUpload() {
  const shopify = useAppBridge();
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      setUploading(true);
      try {
        const token = await shopify.idToken();
        const result = await uploadShopifyFile(file, token);
        return result.url;
      } finally {
        setUploading(false);
      }
    },
    [shopify],
  );

  return { uploadImage, uploading };
}
