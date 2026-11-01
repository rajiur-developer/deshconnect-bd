import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { getUserById } from "@/services/users";
import { formatLocation } from "@/services/locations";
import { formatDate } from "@/lib/utils";
import { AccountShell } from "@/components/layout/account-shell";
import { Badge, Card } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

export const metadata = { title: "My profile", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const full = await getUserById(user.id);
  const locationLabel = await formatLocation(user);

  return (
    <AccountShell user={user} title="My profile" description="Your identity and public profile information on DeshConnect.">
      <div className="relative isolate space-y-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 -z-10 h-64 w-64 rounded-full bg-emerald-200/35 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-12 top-64 -z-10 h-56 w-56 rounded-full bg-teal-100/45 blur-3xl" />

        <Card className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-0 shadow-sm shadow-slate-900/[0.04] backdrop-blur-xl">
          <div className="h-28 bg-[radial-gradient(ellipse_at_15%_0%,rgba(110,231,183,.42),transparent_42%),linear-gradient(115deg,#0b3d2e_0%,#126b4a_52%,#164e63_100%)] sm:h-36" />
          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-11 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <ProfileAvatar name={user.fullName} src={user.avatar} storageKey={user.avatarKey} className="h-24 w-24 border-4 border-white text-2xl shadow-lg shadow-slate-900/10 sm:h-28 sm:w-28" textClassName="text-2xl" />
                <div className="min-w-0 pb-1">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Member profile</p>
                  <h2 className="truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{user.fullName}</h2>
                  <p className="mt-1 truncate text-sm text-slate-500">@{user.username}</p>
                </div>
              </div>
              <Link href="/profile/edit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
                <Icon name="edit" className="h-4 w-4" /> Edit profile
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge tone="brand">{user.role}</Badge>
              {full?.emailVerified && <Badge tone="success"><span className="inline-flex items-center gap-1"><Icon name="check" className="h-3 w-3" /> Email verified</span></Badge>}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                <Icon name="calendar" className="h-3.5 w-3.5 text-slate-400" /> Joined {formatDate(user.createdAt)}
              </span>
            </div>
            {user.bio ? (
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">{user.bio}</p>
            ) : (
              <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-semibold text-slate-800">Add a short introduction</p><p className="mt-1 text-xs text-slate-500">Tell the community a little about yourself.</p></div>
                <Link href="/profile/edit" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900">Complete profile <Icon name="arrow-right" className="h-4 w-4" /></Link>
              </div>
            )}
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.85fr)]">
          <Card className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Personal information</p><h3 className="mt-1 text-lg font-bold text-slate-950">Profile details</h3><p className="mt-1 text-sm text-slate-500">The information visible on your member profile.</p></div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon name="users" className="h-5 w-5" /></span>
            </div>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Icon name="map-pin" className="h-4 w-4 text-emerald-700" /> Location</dt>
                <dd className="mt-2 break-words text-sm font-semibold text-slate-900">{locationLabel ?? "Not set"}</dd>
              </div>
              <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Icon name="calendar" className="h-4 w-4 text-emerald-700" /> Member since</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Icon name="shield" className="h-4 w-4 text-emerald-700" /> Account role</dt>
                <dd className="mt-2 text-sm font-semibold capitalize text-slate-900">{user.role}</dd>
              </div>
              <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Icon name="mail" className="h-4 w-4 text-emerald-700" /> Email status</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">{full?.emailVerified ? "Verified" : "Not verified"}</dd>
              </div>
            </dl>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Account shortcuts</p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">Manage your space</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">Keep your details current and stay connected with the community.</p>
            <div className="mt-5 space-y-2">
              <Link href="/profile/edit" className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50/60">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icon name="edit" className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">Edit profile</span><span className="mt-0.5 block text-xs text-slate-500">Update your personal information</span></span>
                <Icon name="arrow-right" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-700" />
              </Link>
              <Link href="/settings" className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50/60">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Icon name="shield" className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">Account settings</span><span className="mt-0.5 block text-xs text-slate-500">Manage account preferences</span></span>
                <Icon name="arrow-right" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-700" />
              </Link>
              <Link href="/connections" className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50/60">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet-700"><Icon name="users" className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">Connections</span><span className="mt-0.5 block text-xs text-slate-500">View your community network</span></span>
                <Icon name="arrow-right" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-700" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AccountShell>
  );
}
