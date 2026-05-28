import Logo from "../../../components/ui/Logo";

export function HomeHeader({ onCreateNote }: { onCreateNote: () => void }) {
  return (
    <header className="flex items-center justify-between rounded-[28px] border border-white/60 bg-white/75 px-4 py-3 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Logo className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-black/90 p-1.5 shadow-lg shadow-amber-400/10" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">
            Keepit
          </p>
          <h1 className="text-lg font-semibold text-slate-900">
            Notes that feel quick to capture
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:shadow-md"
          onClick={onCreateNote}
        >
          + New note
        </button>
      </div>
    </header>
  );
}
