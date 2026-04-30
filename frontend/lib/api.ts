import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (
        path.startsWith("/dashboard") ||
        path.startsWith("/chat") ||
        path.startsWith("/library")
      ) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  register: (email: string, password: string) =>
    api.post("/auth/register", { email, password }),
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
};

export const documentsApi = {
  list: () => api.get("/documents/"),
  upload: (file: File, onProgress?: (p: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/documents/upload", formData, {
      onUploadProgress: (e) => {
        if (e.total && onProgress)
          onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
  },
  status: (id: string) => api.get(`/documents/${id}/status`),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const chatApi = {
  listSessions: (documentId: string) =>
    api.get(`/chat/sessions?document_id=${documentId}`),
  getSession: (sessionId: string) => api.get(`/chat/sessions/${sessionId}`),
};

export interface DocumentItem {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  status: "pending" | "processing" | "ready" | "failed";
  chunk_count: number;
  error_message: string | null;
  created_at: string;
}

export interface SourceChunk {
  chunk_index: number;
  page: string;
  source: string;
  content: string;
  score: number;
}
