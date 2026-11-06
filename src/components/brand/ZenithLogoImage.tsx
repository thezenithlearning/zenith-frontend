import Image from "next/image";

/** The Zenith logo image, cropped the same way as the navbar. Has a white background, so place it on light surfaces. */
export default function ZenithLogoImage({ className = "h-14 w-36 sm:h-16 sm:w-44" }: { className?: string }) {
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image
        src="/zenith-logo.png"
        alt="Zenith Learning"
        fill
        unoptimized
        sizes="192px"
        className="scale-[1.35] object-contain"
      />
    </span>
  );
}

/** Just the arrow-and-star emblem from the logo image, for small square spaces (collapsed sidebar). */
export function ZenithLogoEmblem({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image
        src="/zenith-logo.png"
        alt="Zenith Learning"
        width={130}
        height={73}
        unoptimized
        className="absolute left-0 top-[-12px] max-w-none"
      />
    </span>
  );
}
