export type NoteCategory = "Ideas" | "Work" | "Personal" | "Research";

export type CategoryOption = {
  label: string;
  value: NoteCategory | "All";
};

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  category: NoteCategory;
  updatedAt: string;
  pinned: boolean;
  createdAt?: string;
}

export interface NoteDraft {
  title: string;
  content: string;
  color: string;
  category: NoteCategory;
  pinned: boolean;
}
