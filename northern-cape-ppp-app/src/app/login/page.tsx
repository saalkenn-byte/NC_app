import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const adminSecret = (process.env.ADMIN_SECRET || "").trim();
  if (adminSecret && password === adminSecret && email.includes("admin")) {
    await createSession({
      id: 0,
      fullName: "Stelsel Admin",
      email,
      role: "admin",
      organisation: "Noord-Kaap PPP",
    });
    redirect("/admin");
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=Ongeldige+e-posadres+of+wagwoord.+Probeer+asseblief+weer.");
  }

  const role =
    user.role === "admin" || user.role === "verskaffer" ? user.role : "gebruiker";

  await createSession({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role,
    organisation: user.organisation,
  });

  redirect(role === "admin" ? "/admin" : "/");
}

async function registerAction(formData: FormData) {
  "use server";
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const roleInput = String(formData.get("role") || "gebruiker");
  const organisation = String(formData.get("organisation") || "").trim();

  if (!fullName || !email || password.length < 6) {
    redirect(
      "/login?error=Vul+asseblief+alle+verpligte+velde+in+(wagwoord+moet+minstens+6+karakters+wees)."
    );
  }

  const role = roleInput === "verskaffer" ? "verskaffer" : "gebruiker";

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    redirect("/login?error=Hierdie+e-posadres+is+reeds+geregistreer.+Teken+asseblief+in.");
  }

  const [created] = await db
    .insert(users)
    .values({
      fullName,
      email,
      passwordHash: hashPassword(password),
      role,
      organisation,
    })
    .returning();

  await createSession({
    id: created.id,
    fullName: created.fullName,
    email: created.email,
    role,
    organisation: created.organisation,
  });

  redirect("/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Boonste aksentstrook */}
      <div className="h-2 w-full bg-gradient-to-r from-emerald-800 via-teal-600 to-amber-500" />

      <div className="mx-auto flex min-h-[calc(100vh-0.5rem)] max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        {/* Handelsmerk-opskrif */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1 text-sm font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Noord-Kaap Publiek-Private Vennootskap
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Noord-Kaap PPP &amp; Verskaffersportaal
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-300 sm:text-lg">
                Verbind plaaslike ondernemings, KMMO-verskaffers, beleggers en
                werksoekers met grootskaalse energie-, mynbou- en
                infrastruktuurprojekte regoor die Noord-Kaap.
              </p>
            </div>

            {/* Vinnige hoogtepunte */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-80 lg:grid-cols-1">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-semibold text-amber-400">
                  ⚡ Projekgeleenthede
                </p>
                <p className="mt-0.5 text-sm text-slate-300">
                  Sonkrag, groenwaterstof &amp; mynbou-infrastruktuur
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-semibold text-emerald-300">
                  🏢 Geverifieerde Verskaffers
                </p>
                <p className="mt-0.5 text-sm text-slate-300">
                  Direkte toegang tot subkontrakte en tenders
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-semibold text-sky-300">
                  🎓 Opleiding &amp; Werk
                </p>
                <p className="mt-0.5 text-sm text-slate-300">
                  Vakleerlingskappe en streeksaanstellings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Foutboodskap indien iets verkeerd gaan */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-base font-medium text-red-900 shadow-sm">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Twee kolomme: Teken In & Nuwe Rekening */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Links: Bestaande gebruikers */}
          <section className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-md lg:col-span-5 sm:p-8">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-xl font-bold text-emerald-800">
                  🔐
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Teken In</h2>
                  <p className="text-sm text-slate-500">
                    Reeds geregistreer? Gaan voort na jou paneelbord
                  </p>
                </div>
              </div>

              <form action={loginAction} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-base font-semibold text-slate-700">
                    E-posadres
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="naam@voorbeeld.co.za"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 transition focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-base font-semibold text-slate-700">
                    Wagwoord
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Voer jou wagwoord in"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 transition focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-emerald-800 active:scale-[0.99]"
                >
                  Teken In op Portaal →
                </button>
              </form>
            </div>

            <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              <strong className="text-slate-800">Wenk:</strong> Gebruikers,
              verskaffers en administrateurs gebruik dieselfde aanmeldvorm. Die
              stelsel herken outomaties jou rekeningrol.
            </div>
          </section>

          {/* Regs: Nuwe rekening registrasie */}
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-md lg:col-span-7 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl font-bold text-amber-800">
                ✨
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Skep ’n Nuwe Rekening
                </h2>
                <p className="text-sm text-slate-500">
                  Kies jou rol en registreer binne sekondes
                </p>
              </div>
            </div>

            <form action={registerAction} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-base font-semibold text-slate-700">
                  Ek registreer as:
                </label>
                <select
                  name="role"
className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-medium text-slate-900 transition focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
>

👤 Gebruiker / Werksoeker / Belegger


🏭 Verskaffer / Besigheid / KMMO


Volle Naam *
Besigheid / Organisasie
E-posadres *
Kies Wagwoord *
Skep My Rekening





);
}
