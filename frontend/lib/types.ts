import type { SourceChunk } from "./api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  document_id: string;
  title: string | null;
  created_at: string;
  messages: Message[];
}
