import { useCallback } from "react";
import { Analytics } from "@vercel/analytics/react";
import { useQRDecoder } from "./hooks/useQRDecoder";
import { useTimer } from "./hooks/useTimer";
import { useClipboard } from "./hooks/useClipboard";
import { FileUploader } from "./components/FileUploader";
import { ResultsList } from "./components/ResultsList";
import { Loading, Error } from "./components/StatusMessage";

/**
 * Interactive part only. The hero, prose sections, FAQ and footer are static
 * HTML in index.html / ru/index.html so crawlers (and AI bots, which do not
 * run JS) get the full text without executing anything.
 */
export default function App() {
  const {
    result,
    loading,
    error,
    decode,
    decodeText,
    updateAccounts,
    resultsRef,
  } = useQRDecoder();
  const timers = useTimer(result?.accounts || [], updateAccounts);

  // Global text paste: only decode clipboard content that looks like a code
  const pasteText = useCallback(
    (text: string) => {
      const value = text.trim();
      const secret = value.replace(/[\s-]/g, "").toUpperCase();
      const looksLikeCode =
        value.startsWith("otpauth://") ||
        value.startsWith("otpauth-migration://") ||
        (/^[A-Z2-7]+=*$/.test(secret) && secret.length >= 16);
      if (looksLikeCode) decodeText(value);
    },
    [decodeText],
  );

  const { copiedId, copy } = useClipboard(decode, pasteText);

  return (
    <>
      <FileUploader onUpload={decode} loading={loading} />
      <Loading loading={loading} />
      <Error error={error} />
      {result && (
        <ResultsList
          ref={resultsRef}
          result={result}
          timers={timers}
          copiedId={copiedId}
          onCopy={copy}
        />
      )}
      <Analytics />
    </>
  );
}
