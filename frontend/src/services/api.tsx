import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export interface ChatMessage {
  id?: string;
  conversation_id?: string;
  sender: "user" | "bot";
  text: string;
}

export interface ChatResponse {
  reply: string;
}

export const getSessions = async (): Promise<ChatSession[]> => {
  const response = await axios.get<ChatSession[]>(`${API_URL}/chat/sessions`);
  return response.data;
};

export const createSession = async (title: string): Promise<ChatSession> => {
  const response = await axios.post<ChatSession>(`${API_URL}/chat/sessions`, {
    title,
  });
  return response.data;
};

export const getSessionMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  const response = await axios.get<ChatMessage[]>(`${API_URL}/chat/sessions/${sessionId}/messages`);
  return response.data;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await axios.delete(`${API_URL}/chat/sessions/${sessionId}`);
};

export const sendMessage = async (message: string, sessionId: string): Promise<string> => {
  const response = await axios.post<ChatResponse>(`${API_URL}/chat`, {
    message,
    session_id: sessionId,
  });
  return response.data.reply;
};