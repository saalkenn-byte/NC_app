import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { opportunities, projects, submissions } from "@/db/schema";

const allowedTypes = new Set(["belegging", "besigheid", "aansoek"]);

function readText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseId(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ons kon nie die vorm lees nie. Probeer asseblief weer." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Ongeldige vormdata." }, { status: 400 });
  }

  const values = payload as Record<string, unknown>;

  // Stille wegdoening van outomatiese inskrywings (bedrogbeperking).
  if (readText(values.website, 200)) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const type = readText(values.type, 40);
  if (!allowedTypes.has(type)) {
    return NextResponse.json({ error: "Onbekende tipe indiening." }, { status: 400 });
  }

  const fullName = readText(values.fullName, 180);
  const email = readText(values.email, 255).toLowerCase();
  const phone = readText(values.phone, 60);
  const organisation = readText(values.organisation, 220);
  const category = readText(values.category, 160);
  const message = readText(values.message, 2000);
  const referenceLabel = readText(values.referenceLabel, 220);

  if (
    fullName.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    message.length < 15 ||
    (type !== "aansoek" && !organisation) ||
    (type === "besigheid" && !category)
  ) {
    return NextResponse.json(
      { error: "Voltooi asseblief al die verpligte velde met geldige inligting." },
      { status: 400 },
    );
  }

  const projectId = parseId(values.projectId);
  const opportunityId = parseId(values.opportunityId);

  if (Number.isNaN(projectId) || Number.isNaN(opportunityId)) {
    return NextResponse.json({ error: "Die gekose verwysing is ongeldig." }, { status: 400 });
  }

  if (projectId !== null) {
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    if (!project) {
      return NextResponse.json({ error: "Die projek is nie meer beskikbaar nie." }, { status: 404 });
    }
  }

  if (opportunityId !== null) {
    const [opportunity] = await db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(eq(opportunities.id, opportunityId))
      .limit(1);
    if (!opportunity) {
      return NextResponse.json({ error: "Die geleentheid is nie meer beskikbaar nie." }, { status: 404 });
    }
  }

  const [created] = await db
    .insert(submissions)
    .values({
      type,
      referenceLabel,
      projectId,
      opportunityId,
      fullName,
      email,
      phone,
      organisation,
      category,
      message,
      status: type === "besigheid" ? "wag op verifikasie" : "nuut",
    })
    .returning({ id: submissions.id });

  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}
