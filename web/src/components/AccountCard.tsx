import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy } from "lucide-react";
import QRCode from "qrcode";
import { TOTPAccount } from "../types/core";
import { useI18n } from "../hooks/useI18n";

interface AccountCardProps {
  account: TOTPAccount;
  timeLeft: number;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  index: number;
}

/** "123456" -> "123 456", "12345678" -> "1234 5678" */
const formatCode = (code: string): string => {
  const mid = Math.ceil(code.length / 2);
  return `${code.slice(0, mid)} ${code.slice(mid)}`;
};

/**
 * Scannable QR of the otpauth:// URL — small tile inline with the code,
 * click opens an enlarged modal. Muted warm-paper quiet zone instead of
 * stark white; contrast stays far above scanner requirements.
 */
const QRTile: React.FC<{ value: string }> = ({ value }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      margin: 1,
      width: 640,
      errorCorrectionLevel: "M",
      color: { dark: "#1C1917", light: "#FAFAF9" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => setDataUrl(null));
    return () => {
      cancelled = true;
    };
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!dataUrl) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 cursor-zoom-in rounded-lg border border-line p-1 opacity-90 transition-opacity duration-150 hover:opacity-100"
      >
        <img src={dataUrl} alt="" className="h-[72px] w-[72px] rounded" />
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] flex cursor-zoom-out items-center justify-center bg-black/70 p-6"
          >
            <img
              src={dataUrl}
              alt=""
              className="w-full max-w-xs rounded-xl sm:max-w-sm"
            />
          </div>,
          document.body,
        )}
    </>
  );
};

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  timeLeft,
  copiedId,
  onCopy,
  index,
}) => {
  const { t } = useI18n();
  const codeId = `code-${index}`;
  const urlId = `url-${index}`;
  const secretId = `secret-${index}`;
  const period = account.period || 30;
  const expiring = timeLeft <= 5;

  return (
    <article
      className="reveal overflow-hidden rounded-xl border border-line bg-surface-1 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-6">
        {/* Issuer / account / seconds */}
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="mb-1 truncate font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle">
              {account.issuer || t("account.service")}
            </p>
            <p className="truncate text-sm text-ink-muted">{account.account}</p>
          </div>
          <span
            className={
              "shrink-0 font-mono text-xs tabular-nums " +
              (expiring ? "text-danger" : "text-ink-subtle")
            }
          >
            {Math.ceil(timeLeft)}s
          </span>
        </div>

        {/* Code + QR */}
        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            type="button"
            title={t("account.copyCode")}
            onClick={() => onCopy(account.currentCode || "000000", codeId)}
            className="group flex items-center gap-3 text-left"
          >
            <span className="font-mono text-4xl font-medium tabular-nums tracking-[0.04em] text-ink">
              {formatCode(account.currentCode || "000000")}
            </span>
            {copiedId === codeId ? (
              <Check className="h-4 w-4 text-ok" />
            ) : (
              <Copy className="h-4 w-4 text-ink-subtle opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
            )}
          </button>
          {account.otpauthUrl && <QRTile value={account.otpauthUrl} />}
        </div>

        {/* Base32 secret */}
        {account.secret && (
          <button
            type="button"
            title={t("account.copySecret")}
            onClick={() => onCopy(account.secret, secretId)}
            className="group mt-5 block w-full border-t border-line pt-4 text-left"
          >
            <span className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle">
              {t("account.secret")}
              {copiedId === secretId ? (
                <Check className="h-3.5 w-3.5 text-ok" />
              ) : (
                <Copy className="h-3.5 w-3.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
              )}
            </span>
            <span className="block break-all font-mono text-xs leading-relaxed text-ink-muted">
              {account.secret}
            </span>
          </button>
        )}

        {/* OTP Auth URL */}
        {account.otpauthUrl && (
          <button
            type="button"
            title={t("account.copyUrl")}
            onClick={() => onCopy(account.otpauthUrl || "", urlId)}
            className="group mt-5 block w-full border-t border-line pt-4 text-left"
          >
            <span className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle">
              {t("account.otpAuthUrl")}
              {copiedId === urlId ? (
                <Check className="h-3.5 w-3.5 text-ok" />
              ) : (
                <Copy className="h-3.5 w-3.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
              )}
            </span>
            <span className="block break-all font-mono text-xs leading-relaxed text-ink-muted">
              {account.otpauthUrl}
            </span>
          </button>
        )}
      </div>

      {/* Time remaining — 2px line */}
      <div className="h-0.5 w-full bg-line">
        <div
          className="h-full transition-[width] duration-1000 ease-linear"
          style={{
            width: `${(timeLeft / period) * 100}%`,
            background: expiring ? "var(--danger)" : "var(--accent)",
          }}
        />
      </div>
    </article>
  );
};
