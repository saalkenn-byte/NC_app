```tsx
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { LoginClient } from "./login-client";

export const dynamic = "force-dynamic";

type ActionState = {
  error?: string;
  success?: string;
};

async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Vul asseblief beide jou e-posadres en wagwoord in." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Ongeldige e-posadres of wagwoord." };
  }

  if (!user.active) {
    return {
      error: "Jou rekening is tans op onaktief gestel. Kontak die administrateur.",
    };
  }

  await createSession({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as "gebruiker" | "verskaffer" | "admin",
    organisation: user.organisation,
  });

  redirect(user.role === "admin" ? "/admin" : "/");
}

async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server";
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const organisation = String(formData.get("organisation") || "").trim();
  const rawRole = String(formData.get("role") || "gebruiker");
  const role = rawRole === "verskaffer" ? "verskaffer" : "gebruiker";

  if (!fullName || !email || password.length < 6) {
    return { error: "Vul alle velde in (wagwoord moet minstens 6 karakters wees)." };
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { error: "Hierdie e-posadres is reeds geregistreer." };
  }

  const [created] = await db
    .insert(users)
    .values({
      fullName,
      email,
      passwordHash: hashPassword(password),
      role,
      organisation,
      active: true,
      subscriptionPlan: "gratis",
      subscriptionStatus: "aktief",
    })
    .returning();

  await createSession({
    id: created.id,
    fullName: created.fullName,
    email: created.email,
    role: created.role as "gebruiker" | "verskaffer" | "admin",
    organisation: created.organisation,
  });

  redirect("/");
}

async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!email || newPassword.length < 6) {
    return { error: "Voer ’n geldige e-posadres en nuwe wagwoord (min 6 karakters) in." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Die twee wagwoorde stem nie ooreen nie." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return { error: "Geen rekening gevind met daardie e-posadres nie." };
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(newPassword) })
    .where(eq(users.id, user.id));

  return {
    success: "Wagwoord suksesvol opgedateer! Jy kan nou onder 'Teken Aan' inteken.",
  };
}

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return (
    <LoginClient
      loginAction={loginAction}
      registerAction={registerAction}
      resetPasswordAction={resetPasswordAction}
    />
  );
}
