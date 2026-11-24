import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { submissions, users } from "@/db/schema";
import { destroySession, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function logoutAction() {
  "use server";
  await destroySession();
  redirect("/login");
}

async function updateStatus(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") || "nuut");

  await db.update(submissions).set({ status }).where(eq(submissions.id, id));
  revalidatePath("/admin");
}

const badgeColors: Record<string, string> = {
  nuut: "bg-amber-100 text-amber-900 border-amber-300",
  hersien: "bg-sky-100 text-sky-900 border-sky-300",
  gekontak: "bg-purple-100 text-purple-900 border-purple-300",
  goedgekeur: "bg-emerald-100 text-emerald-900 border-emerald-300",
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const [rows, userRows] = await Promise.all([
    db.select().from(submissions).orderBy(desc(submissions.createdAt)),
    db.select().from(users).orderBy(desc(users.createdAt)),
  ]);

  const nuutCount = rows.filter((r) => r.status === "nuut").length;
  const gekontakCount = rows.filter((r) => r.status === "gekontak").length;
  const goedgekeurCount = rows.filter((r) => r.status === "goedgekeur").length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="h-2 w-full bg-gradient-to-r from-emerald-800 via-teal-600 to-amber-500" />

      {/* Donker Kopstuk */}
      <header className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-7 sm:px-6">
          <div>
            <span className="inline-block rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              Admin Beheersentrum
            </span>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Noord-Kaap PPP Bestuurspaneel
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Bestuur indienings, verskaffersaansoeke en geregistreerde lede
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
            >
              ← Terug na Portaal
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400"
              >
                Teken uit
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {/* 4 Statistiek-kaartjies */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Totale Indienings</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">{rows.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-800">Nuut / Wag</p>
            <p className="mt-1 text-3xl font-extrabold text-amber-900">{nuutCount}</p>
          </div>
          <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-5 shadow-sm">
            <p className="text-sm font-medium text-purple-800">Gekontak</p>
            <p className="mt-1 text-3xl font-extrabold text-purple-900">{gekontakCount}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-800">Goedgekeur</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-900">{goedgekeurCount}</p>
          </div>
        </section>

        {/* Indieningslys */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Inkomende Indienings ({rows.length})
          </h2>

          {rows.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-base text-slate-500 shadow-sm">
              Geen indienings is nog ontvang nie.
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                          {item.type}
                        </span>
                        <span
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold uppercase ${
                            badgeColors[item.status] || "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {item.status}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">
                          {item.fullName}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.organisation && <strong>{item.organisation} • </strong>}
                        {item.email}
                        {item.phone ? ` • Tel: ${item.phone}` : ""}
                        {item.referenceLabel ? ` • Verwysing: ${item.referenceLabel}` : ""}
                      </p>
                    </div>

                    <form action={updateStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={item.id} />
                      <select
                        name="status"
                        defaultValue={item.status}
                        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900"
                      >
                        <option value="nuut">Nuut</option>
                        <option value="hersien">Hersien</option>
                        <option value="gekontak">Gekontak</option>
                        <option value="goedgekeur">Goedgekeur</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800"
                      >
                        Stoor
                      </button>
                    </form>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-base text-slate-800">
                    {item.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Geregistreerde Gebruikers & Verskaffers */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Geregistreerde Rekeninge ({userRows.length})
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {userRows.length === 0 ? (
              <p className="p-6 text-base text-slate-500">Nog geen geregistreerde gebruikers nie.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {userRows.map((u) => (
                  <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 p-4 sm:px-6">
                    <div>
                      <p className="text-base font-bold text-slate-900">{u.fullName}</p>
                      <p className="text-sm text-slate-600">
                        {u.email} {u.organisation ? `• ${u.organisation}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-900">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}


