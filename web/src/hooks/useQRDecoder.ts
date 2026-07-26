import { useState, useMemo, useCallback, useRef } from "react";
import { DecodingResult, AppError, TOTPAccount } from "../types/core";
import { QRDecoder } from "../core/QRDecoder";
import { getErrorMessage } from "../utils/errorMessages";

export function useQRDecoder() {
  const [result, setResult] = useState<DecodingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const decoder = useMemo(() => new QRDecoder(), []);

  const run = useCallback(
    async (task: () => Promise<DecodingResult> | DecodingResult) => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const decodingResult = await task();
        setResult(decodingResult);

        // Автоскролл к результатам
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } catch (err) {
        const appError = err as AppError;
        setError({
          ...appError,
          message: getErrorMessage(appError.message),
        });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const decode = useCallback(
    (file: File) => run(() => decoder.decode(file)),
    [decoder, run],
  );

  const decodeText = useCallback(
    (text: string) => run(() => decoder.decodeText(text)),
    [decoder, run],
  );

  const updateAccounts = useCallback((updatedAccounts: TOTPAccount[]) => {
    setResult((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        accounts: updatedAccounts,
      };
    });
  }, []);

  return { result, loading, error, decode, decodeText, updateAccounts, resultsRef };
}
