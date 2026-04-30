import { useState, useCallback, useRef } from "react";
import Cookies from "js-cookie";
import type { SourceChunk } from "./api";

interface StreamState {
  text: string;
  sources: SourceChunk[];
  sessionId: string | null;
  isStreaming: boolean;
  isWaiting: boolean;
  error: string | null;
}

export function useStream() {
  const [state, setState] = useState<StreamState>({
    text: "",
    sources: [],
    sessionId: null,
    isStreaming: false,
    isWaiting: false,
    error: null,
  });

  const controllerRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (
      documentId: string,
      question: string,
      sessionId?: string | null,
      onComplete?: (
        fullText: string,
        sources: SourceChunk[],
        sessionId: string,
      ) => void,
    ) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState({
        text: "",
        sources: [],
        sessionId: null,
        isStreaming: false,
        isWaiting: true,
        error: null,
      });

      const token = Cookies.get("access_token");
      // console.log("Sending request...", {
      //   documentId,
      //   question,
      //   sessionId,
      // })

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/query`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Accept: "text/event-stream",
            },
            body: JSON.stringify({
              document_id: documentId,
              question,
              session_id: sessionId || null,
            }),
            signal: controller.signal,
          },
        );
        // console.log("BODY:", response.body)
        if (!response.ok || !response.body) {
          throw new Error("Stream request failed");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";
        let finalSources: SourceChunk[] = [];
        let finalSessionId = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "session_id") {
                finalSessionId = data.session_id;
                setState((s) => ({ ...s, sessionId: data.session_id }));
              } else if (data.type === "token") {
                fullText += data.content;
                setState((s) => ({
                  ...s,
                  isWaiting: false,
                  isStreaming: true,
                  text: s.text + data.content,
                }));
              } else if (data.type === "sources") {
                finalSources = data.sources;
                setState((s) => ({ ...s, sources: data.sources }));
              } else if (data.type === "done") {
                setState((s) => ({
                  ...s,
                  isStreaming: false,
                  isWaiting: false,
                }));
                onComplete?.(fullText, finalSources, finalSessionId);
              }
            } catch {}
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setState((s) => ({
            ...s,
            isStreaming: false,
            isWaiting: false,
            error: err.message,
          }));
        }
      }
    },
    [],
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState({
      text: "",
      sources: [],
      sessionId: null,
      isStreaming: false,
      isWaiting: false,
      error: null,
    });
  }, []);

  return { ...state, send, reset };
}
