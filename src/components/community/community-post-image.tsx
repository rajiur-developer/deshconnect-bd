"use client";

import { useEffect, useState } from "react";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import { COMMUNITY_POST_IMAGE_BUCKET, PROFILE_IMAGE_BUCKET } from "@/features/account/constants";

type CommunityPostImageProps = {
  src: string;
  storageKey?: string | null;
  className?: string;
};

export function CommunityPostImage({ src, storageKey, className = "" }: CommunityPostImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [signedAttempted, setSignedAttempted] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setSignedAttempted(false);
    setImageFailed(false);
  }, [src, storageKey]);

  async function recoverPrivateImage() {
    if (!storageKey || signedAttempted) {
      setImageFailed(true);
      return;
    }

    setSignedAttempted(true);
    const bucket = src.includes("/buckets/community-post-images/")
      ? COMMUNITY_POST_IMAGE_BUCKET
      : PROFILE_IMAGE_BUCKET;
    const client = getInsForgeBrowserClient();
    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(storageKey, 3600);

    if (error || !data?.signedUrl) {
      setImageFailed(true);
      return;
    }

    setImageSrc(data.signedUrl);
  }

  return (
    <div className={`relative mt-4 aspect-[16/9] overflow-hidden rounded-xl bg-slate-100 ${className}`}>
      {!imageFailed ? (
        <img
          src={imageSrc}
          alt="Post attachment"
          className="absolute inset-0 h-full w-full object-cover"
          onError={recoverPrivateImage}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">
          Image unavailable
        </div>
      )}
    </div>
  );
}
