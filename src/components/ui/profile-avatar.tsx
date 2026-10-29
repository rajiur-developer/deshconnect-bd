"use client";

import { useEffect, useState } from "react";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import { initials } from "@/lib/utils";
import { PROFILE_IMAGE_BUCKET } from "@/features/account/constants";

type ProfileAvatarProps = {
  name: string;
  src?: string | null;
  storageKey?: string | null;
  className?: string;
  textClassName?: string;
};

export function ProfileAvatar({ name, src, storageKey, className = "", textClassName = "" }: ProfileAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageSrc, setImageSrc] = useState(src ?? "");
  useEffect(() => {
    let active = true;
    setImageSrc(src ?? "");
    setImageFailed(false);
    if (!src && storageKey) {
      void getInsForgeBrowserClient().storage.from(PROFILE_IMAGE_BUCKET).createSignedUrl(storageKey, 3600)
        .then(({ data }) => {
          if (active && data?.signedUrl) setImageSrc(data.signedUrl);
          else if (active) setImageFailed(true);
        })
        .catch(() => { if (active) setImageFailed(true); });
    }
    return () => { active = false; };
  }, [src, storageKey]);
  async function recoverImage() {
    if (storageKey) {
      try {
        const { data } = await getInsForgeBrowserClient().storage.from(PROFILE_IMAGE_BUCKET).createSignedUrl(storageKey, 3600);
        if (data?.signedUrl) { setImageSrc(data.signedUrl); setImageFailed(false); return; }
      } catch { /* Use initials when the profile image cannot be reached. */ }
    }
    setImageFailed(true);
  }
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-600 font-semibold text-white ${className}`}>
      {imageSrc && !imageFailed ? (
        <img src={imageSrc} alt={`${name}'s profile`} className="absolute inset-0 h-full w-full object-cover" onError={recoverImage} />
      ) : (
        <span className={textClassName}>{initials(name) || "?"}</span>
      )}
    </span>
  );
}
