import { asc, desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { businesses, opportunities, projects } from "@/db/schema";
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

  const [projectRows, businessRows, opportunityRows] = await Promise.all([
    db
      .select()
      .from(projects)
      .orderBy(desc(projects.featured), asc(projects.title)),
    db.select().from(businesses).orderBy(asc(businesses.name)),
    db.select().from(opportunities).orderBy(asc(opportunities.closingDate)),
  ]);

  const projectData: ProjectRow[] = projectRows.map((row) => ({
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
  }));

  const businessData: BusinessRow[] = businessRows.map((row) => ({
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
  }));

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

