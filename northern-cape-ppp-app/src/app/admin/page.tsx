import { asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { businesses, opportunities, projects, submissions, users } from "@/db/schema";
import { destroySession, getSession, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  return session;
}

async function logoutAction() {
  "use server";
  await destroySession();
  redirect("/login");
}

/* ---- INDIENINGS ---- */
async function updateSubmission(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") || "nuut");
  await db.update(submissions).set({ status }).where(eq(submissions.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}

async function deleteSubmission(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(submissions).where(eq(submissions.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}

/* ---- GEBRUIKERS & SUBSCRIPTIONS ---- */
async function updateUser(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  const role = String(formData.get("role") || "gebruiker");
  const subscriptionPlan = String(formData.get("subscriptionPlan") || "gratis");
  const subscriptionStatus = String(formData.get("subscriptionStatus") || "aktief");
  const active = formData.get("active") === "true";
  const newPassword = String(formData.get("newPassword") || "").trim();

  const updateData: {
    role: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    active: boolean;
    passwordHash?: string;
  } = {
    role,
    subscriptionPlan,
    subscriptionStatus,
    active,
  };

  if (newPassword.length >= 6) {
    updateData.passwordHash = hashPassword(newPassword);
  }

  await db.update(users).set(updateData).where(eq(users.id, id));
  revalidatePath("/admin");
}

async function deleteUser(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = Number(formData.get("id"));
  if (id === session.id) return; // Verhoed dat admin homself per ongeluk uitvee
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin");
}

/* ---- BESIGHEDE / VERSKAFFERS ---- */
async function updateBusiness(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") || "geverifieer");
  await db.update(businesses).set({ status }).where(eq(businesses.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}

async function deleteBusiness(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(businesses).where(eq(businesses.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}

/* ---- PROJEKTE / PRODUKTE ---- */
async function toggleProjectActive(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  const active = formData.get("active") === "true";
  await db.update(projects).set({ active }).where(eq(projects.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}

async function deleteProject(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}

/* ---- VAKATURES / GELEENTHEDE ---- */
async function toggleOpportunityActive(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  const active = formData.get("active") === "true";
  await db.update(opportunities).set({ active }).where(eq(opportunities.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}

async function deleteOpportunity(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(opportunities).where(eq(opportunities.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}

const badgeColors: Record<string, string> = {
  nuut: "bg-amber-100 text-amber-900 border-amber-300",
  hersien: "bg-sky-100 text-sky-900 border-sky-300",
  gekontak: "bg-purple-100 text-purple-900 border-purple-300",
  goedgekeur: "bg-emerald-100 text-emerald-900 border-emerald-300",
};

export default async function AdminPage() {
  const session = await requireAdmin();

  const [rows, userRows, businessRows, projectRows, opportunityRows] = await Promise.all([
    db.select().from(submissions).orderBy(desc(submissions.createdAt)),
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(businesses).orderBy(asc(businesses.name)),
    db.select().from(projects).orderBy(asc(projects.title)),
    db.select().from(opportunities).orderBy(asc(opportunities.title)),
  ]);

  const nuutCount = rows.filter((r) => r.status === "nuut").length;
  const goedgekeurCount = rows.filter((r) => r.status === "goedgekeur").length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="h-2 w-full bg-gradient-to-r from-emerald-800 via-teal-600 to-amber-500" />

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
              Beheer gebruikers, intekeninge, verskaffers, projekte, plasings en statusse
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

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
        {/* Oorsig Statistieke */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">Nuwe Indienings</p>
            <p className="mt-1 text-3xl font-extrabold text-amber-700">{nuutCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">Goedgekeur</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-700">{goedgekeurCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">Gebruikers</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">{userRows.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">Verskaffers</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">{businessRows.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">Projekte & Werk</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">
              {projectRows.length + opportunityRows.length}
            </p>
          </div>
        </section>

        {/* 1. INKOMENDE INDIENINGS */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            1. Inkomende Indienings & Plasings ({rows.length})
          </h2>

          {rows.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Geen indienings is nog ontvang nie.
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold uppercase text-white">
                          {item.type}
                        </span>
                        <span
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold uppercase ${
                            badgeColors[item.status] || "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {item.status}
                        </span>
{item.fullName}
{item.organisation && {item.organisation} • }
{item.email}
{item.phone ?  • Tel: ${item.phone} : ""}
{item.category ?  • Kategorie: ${item.category} : ""}
Nuut
Hersien
Gekontak
Goedgekeur (Publiseer)


Stoor

Delete



{item.message}


))}

)}
{/* 2. GEBRUIKERS & SUBSCRIPTIONS */}
2. Gebruikers & Intekeninge / Subscriptions ({userRows.length})


{userRows.map((u) => (
<div
key={u.id}
className={rounded-2xl border p-5 shadow-sm ${ u.active ? "border-slate-200 bg-white" : "border-red-200 bg-red-50/50" }}
>



{u.fullName}
<span
className={rounded px-2 py-0.5 text-xs font-bold uppercase ${ u.active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800" }}
>
{u.active ? "Aktief" : "Onaktief"}


{u.subscriptionPlan} ({u.subscriptionStatus})

{u.email} {u.organisation ? • ${u.organisation} : ""}
Gebruiker
Verskaffer
Admin
Plan: Gratis
Plan: Standaard
Plan: Pro Verskaffer
Plan: Onderneming
Sub: Aktief
Sub: Agterstallig
Sub: Gekanselleer
Rekening: Aktief
Rekening: Onaktief
Stoor

{u.id !== session.id && (



Delete


)}



))}
{/* 3. VERSKAFFERS & BESIGHEDE */}
3. Verskaffers & Geregistreerde Besighede ({businessRows.length})


{businessRows.map((b) => (



{b.name}
<span
className={rounded px-2 py-0.5 text-xs font-bold uppercase ${ b.status === "onaktief" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800" }}
>
{b.status}

{b.category} • {b.location} • Kontak: {b.contactPerson} ({b.contactEmail})
Aktief / Geverifieer
Onaktief (Versteek)


Stoor

Delete




))}
{/* 4. PROJEKTE / PRODUKTE */}
4. Projekte & Beleggingsprodukte ({projectRows.length})


{projectRows.map((p) => (



{p.title}
<span
className={rounded px-2 py-0.5 text-xs font-bold uppercase ${ p.active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800" }}
>
{p.active ? "Aktief" : "Onaktief"}

{p.category} • {p.location} • {p.investment}
Aktief
Onaktief


Stoor

Delete




))}
{/* 5. VAKATURES & OPLEIDING */}
5. Werk, Kontrakte & Vaardighede ({opportunityRows.length})


{opportunityRows.map((o) => (



{o.title}
<span
className={rounded px-2 py-0.5 text-xs font-bold uppercase ${ o.active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800" }}
>
{o.active ? "Aktief" : "Onaktief"}

{o.employer} • {o.location} • Sluit: {o.closingDate}
Aktief
Onaktief


Stoor

Delete




))}



);
}
