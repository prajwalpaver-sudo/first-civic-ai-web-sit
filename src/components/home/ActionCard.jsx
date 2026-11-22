import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ActionCard({ to, icon: Icon, title, subtitle, tone = "saffron" }) {
  const tones = {
    saffron: {
      card: "bg-[hsl(24_85%_50%/0.09)] border-[hsl(24_70%_60%/0.35)] hover:border-[hsl(24_76%_45%)]",
      icon: "bg-[hsl(19_76%_37%)] text-[hsl(36_60%_98%)]",
    },
    teal: {
      card: "bg-[hsl(177_60%_35%/0.09)] border-[hsl(177_50%_45%/0.35)] hover:border-[hsl(177_64%_28%)]",
      icon: "bg-[hsl(177_64%_21%)] text-[hsl(174_60%_97%)]",
    },
    plum: {
      card: "bg-[hsl(268_45%_50%/0.09)] border-[hsl(268_35%_60%/0.35)] hover:border-[hsl(268_45%_45%)]",
      icon: "bg-[hsl(268_45%_38%)] text-[hsl(268_60%_98%)]",
    },
  };
  const t = tones[tone] || tones.saffron;

  return (
    <Link
      to={to}
      className={cn(
        "tap group flex flex-col justify-between gap-6 rounded-3xl border-2 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(60,30,0,0.45)] sm:p-6",
        t.card
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", t.icon)}>
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <ArrowUpRight
          className="h-6 w-6 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden="true"
        />
      </div>
      <div>
        <h3 className="font-display text-xl leading-snug sm:text-[1.35rem]">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p>
      </div>
    </Link>
  );
}