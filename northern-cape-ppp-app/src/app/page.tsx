import { asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { businesses, opportunities, projects, submissions } from "@/db/schema";
import { destroySession, getSession } from "@/lib/auth";
import {
  CommunityApp,
  type BusinessRow,
  type OpportunityRow,
  type ProjectRow,
} from "./community-app";

export const dynamic = "force-dynamic";

async function logoutAction() {
  "use server";
  await destroySession();
  redirect("/login");
}

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [projectRows, businessRows, opportunityRows, approvedSubmissions] =
    await Promise.all([
      db
        .select()
        .from(projects)
        .orderBy(desc(projects.featured), asc(projects.title)),
      db.select().from(businesses).orderBy(asc(businesses.name)),
      db.select().from(opportunities).orderBy(asc(opportunities.closingDate)),
      db
        .select()
        .from(submissions)
        .where(eq(submissions.status, "goedgekeur"))
        .orderBy(desc(submissions.createdAt)),
    ]);

  // Map approved "belegging" submissions into Projekte & beleggings
  const approvedProjectSubmissions: ProjectRow[] = approvedSubmissions
    .filter((sub) => sub.type === "belegging")
    .map((sub) => ({
      id: 100000 + sub.id,
      slug: `plasing-${sub.id}`,
      title: sub.organisation || sub.referenceLabel || sub.fullName,
      category: sub.referenceLabel || "Belegging & Plasing",
      location: "Noord-Kaap / Boegoebaai",
      stage: "Goedgekeurde Plasing",
      timeline: "Aktief",
      investment: "Op aanvraag",
      jobs: 0,
      summary: sub.message,
      description: sub.message,
      requirements: "Geverifieerde indiening via portaal",
      opportunityType: sub.referenceLabel || "Belegging / Vennootskap",
      contactName: sub.fullName,
      contactEmail: sub.email,
      verified: true,
      featured: false,
    }));

  // Map approved "besigheid" submissions into Besigheidsregister
  const approvedBusinessSubmissions: BusinessRow[] = approvedSubmissions
    .filter((sub) => sub.type === "besigheid")
    .map((sub) => ({
      id: 100000 + sub.id,
      name: sub.organisation || sub.fullName,
      category: sub.referenceLabel || "Geregistreerde Verskaffer",
      location: "Noord-Kaap / Boegoebaai",
      entityType: "Geregistreerde Besigheid",
      services: sub.referenceLabel || "Verskaffer & Dienste",
      description: sub.message,
      contactPerson: sub.fullName,
      contactEmail: sub.email,
      phone: sub.phone || "Op aanvraag",
      cipcVerified: true,
      taxVerified: true,
      bbbeeLevel: "Geverifieer",
    }));

  const projectData: ProjectRow[] = [
    ...approvedProjectSubmissions,
    ...projectRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category,
      location: row.location,
      stage: row.stage,
      timeline: row.timeline,
      investment: row.investment,
      jobs: row.jobs,
      summary: row.summary,
      description: row.description,
      requirements: row.requirements,
      opportunityType: row.opportunityType,
      contactName: row.contactName,
      contactEmail: row.contactEmail,
      verified: row.verified,
      featured: row.featured,
    })),
  ];

  const businessData: BusinessRow[] = [
    ...approvedBusinessSubmissions,
    ...businessRows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      location: row.location,
      entityType: row.entityType,
      services: row.services,
      description: row.description,
      contactPerson: row.contactPerson,
      contactEmail: row.contactEmail,
      phone: row.phone,
      cipcVerified: row.cipcVerified,
      taxVerified: row.taxVerified,
      bbbeeLevel: row.bbbeeLevel,
    })),
  ];

  const opportunityData: OpportunityRow[] = opportunityRows.map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    employer: row.employer,
    location: row.location,
    commitment: row.commitment,
    reward: row.reward,
    closingDate: row.closingDate,
    summary: row.summary,
    requirements: row.requirements,
    verified: row.verified,
  }));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-900 px-4 py-2.5 text-sm text-white">
        <div>
          Welkom, <strong>{session.fullName}</strong>{" "}
          <span className="ml-1 rounded bg-emerald-700 px-2 py-0.5 text-xs font-semibold uppercase">
            {session.role}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {session.role === "admin" && (
            <Link
              href="/admin"
              className="rounded bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-amber-400"
            >
              Admin Paneel
            </Link>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded border border-slate-600 px-3 py-1 text-xs hover:bg-slate-800"
            >
              Teken uit
            </button>
          </form>
        </div>
      </div>

      <CommunityApp
        projects={projectData}
        businesses={businessData}
        opportunities={opportunityData}
      />
    </>
  );
}
