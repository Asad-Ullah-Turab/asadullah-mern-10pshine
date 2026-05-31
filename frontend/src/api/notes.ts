import config from "../config/config";
import type { Note, NoteDraft } from "../pages/home/types";

type NotesResponse = {
  notes?: Note[];
  note?: Note;
  message?: string;
};

const backendUrl = config.BACKEND_URL ?? "";

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${backendUrl}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  const data = (await response.json().catch(() => ({}))) as NotesResponse;

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

async function getNotes() {
  return request<{ notes: Note[] }>("/notes", { method: "GET" });
}

async function createNote(payload: NoteDraft) {
  return request<{ note: Note }>("/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateNote(noteId: string, payload: NoteDraft) {
  return request<{ note: Note }>(`/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function deleteNote(noteId: string) {
  return request<{ message: string }>(`/notes/${noteId}`, {
    method: "DELETE",
  });
}

export { createNote, deleteNote, getNotes, updateNote };