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

  // 1. Ingeboude Admin-inlog met jou ADMIN_SECRET wagwoord uit Vercel
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

  // 2. Soek gebruiker of verskaffer in Neon
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=Ongeldige+e-pos+of+wagwoord");
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
    redirect("/login?error=Vul+alle+velde+in+(wagwoord+minstens+6+karakters)");
  }

  const role = roleInput === "verskaffer" ? "verskaffer" : "gebruiker";

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    redirect("/login?error=Hierdie+e-posadres+is+reeds+geregistreer");
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
    <main className="mx-auto max-w-4xl p-6 md:py-12">
      <h1 className="mb-2 text-2xl font-bold">Noord-Kaap PPP Portaal</h1>
      <p className="mb-6 text-base text-gray-600">
        Teken in of skep ’n rekening as Gebruiker of Verskaffer om toegang te kry.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-base text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Teken In */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Teken In</h2>
          <form action={loginAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">E-posadres</label>
              <input
                type="email"
                name="email"
                required
                placeholder="naam@voorbeeld.co.za"
                className="w-full rounded border px-3 py-2 text-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Wagwoord</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full rounded border px-3 py-2 text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-emerald-700 px-4 py-2.5 text-base font-semibold text-white hover:bg-emerald-800"
            >
              Teken In
            </button>
          </form>
        </section>

        {/* Registreer */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Nuwe Rekening</h2>
          <form action={registerAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tipe Rekening</label>
              <select
                name="role"
                className="w-full rounded border px-3 py-2 text-base"
              >
                <option value="gebruiker">Gebruiker / Werksoeker / Belegger</option>
                <option value="verskaffer">Verskaffer / Besigheid (KMMO)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Volle Naam</label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="Jan van der Merwe"
                className="w-full rounded border px-3 py-2 text-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Besigheid / Organisasie (opsioneel)
              </label>
              <input
                type="text"
                name="organisation"
                placeholder="bv. Namakwa Dienste (Edms) Bpk"
                className="w-full rounded border px-3 py-2 text-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">E-posadres</label>
              <input
                type="email"
                name="email"
                required
                placeholder="naam@voorbeeld.co.za"
                className="w-full rounded border px-3 py-2 text-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Kies Wagwoord</label>
              <input
                type="password"
                name="password"
                minLength={6}
                required
                placeholder="Minstens 6 karakters"
                className="w-full rounded border px-3 py-2 text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-slate-800 px-4 py-2.5 text-base font-semibold text-white hover:bg-slate-900"
            >
              Registreer
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

