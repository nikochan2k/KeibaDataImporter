import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const DEBOUNCE_MS = 300;

/** 入力を debounce して URL の `q` に反映する。IME 変換中は反映しない。 */
export function useIncrementalSearch() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const [input, setInput] = useState(q);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    if (composing) return;
    const next = input.trim();
    if (next === q) return;
    const timer = setTimeout(() => setParams(next ? { q: next } : {}, { replace: true }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input, composing, q, setParams]);

  const inputProps = {
    type: "search" as const,
    value: input,
    onChange: (e: { target: { value: string } }) => setInput(e.target.value),
    onCompositionStart: () => setComposing(true),
    onCompositionEnd: () => setComposing(false),
  };
  return { q, inputProps };
}
