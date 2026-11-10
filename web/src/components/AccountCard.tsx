import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TOTPAccount } from "@/types/core";

interface AccountCardProps {
  account: TOTPAccount;
  timeLeft: number;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  index: number;
}

const LABEL = "font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle";

/** "123456" -> "123 456", "12345678" -> "1234 5678" */
const formatCode = (code: string): string => {
  const mid = Math.ceil(code.length / 2);
  return `${code.slice(0, mid)} ${code.slice(mid)}`;
};

function CopyIcon({ copied }: { copied: boolean }) {
  return copied ? (
    <Check className="text-ok" />
  ) : (
    <Copy className="text-ink-subtle" />
  );
}

interface QRTileProps {
  value: string;
  title: string;
  description: string;
}

/**
 * Scannable QR of the otpauth:// URL — small tile inline with the code,
 * click opens an enlarged dialog. Muted warm-paper quiet zone instead of
 * stark white; contrast stays far above scanner requirements.
 */
function QRTile({ value, title, description }: QRTileProps) {
  const { t } = useTranslation();
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // qrcode is ~9 KB gzip and only needed once a result exists
    import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(value, {
          margin: 1,
          width: 640,
          errorCorrectionLevel: "M",
          color: { dark: "#1C1917", light: "#FAFAF9" },
        }),
      )
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => setDataUrl(null));
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!dataUrl) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          aria-label={t("account.showQr")}
          title={t("account.showQr")}
          className="h-auto shrink-0 cursor-zoom-in rounded-lg p-1"
        >
          <img src={dataUrl} alt="" className="size-[72px] rounded" />
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t("account.close")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <img src={dataUrl} alt="" className="w-full rounded-lg" />
      </DialogContent>
    </Dialog>
  );
}

interface CopyFieldProps {
  label: string;
  title: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}

/** Labelled monospace value; the whole row copies on click. */
function CopyField({ label, title, value, copied, onCopy }: CopyFieldProps) {
  return (
    <div className="mt-3 border-t border-line pt-3">
      <Button
        variant="ghost"
        title={title}
        onClick={onCopy}
        className="-mx-3 h-auto w-[calc(100%+1.5rem)] flex-col items-stretch gap-2 whitespace-normal px-3 py-2 text-left font-normal"
      >
        <span className={cn(LABEL, "flex items-center justify-between")}>
          {label}
          <CopyIcon copied={copied} />
        </span>
        <span className="break-all font-mono text-xs leading-relaxed text-ink-muted">
          {value}
        </span>
      </Button>
    </div>
  );
}

export function AccountCard({
  account,
  timeLeft,
  copiedId,
  onCopy,
  index,
}: AccountCardProps) {
  const { t } = useTranslation();
  const codeId = `code-${index}`;
  const urlId = `url-${index}`;
  const secretId = `secret-${index}`;
  const period = account.period || 30;
  const expiring = timeLeft <= 5;
  const code = account.currentCode || "000000";
  const issuer = account.issuer || t("account.service");

  return (
    <Card
      className="reveal overflow-hidden transition-colors duration-150 hover:border-line-strong"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent>
        {/* Issuer / account / seconds */}
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className={cn(LABEL, "mb-1 truncate")}>{issuer}</p>
            <p className="truncate text-sm text-ink-muted">{account.account}</p>
          </div>
          <Badge variant={expiring ? "destructive" : "outline"}>
            {Math.ceil(timeLeft)}s
          </Badge>
        </div>

        {/* Code + QR */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            title={t("account.copyCode")}
            onClick={() => onCopy(code, codeId)}
            className="-ml-3 h-auto gap-2 px-3 py-1.5 sm:gap-3"
          >
            {/* 8 digits next to the QR tile only fit a 360px screen at text-2xl */}
            <span
              className={cn(
                "font-mono font-medium tabular-nums tracking-[0.04em] sm:text-4xl",
                code.length > 6 ? "text-2xl" : "text-3xl",
              )}
            >
              {formatCode(code)}
            </span>
            <CopyIcon copied={copiedId === codeId} />
          </Button>
          {account.otpauthUrl && (
            <QRTile
              value={account.otpauthUrl}
              title={issuer}
              description={account.account}
            />
          )}
        </div>

        {account.secret && (
          <CopyField
            label={t("account.secret")}
            title={t("account.copySecret")}
            value={account.secret}
            copied={copiedId === secretId}
            onCopy={() => onCopy(account.secret, secretId)}
          />
        )}

        {account.otpauthUrl && (
          <CopyField
            label={t("account.otpAuthUrl")}
            title={t("account.copyUrl")}
            value={account.otpauthUrl}
            copied={copiedId === urlId}
            onCopy={() => onCopy(account.otpauthUrl, urlId)}
          />
        )}
      </CardContent>

      <Progress
        value={(timeLeft / period) * 100}
        indicatorClassName={expiring ? "bg-danger" : undefined}
      />
    </Card>
  );
}
