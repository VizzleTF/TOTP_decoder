import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { useCopy } from "@/hooks/useCopy";
import { DecodingResult, TimerState } from "@/types/core";
import { AccountCard } from "./AccountCard";

interface ResultsListProps {
  result: DecodingResult;
  timers: TimerState;
}

export function ResultsList({ result, timers }: ResultsListProps) {
  const { t } = useTranslation();
  const { copiedId, copy } = useCopy();
  const sectionRef = useRef<HTMLElement>(null);

  // App drops the previous result before each decode, so this mounts — and
  // scrolls — once per decoded result
  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (!result.accounts.length) return null;

  const typeLabel =
    result.type === "migration"
      ? t("results.migrationQr")
      : t("results.standardTotp");

  return (
    <section ref={sectionRef} className="mb-16">
      <div className="reveal mb-4 flex items-center justify-between">
        <h2 className="font-mono text-xs uppercase tracking-[0.08em] text-ink-subtle">
          {t("results.title")}
        </h2>
        <Badge>
          {result.accounts.length}
          <span className="mx-2 text-line-strong">/</span>
          {typeLabel}
        </Badge>
      </div>

      <div className="space-y-4">
        {result.accounts.map((account, index) => (
          <AccountCard
            key={index}
            account={account}
            timeLeft={timers[index] || 0}
            copiedId={copiedId}
            onCopy={copy}
            index={index}
          />
        ))}
      </div>

      <Toaster />
    </section>
  );
}
