interface HomeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function HomeSearchBar({ value, onChange }: HomeSearchBarProps) {
  return (
    <label className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm transition focus-within:border-amber-300 focus-within:ring-2 focus-within:ring-amber-200/60">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-slate-400"
      >
        <path
          fill="currentColor"
          d="M10 4a6 6 0 1 0 3.87 10.58l4.77 4.77 1.41-1.41-4.77-4.77A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
        />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search notes by title, content, or category"
        className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
        >
          Clear
        </button>
      )}
    </label>
  );
}
