import Logo from "../../../components/ui/Logo";
import { useNavigate } from "react-router";
import { HomeSearchBar } from "./HomeSearchBar";

export function HomeHeader({
  onCreateNote,
  searchQuery,
  onSearchChange,
}: {
  onCreateNote: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <header className="rounded-[28px] border border-white/60 bg-white/75 px-4 py-4 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
      </div>

      <div className="mt-4">
        <HomeSearchBar value={searchQuery} onChange={onSearchChange} />
      </div>
    </header>
  );
}
