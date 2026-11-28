"use client";

import { useActionState, useState } from "react";

type ActionState = {
  error?: string;
  success?: string;
};

export function LoginClient({
  loginAction,
  registerAction,
  resetPasswordAction,
}: {
  loginAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  registerAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  resetPasswordAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);

  const [loginState, formLoginAction, loginPending] = useActionState(loginAction, {});
  const [registerState, formRegisterAction, registerPending] = useActionState(registerAction, {});
  const [resetState, formResetAction, resetPending] = useActionState(resetPasswordAction, {});

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-900">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-white shadow-2xl">
        <header className="bg-slate-900 px-6 py-7 text-white">
          <span className="inline-block rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold uppercase text-amber-300">
            Boegoebaai • Noord-Kaap PPP
          </span>
          <h1 className="mt-2 text-2xl font-extrabold">Noord-Kaap PPP Portaal</h1>
          <p className="mt-1 text-sm text-slate-300">
            Teken aan, registreer ’n rekening of herstel jou wagwoord
          </p>
        </header>

        <nav className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase">
          <button
            type="button"
            onClick={() => setMode("login")}
            className="flex-1 py-3.5 text-center text-slate-800 hover:bg-white"
          >
            Teken Aan
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className="flex-1 py-3.5 text-center text-slate-800 hover:bg-white"
          >
            Registreer
          </button>
          <button
            type="button"
            onClick={() => setMode("forgot")}
            className="flex-1 py-3.5 text-center text-slate-800 hover:bg-white"
          >
            Wagwoord Vergeet
          </button>
        </nav>

        {mode === "login" && (
          <form action={formLoginAction} className="space-y-4 p-6">
            {loginState.error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {loginState.error}
              </p>
            )}
            <label className="block text-xs font-bold uppercase text-slate-600">
              E-posadres
              <input
                type="email"
                name="email"
                required
                placeholder="naam@voorbeeld.co.za"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Wagwoord
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              {showPassword ? "Versteek wagwoord" : "Wys wagwoord"}
            </button>
            <button
              type="submit"
              disabled={loginPending}
              className="w-full rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white hover:bg-emerald-900"
            >
              {loginPending ? "Besig..." : "Teken Aan"}
            </button>
          </form>
        )}

        {mode === "register" && (
          <form action={formRegisterAction} className="space-y-4 p-6">
            {registerState.error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {registerState.error}
              </p>
            )}
            <label className="block text-xs font-bold uppercase text-slate-600">
              Volle Naam
              <input
                type="text"
                name="fullName"
                required
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold uppercase text-slate-600">
              E-posadres
              <input
                type="email"
                name="email"
                required
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Rekeningtipe
              <select
                name="role"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"
              >
                <option value="gebruiker">Gebruiker / Inwoner</option>
                <option value="verskaffer">Verskaffer / Besigheid</option>
              </select>
            </label>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Organisasie (Opsioneel)
              <input
                type="text"
                name="organisation"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Kies Wagwoord
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              {showPassword ? "Versteek wagwoord" : "Wys wagwoord"}
            </button>
            <button
              type="submit"
              disabled={registerPending}
              className="w-full rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white hover:bg-emerald-900"
            >
              {registerPending ? "Skep rekening..." : "Registreer Rekening"}
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form action={formResetAction} className="space-y-4 p-6">
            {resetState.error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {resetState.error}
              </p>
            )}
            {resetState.success && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {resetState.success}
              </p>
            )}
            <label className="block text-xs font-bold uppercase text-slate-600">
              Geregistreerde E-posadres
              <input
                type="email"
                name="email"
                required
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Nuwe Wagwoord
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                required
                minLength={6}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Bevestig Nuwe Wagwoord
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                required
                minLength={6}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              {showPassword ? "Versteek wagwoord" : "Wys wagwoord"}
            </button>
            <button
              type="submit"
              disabled={resetPending}
              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400"
            >
              {resetPending ? "Herstel..." : "Stoor Nuwe Wagwoord"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
