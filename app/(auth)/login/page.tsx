"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl border bg-background p-8 shadow-xl sm:p-10 lg:p-12">
          <div className="mb-10 text-center">
            <img
              src="/header.png"
              alt="Visitors Log"
              className="mx-auto h-20 w-auto object-contain sm:h-24 lg:h-28"
            />

            <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back
            </h1>

            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Sign in to manage visitor records.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >
            <div className="space-y-2.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold sm:text-base"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@example.com"
                required
                disabled={loading}
                className="h-13 w-full rounded-xl border bg-background px-4 text-base outline-none transition focus:border-[#0140b2] focus:ring-2 focus:ring-[#0140b2]/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="space-y-2.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold sm:text-base"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
                required
                disabled={loading}
                className="h-13 w-full rounded-xl border bg-background px-4 text-base outline-none transition focus:border-[#0140b2] focus:ring-2 focus:ring-[#0140b2]/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive sm:text-base"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-13 w-full rounded-xl bg-[#0140b2] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#01358f] focus:outline-none focus:ring-2 focus:ring-[#0140b2]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}