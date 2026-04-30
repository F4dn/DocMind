"use client";
import { use, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { HiArrowLeft } from "react-icons/hi2";
import { documentsApi, chatApi } from "@/lib/api";
import { ChatWindow } from "@/components/app/ChatWindow";
import { SessionList } from "@/components/app/SessionList";
import type { Message } from "@/lib/types";

interface Session {
  id: string;
  title: string | null;
  created_at: string;
  document_id: string;
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ read ?session=... from URL
  const sessionFromUrl = searchParams.get("session");

  const [docName, setDocName] = useState("Loading...");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessionFromUrl,
  );
  // ✅ pre-load messages when opening an existing session
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [loadingSession, setLoadingSession] = useState(false);
  // remounts ChatWindow for new chat or when switching sessions
  const [chatKey, setChatKey] = useState(sessionFromUrl ?? "new");

  const loadData = useCallback(async () => {
    try {
      const [docsRes, sessionsRes] = await Promise.all([
        documentsApi.list(),
        chatApi.listSessions(docId),
      ]);
      const doc = docsRes.data.find((d: any) => d.id === docId);
      if (doc) setDocName(doc.original_name);
      setSessions(sessionsRes.data);
    } catch {
      setDocName("Unknown document");
    }
  }, [docId]);

  // Load session messages when a session is selected from URL
  const loadSessionMessages = useCallback(async (sId: string) => {
    setLoadingSession(true);
    try {
      const { data } = await chatApi.getSession(sId);
      // Map API messages to our Message type
      const mapped: Message[] = (data.messages ?? []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sources: m.sources ?? [],
        createdAt: new Date(m.created_at),
      }));
      setInitialMessages(mapped);
    } catch {
      setInitialMessages([]);
    } finally {
      setLoadingSession(false);
    }
  }, []);

  // On mount — load doc + sessions
  useEffect(() => {
    loadData();
  }, [loadData]);

  // When sessionFromUrl changes (URL changes), load that session's messages
  useEffect(() => {
    if (sessionFromUrl) {
      setActiveSessionId(sessionFromUrl);
      setChatKey(sessionFromUrl);
      loadSessionMessages(sessionFromUrl);
    } else {
      setActiveSessionId(null);
      setInitialMessages([]);
      setChatKey("new");
    }
  }, [sessionFromUrl, loadSessionMessages]);

  const handleNewChat = () => {
    // Remove session query param — pushes to /chat/[docId] with no session
    router.push(`/chat/${docId}`);
    setActiveSessionId(null);
    setInitialMessages([]);
    setChatKey(`new-${Date.now()}`);
  };

  const handleSessionCreated = (newSessionId: string) => {
    setActiveSessionId(newSessionId);
    // Update URL without full navigation so back button works
    router.replace(`/chat/${docId}?session=${newSessionId}`);
    loadData();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* LEFT — Session list */}
      <SessionList
        docId={docId} // ✅ pass docId so navigation is correct
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        docName={docName}
      />

      {/* CENTER + RIGHT — Chat */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile back button */}
        <div className="h-14 px-4 border-b border-white/5 flex items-center gap-3 flex-shrink-0 lg:hidden bg-base/40 backdrop-blur-xl">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-secondary hover:text-ink-primary transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        </div>

        {loadingSession ? (
          // Show spinner while loading session messages
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
              <p className="text-xs font-mono uppercase tracking-wider text-ink-muted">
                Loading conversation...
              </p>
            </div>
          </div>
        ) : (
          <ChatWindow
            key={chatKey} // ✅ remounts when switching sessions
            documentId={docId}
            documentName={docName}
            initialSessionId={activeSessionId}
            initialMessages={initialMessages} // ✅ pre-populate messages
            onSessionCreated={handleSessionCreated}
          />
        )}
      </div>
    </div>
  );
}
