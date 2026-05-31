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
}: HomeSidebarProps) {
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
          Create a note, color it, and assign a category before the backend is
          ready.
        </p>
        <button
          type="button"
          onClick={onCreateNote}
          className="mt-4 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Create note
        </button>
      </div>
    </aside>
  );
}
