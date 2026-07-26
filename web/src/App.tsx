import { useCallback } from "react";
import { Analytics } from "@vercel/analytics/react";
import { useQRDecoder } from "./hooks/useQRDecoder";
import { useTimer } from "./hooks/useTimer";
import { useClipboard } from "./hooks/useClipboard";
import { DotWave } from "./components/DotWave";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { FileUploader } from "./components/FileUploader";
import { ResultsList } from "./components/ResultsList";
import { Loading, Error } from "./components/StatusMessage";

export default function App() {
  const { result, loading, error, decode, decodeText, updateAccounts, resultsRef } =
    useQRDecoder();
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
    <div className="relative min-h-screen">
      <DotWave />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-6 pt-8 md:pt-10">
        <Header />
        <main className="flex-1">
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
        </main>
        <Footer />
      </div>
      <Analytics />
    </div>
  );
}
