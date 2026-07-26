import { forwardRef } from "react";
import { DecodingResult, TimerState } from "../types/core";
import { AccountCard } from "./AccountCard";
import { useI18n } from "../hooks/useI18n";

interface ResultsListProps {
  result: DecodingResult;
  timers: TimerState;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

export const ResultsList = forwardRef<HTMLDivElement, ResultsListProps>(
  ({ result, timers, copiedId, onCopy }, ref) => {
    const { t } = useI18n();

    if (!result.accounts.length) return null;

    const typeLabel =
      result.type === "migration"
        ? t("results.migrationQr")
        : t("results.standardTotp");

    return (
      <section ref={ref} className="mb-16">
        <div className="reveal mb-4 flex items-baseline justify-between">
          <h2 className="font-mono text-xs uppercase tracking-[0.08em] text-ink-subtle">
            {t("results.title")}
          </h2>
          <span className="font-mono text-xs tabular-nums text-ink-subtle">
            {result.accounts.length}
            <span className="mx-2 text-line-strong">/</span>
            {typeLabel}
          </span>
        </div>

        <div className="space-y-4">
          {result.accounts.map((account, index) => (
            <AccountCard
              key={index}
              account={account}
              timeLeft={timers[index] || 0}
              copiedId={copiedId}
              onCopy={onCopy}
              index={index}
            />
          ))}
        </div>
      </section>
    );
  },
);

ResultsList.displayName = "ResultsList";
