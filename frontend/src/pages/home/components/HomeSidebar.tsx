import { useRef } from "react";
import type { CategoryOption, Note } from "../types";

interface HomeSidebarProps {
  userName: string;
  userEmail: string;
  userInitial: string;
  categories: CategoryOption[];
  filter: CategoryOption["value"];
  onFilterChange: (value: CategoryOption["value"]) => void;
  notes: Note[];
  onCreateNote: () => void;
  onImportNotes: (file: File) => void;
  onExportJson: () => void;
  onExportText: () => void;
  isImporting: boolean;
}

export function HomeSidebar({
  userName,
  userEmail,
  userInitial,
  categories,
  filter,
  onFilterChange,
  notes,
  onCreateNote,
  onImportNotes,
  onExportJson,
  onExportText,
  isImporting,
}: HomeSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <aside className="rounded-4xl border border-white/70 bg-white/75 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
      <button
        type="button"
        className="mb-5 flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:bg-white"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-lg font-semibold text-white shadow-lg shadow-orange-500/20">
          {userInitial}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {userName}
          </span>
          <span className="block truncate text-xs text-slate-500">
            {userEmail}
          </span>
        </span>
      </button>

      <div className="space-y-2">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Categories
        </p>
        {categories.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => onFilterChange(category.value)}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
              filter === category.value
                ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20"
                : "bg-transparent text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>{category.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                filter === category.value
                  ? "bg-white/15"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {category.value === "All"
                ? notes.length
                : notes.filter((note) => note.category === category.value)
                    .length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-linear-to-br from-amber-100 to-orange-100 p-4">
        <p className="text-sm font-semibold text-slate-900">Quick actions</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Create, import, or export notes. Files sync with your account and can
          be shared between devices.
        </p>
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={onCreateNote}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Create note
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isImporting ? "Importing..." : "Import notes"}
          </button>
          <button
            type="button"
            onClick={onExportJson}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            Export as JSON
          </button>
          <button
            type="button"
            onClick={onExportText}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            Export as text
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt,application/json,text/plain"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onImportNotes(file);
            }
            event.currentTarget.value = "";
          }}
        />
      </div>
    </aside>
  );
}
