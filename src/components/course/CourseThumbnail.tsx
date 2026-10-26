"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";

/**
 * Course banner images are uploaded at whatever size an admin picks, so a
 * fixed-ratio box + object-cover silently crops anything that doesn't match.
 * This shows the full image, uncropped, on a soft brand-tinted tile instead —
 * the "framed icon" pattern rather than a hard photo crop.
 */
export default function CourseThumbnail({
  src,
  alt,
  title,
  aspectRatio = "16 / 10",
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  src?: string | null;
  alt: string;
  title?: string;
  aspectRatio?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-brand-start-soft to-brand-end-soft ${className}`}
      style={{ aspectRatio }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          title={title}
          fill
          priority={priority}
          sizes={sizes}
          className="object-contain p-3"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="h-10 w-10 text-brand-mid/35" />
        </div>
      )}
    </div>
  );
}
