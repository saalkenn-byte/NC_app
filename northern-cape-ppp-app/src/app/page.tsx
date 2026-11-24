import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { businesses, opportunities, projects } from "@/db/schema";
import {
  CommunityApp,
  type BusinessRow,
  type OpportunityRow,
  type ProjectRow,
} from "./community-app";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
    <CommunityApp
      projects={projectData}
      businesses={businessData}
      opportunities={opportunityData}
    />
  );
}
