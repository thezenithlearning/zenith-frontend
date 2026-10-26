type ZenithLogoProps = {
  className?: string;
  /** Use light text for dark backgrounds. */
  tone?: "dark" | "light";
  showWordmark?: boolean;
};

/** Zenith mark: a rising peak crowned by a gold apex star. */
export function ZenithMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="Zenith Learning">
      <defs>
        <linearGradient id="zl-g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#0c1d4a" />
          <stop offset="1" stopColor="#3b6fe0" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#zl-g)" />
      <path d="M7 31 17 14l5 8 3-5 8 14z" fill="#fff" fillOpacity=".92" />
      <path d="m27 5 1.6 3.4L32 10l-3.4 1.6L27 15l-1.6-3.4L22 10l3.4-1.6z" fill="#e8b53a" />
    </svg>
  );
}

export default function ZenithLogo({
  className = "",
  tone = "dark",
  showWordmark = true,
}: ZenithLogoProps) {
  const ink = tone === "light" ? "text-white" : "text-[#0c1d4a]";
  const sub = tone === "light" ? "text-white/60" : "text-slate-500";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <ZenithMark />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className={`font-display text-[1.3rem] font-semibold tracking-tight ${ink}`}>Zenith</span>
          <span className={`mt-1 text-[0.58rem] font-bold uppercase tracking-[0.32em] ${sub}`}>Learning</span>
        </span>
      )}
    </span>
  );
}
