import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/db";
import { submissions } from "@/db/schema";

export const dynamic = "force-dynamic";

async function loginAction(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "").trim();
  const adminSecret = (process.env.ADMIN_SECRET || "").trim();

  if (adminSecret && password === adminSecret) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", adminSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: 60 * 60 * 8, // 8 uur
    });
  }

  revalidatePath("/admin");
}

async function logoutAction() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  revalidatePath("/admin");
}

async function updateStatus(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth")?.value;
  const adminSecret = (process.env.ADMIN_SECRET || "").trim();

  if (!adminSecret || authCookie !== adminSecret) {
    return;
  }

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") || "nuut");

  await db
    .update(submissions)
    .set({ status })
    .where(eq(submissions.id, id));

  revalidatePath("/admin");
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth")?.value;
  const adminSecret = (process.env.ADMIN_SECRET || "").trim();
  const isAuthenticated = Boolean(adminSecret && authCookie === adminSecret);

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="mb-4 text-xl font-bold">Admin Toegang</h1>
        {!adminSecret && (
          <p className="mb-4 rounded bg-amber-100 p-3 text-sm text-amber-900">
            Let wel: ADMIN_SECRET is nog nie in Vercel se omgewingsveranderlikes opgestel nie.
          </p>
        )}
        <form action={loginAction} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Voer admin-wagwoord in"
            required
            className="w-full rounded border px-3 py-2 text-base"
          />
          <button
            type="submit"
            className="w-full rounded bg-emerald-700 px-4 py-2 text-base font-medium text-white"
          >
            Teken in
          </button>
        </form>
      </main>
    );
  }

  const rows = await db
    .select()
    .from(submissions)
    .orderBy(desc(submissions.createdAt));

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Indienings ({rows.length})</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Teken uit
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="text-base text-gray-600">Geen indienings gevind nie.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="mr-2 rounded bg-gray-100 px-2.5 py-1 text-sm font-semibold uppercase">
                    {item.type}
                  </span>
                  <span className="text-lg font-bold">{item.fullName}</span>
                  {item.organisation && (
                    <span className="ml-2 text-base text-gray-600">
                      ({item.organisation})
                    </span>
                  )}
                </div>

                <form action={updateStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={item.id} />
                  <select
                    name="status"
                    defaultValue={item.status}
                    className="rounded border px-3 py-1.5 text-base"
                  >
                    <option value="nuut">Nuut</option>
                    <option value="hersien">Hersien</option>
                    <option value="gekontak">Gekontak</option>
                    <option value="goedgekeur">Goedgekeur</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded bg-emerald-700 px-3 py-1.5 text-base font-medium text-white"
                  >
                    Stoor
                  </button>
                </form>
              </div>

              <p className="mb-2 text-base text-gray-700">
                <strong>E-pos:</strong> {item.email}
                {item.phone ? ` | Tel: ${item.phone}` : ""}
                {item.referenceLabel ? ` | Verwysing: ${item.referenceLabel}` : ""}
              </p>

              <p className="whitespace-pre-line rounded bg-gray-50 p-3 text-base">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

