const session = await getSession();
if (!session || session.role !== "admin") {
  redirect("/login");
}

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { submissions } from "@/db/schema";

export const dynamic = "force-dynamic";

async function updateStatus(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") || "nuut");

  await db
    .update(submissions)
    .set({ status })
    .where(eq(submissions.id, id));

  revalidatePath("/admin");
}

export default async function AdminPage() {
  const rows = await db
    .select()
    .from(submissions)
    .orderBy(desc(submissions.createdAt));

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Indienings ({rows.length})</h1>
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


