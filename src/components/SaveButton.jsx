import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { addSaved, isSaved, removeSaved } from "@/lib/storage";
import { useSettings } from "@/lib/SettingsContext";
import { cn } from "@/lib/utils";

export default function SaveButton({ item, className }) {
  const { t } = useSettings();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isSaved(item.id));
  }, [item.id]);

  const toggle = () => {
    if (saved) {
      removeSaved(item.id);
      setSaved(false);
    } else {
      addSaved(item);
      setSaved(true);
      toast.success(t("c.saved"));
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? t("c.saved") : t("c.save")}
      title={saved ? t("c.saved") : t("c.save")}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
        saved
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
        className
      )}
    >
      <Bookmark className={cn("h-5 w-5", saved && "fill-current")} aria-hidden="true" />
    </button>
  );
}