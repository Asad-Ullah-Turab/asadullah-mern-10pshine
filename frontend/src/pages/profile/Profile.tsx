import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import UserContext from "../../store/UserContext";
import {
  deleteAccount as deleteAccountRequest,
  logoutUser,
  updateProfileName,
} from "../../api/auth";

function Profile() {
  const { user, loading, setUser } = useContext(UserContext);
  const [name, setName] = useState(user?.name ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const response = await updateProfileName(name.trim());
    if (response.error) {
      setError(response.error);
    } else if (response.user) {
      setUser(response.user);
      setMessage("Profile updated successfully");
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    setWorking(true);
    setError("");

    const response = await logoutUser();
    setWorking(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    setUser(null);
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account and all of your notes? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setWorking(true);
    setError("");

    const response = await deleteAccountRequest();
    setWorking(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    setUser(null);
    navigate("/signup");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(253,224,71,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.16),transparent_22%),linear-gradient(180deg,#fffaf0_0%,#f8fafc_36%,#eef2ff_100%)] px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(253,224,71,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.16),transparent_22%),linear-gradient(180deg,#fffaf0_0%,#f8fafc_36%,#eef2ff_100%)] px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="space-y-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
              Profile
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Sign in to manage your account
            </h1>
            <Link
              to="/login"
              className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(253,224,71,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.16),transparent_22%),linear-gradient(180deg,#fffaf0_0%,#f8fafc_36%,#eef2ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Profile settings
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900">
                Manage your account
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Update your display name, sign out, or delete the account.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to notes
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-slate-900">Account</h2>
            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-amber-300"
                  placeholder="Your name"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                />
              </label>

              {message && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || working}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save name"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={saving || working}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {working ? "Working..." : "Logout"}
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-[32px] border border-rose-200 bg-rose-50/80 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-500">
              Danger zone
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Delete account
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              This permanently removes your account and all notes from the
              workspace.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={saving || working}
              className="mt-5 rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {working ? "Working..." : "Delete account"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Profile;