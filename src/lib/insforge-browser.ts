"use client";

import { createBrowserClient } from "@supabase/ssr";

const browserGlobal = globalThis as typeof globalThis & {
  __deshConnectSupabaseClient?: any;
};

export function getInsForgeBrowserClient(): any {
  if (browserGlobal.__deshConnectSupabaseClient) return browserGlobal.__deshConnectSupabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase browser client is missing its public URL or publishable key.");

  const client: any = createBrowserClient(url, key);
  const originalFrom = client.storage.from.bind(client.storage);
  const storage = Object.create(client.storage);
  storage.from = (bucket: string) => {
    const bucketClient: any = originalFrom(bucket);
    const upload = bucketClient.upload.bind(bucketClient);
    const remove = bucketClient.remove.bind(bucketClient);

    bucketClient.upload = async (path: string, file: File | Blob, options?: any) => {
      const result = await upload(path, file, options);
      if (result.error || !result.data?.path) return result;

      const key = result.data.path as string;
      if (bucket === "record-attachments") {
        const signed = await bucketClient.createSignedUrl(key, 3600);
        if (signed.error || !signed.data?.signedUrl) {
          return { data: null, error: signed.error ?? new Error("Could not create a private attachment URL.") };
        }
        return { data: { ...result.data, key, url: signed.data.signedUrl }, error: null };
      }

      const publicUrl = bucketClient.getPublicUrl(key).data.publicUrl;
      return { data: { ...result.data, key, url: publicUrl }, error: null };
    };

    bucketClient.remove = (paths: string | string[]) => remove(Array.isArray(paths) ? paths : [paths]);
    return bucketClient;
  };

  browserGlobal.__deshConnectSupabaseClient = Object.assign(client, {
    database: client,
    storage,
  });
  return browserGlobal.__deshConnectSupabaseClient;
}
