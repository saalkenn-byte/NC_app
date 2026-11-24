import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/** Nywerheids-, energie-, infrastruktuur- en gemeenskapsprojekte. */
export const projects = pgTable("bb_projects", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  location: varchar("location", { length: 160 }).notNull(),
  stage: varchar("stage", { length: 100 }).notNull(),
  timeline: varchar("timeline", { length: 120 }).notNull(),
  investment: varchar("investment", { length: 120 }).notNull(),
  jobs: integer("jobs").notNull().default(0),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  opportunityType: varchar("opportunity_type", { length: 120 }).notNull(),
  contactName: varchar("contact_name", { length: 160 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  verified: boolean("verified").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Plaaslike ondernemings, koöperasies en diensverskaffers. */
export const businesses = pgTable("bb_businesses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  location: varchar("location", { length: 160 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  services: text("services").notNull(),
  description: text("description").notNull(),
  contactPerson: varchar("contact_person", { length: 160 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 60 }).notNull().default(""),
  cipcVerified: boolean("cipc_verified").notNull().default(false),
  taxVerified: boolean("tax_verified").notNull().default(false),
  bbbeeLevel: varchar("bbbee_level", { length: 60 }).notNull().default(""),
  status: varchar("status", { length: 40 }).notNull().default("geverifieer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Vakatures, korttermynkontrakte, opleiding en vakleerlingskappe. */
export const opportunities = pgTable("bb_opportunities", {
  id: serial("id").primaryKey(),
  kind: varchar("kind", { length: 40 }).notNull(), // werk | kontrak | opleiding
  title: varchar("title", { length: 200 }).notNull(),
  employer: varchar("employer", { length: 200 }).notNull(),
  location: varchar("location", { length: 160 }).notNull(),
  commitment: varchar("commitment", { length: 120 }).notNull(),
  reward: varchar("reward", { length: 120 }).notNull(),
  closingDate: varchar("closing_date", { length: 80 }).notNull(),
  summary: text("summary").notNull(),
  requirements: text("requirements").notNull(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Alle gebruikersindienings: belangstelling, registrasie en aansoeke. */
export const submissions = pgTable("bb_submissions", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 40 }).notNull(), // belegging | besigheid | aansoek
  referenceLabel: varchar("reference_label", { length: 220 }).notNull().default(""),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  opportunityId: integer("opportunity_id").references(() => opportunities.id, {
    onDelete: "set null",
  }),
  fullName: varchar("full_name", { length: 180 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 60 }).notNull().default(""),
  organisation: varchar("organisation", { length: 220 }).notNull().default(""),
  category: varchar("category", { length: 160 }).notNull().default(""),
  message: text("message").notNull(),
  status: varchar("status", { length: 40 }).notNull().default("nuut"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
/** Gebruikers, verskaffers en administrateurs. */
export const users = pgTable("bb_users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 180 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 40 }).notNull().default("gebruiker"), // gebruiker | verskaffer | admin
  organisation: varchar("organisation", { length: 220 }).notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
