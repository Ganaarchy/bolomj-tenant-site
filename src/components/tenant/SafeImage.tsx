"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type SafeImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fallback?: React.ReactNode;
};

export function SafeImage({
  src,
  alt,
  className,
  priority,
  sizes = "100vw",
  fallback,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-blue-100 text-slate-500",
          className,
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      priority={priority}
      sizes={sizes}
      onError={() => setFailed(true)}
    />
  );
}
