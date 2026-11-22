import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "h-9 w-9 rounded-[0.7rem]", text: "text-base" },
  md: { box: "h-10 w-10 rounded-[0.85rem]", text: "text-lg" },
  lg: { box: "h-12 w-12 rounded-[1rem]", text: "text-xl" },
};

export default function Logo({ size = "md", showTagline = false, tagline, className }) {
  const s = SIZES[size] || SIZES.md;

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(26_88%_56%)] via-[hsl(20_80%_46%)] to-[hsl(12_70%_34%)] shadow-[0_2px_10px_-2px_hsl(18_75%_40%/0.55)]",
          s.box
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/15 to-white/20"
        />
        <svg viewBox="0 0 48 48" className="relative h-[62%] w-[62%]" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="1.4" />
          <path
            d="M30.5 15.8a10.4 10.4 0 1 0 0 16.4"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="33.4" cy="24" r="2.9" fill="white" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={cn("block font-display font-bold tracking-tight", s.text)}>
          Civic <span className="text-primary">AI</span>
        </span>
        {showTagline && tagline ? (
          <span className="mt-1 hidden text-[0.7rem] font-medium text-muted-foreground sm:block">
            {tagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}