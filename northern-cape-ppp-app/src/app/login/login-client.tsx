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

  const EyeToggle = () => (
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      aria-label={showPassword ? "Versteek wagwoord" : "Wys wagwoord"}
    >
      {showPassword ? "Versteek" : "Wys"}
    </button>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 px-6 py-7 text-white">
          <span className="inline-block rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300">
            Boegoebaai • Noord-Kaap PPP
          </span>
          <h1 className="mt-2 text-2xl font-extrabold">
            {mode === "login" && "Teken aan op Portaal"}
            {mode === "register" && "Skep Nuwe Rekening"}
            {mode === "forgot" && "Herstel Jou Wagwoord"}
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            {mode === "login" && "Kry toegang tot projekte, besighede en geleenthede"}
            {mode === "register" && "Registreer as inwoner, werksoeker of verskaffer"}
            {mode === "forgot" && "Stel ’n nuwe wagwoord op vir jou bestaande e-posadres"}
          </p>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-3.5 text-center transition ${
              mode === "login"
                ? "border-b-2 border-emerald-700 bg-white text-emerald-800"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Teken Aan
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-3.5 text-center transition ${
              mode === "register"
                ? "border-b-2 border-emerald-700 bg-white text-emerald-800"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Registreer
          </button>
          <button
            type="button"
            onClick={() => setMode("forgot")}
            className={`flex-1 py-3.5 text-center transition ${
              mode === "forgot"
                ? "border-b-2 border-emerald-700 bg-white text-emerald-800"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Wagwoord Vergeet
          </button>
        </div>

        <div className="p-6">
          {/* AANTEKEN */}
          {mode === "login" && (
            <form action={formLoginAction} className="space-y-4">
              {loginState?.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {loginState.error}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                  E-posadres
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="naam@voorbeeld.co.za"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-600">
                    Wagwoord
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Wagwoord vergeet?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-20 text-sm focus:border-emerald-700 focus:outline-none"
                  />
                  <EyeToggle />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginPending}
                className="w-full rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-60"
              >
                {loginPending ? "Besig om aan te teken..." : "Teken Aan"}
              </button>
            </form>
          )}

          {/* REGISTREER */}
          {mode === "register" && (
            <form action={formRegisterAction} className="space-y-4">
              {registerState?.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {registerState.error}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                  Volle Naam
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Jan van der Merwe"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                  E-posadres
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="naam@voorbeeld.co.za"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                    Rekeningtipe
                  </label>
                  <select
                    name="role"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-700 focus:outline-none"
                  >
                    <option value="gebruiker">Gebruiker / Inwoner</option>
                    <option value="verskaffer">Verskaffer / Besigheid</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                    Organisasie (Opsioneel)
                  </label>
                  <input
                    type="text"
                    name="organisation"
                    placeholder="Besigheidsnaam"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                  Kies Wagwoord
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 karakters"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-20 text-sm focus:border-emerald-700 focus:outline-none"
                  />
                  <EyeToggle />
                </div>
              </div>

              <button
                type="submit"
                disabled={registerPending}
                className="w-full rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-60"
              >
                {registerPending ? "Skep rekening..." : "Registreer Rekening"}
              </button>
            </form>
          )}

          {/* WAGWOORD VERGEET */}
          {mode === "forgot" && (
            <form action={formResetAction} className="space-y-4">
              {resetState?.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {resetState.error}
)}
{resetState?.success && (

{resetState.success}

)}
Geregistreerde E-posadres
Nuwe Wagwoord
<input
type={showPassword ? "text" : "password"}
name="newPassword"
required
minLength={6}
placeholder="Nuwe wagwoord (min 6 karakters)"
className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-20 text-sm focus:border-emerald-700 focus:outline-none"
/>


Bevestig Nuwe Wagwoord
<input
type={showPassword ? "text" : "password"}
name="confirmPassword"
required
minLength={6}
placeholder="Tik nuwe wagwoord weer"
className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-20 text-sm focus:border-emerald-700 focus:outline-none"
/>


{resetPending ? "Herstel wagwoord..." : "Stoor Nuwe Wagwoord"}


)}



);
}
