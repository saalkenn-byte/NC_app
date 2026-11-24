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
    redirect("/login?error=Ongeldige+e-posadres+of+wagwoord");
  }

  const role = user.role === "admin" || user.role === "verskaffer" ? user.role : "gebruiker";
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
  const role = String(formData.get("role")) === "verskaffer" ? "verskaffer" : "gebruiker";
  const organisation = String(formData.get("organisation") || "").trim();

  if (!fullName || !email || password.length < 6) {
    redirect("/login?error=Vul+alle+velde+in+(wagwoord+minstens+6+karakters)");
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    redirect("/login?error=Hierdie+e-posadres+is+reeds+geregistreer");
  }

  const [created] = await db
    .insert(users)
    .values({ fullName, email, passwordHash: hashPassword(password), role, organisation })
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
  const inputStyle =
    "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="h-2 w-full bg-gradient-to-r from-emerald-800 via-teal-600 to-amber-500" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 text-white shadow-xl">
          <span className="inline-block rounded-full bg-emerald-500/20 px-3.5 py-1 text-sm font-semibold text-emerald-300">
            Noord-Kaap Publiek-Private Vennootskap
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Noord-Kaap PPP &amp; Verskaffersportaal
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-300">
            Verbind plaaslike ondernemings, KMMO-verskaffers, beleggers en werksoekers met
            energie-, mynbou- en infrastruktuurprojekte regoor die Noord-Kaap.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-base font-medium text-red-900">
            ⚠️ {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-12">
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-md lg:col-span-5">
            <h2 className="mb-1 text-2xl font-bold">🔐 Teken In</h2>
            <p className="mb-6 text-sm text-slate-500">Gaan voort na jou paneelbord</p>
            <form action={loginAction} className="space-y-4">
              <div>
                <label className="mb-1 block text-base font-semibold">E-posadres</label>
                <input type="email" name="email" required placeholder="naam@voorbeeld.co.za" className={inputStyle} />
              </div>
              <div>
                <label className="mb-1 block text-base font-semibold">Wagwoord</label>
                <input type="password" name="password" required placeholder="••••••••" className={inputStyle} />
              </div>
              <button type="submit" className="w-full rounded-xl bg-emerald-700 py-3.5 text-base font-bold text-white hover:bg-emerald-800">
                Teken In op Portaal →
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-md lg:col-span-7">
            <h2 className="mb-1 text-2xl font-bold">✨ Skep ’n Nuwe Rekening</h2>
            <p className="mb-6 text-sm text-slate-500">Kies jou rol en registreer binne sekondes</p>
            <form action={registerAction} className="space-y-4">
              <div>
                <label className="mb-1 block text-base font-semibold">Ek registreer as:</label>
                <select name="role" className={inputStyle}>
                  <option value="gebruiker">👤 Gebruiker / Werksoeker / Belegger</option>
                  <option value="verskaffer">🏭 Verskaffer / Besigheid / KMMO</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-base font-semibold">Volle Naam *</label>
                  <input type="text" name="fullName" required placeholder="Jan van der Merwe" className={inputStyle} />
                </div>
                <div>
                  <label className="mb-1 block text-base font-semibold">Besigheid / Organisasie</label>
                  <input type="text" name="organisation" placeholder="Namakwa Dienste (Edms) Bpk" className={inputStyle} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-base font-semibold">E-posadres *</label>
                  <input type="email" name="email" required placeholder="naam@voorbeeld.co.za" className={inputStyle} />
                </div>
                <div>
                  <label className="mb-1 block text-base font-semibold">Kies Wagwoord *</label>
                  <input type="password" name="password" minLength={6} required placeholder="Minstens 6 karakters" className={inputStyle} />
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-slate-900 py-3.5 text-base font-bold text-white hover:bg-slate-800">
                Skep My Rekening
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

