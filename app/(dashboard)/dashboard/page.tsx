import { getCurrentProfile } from "@/lib/auth/get-profile";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-1 text-muted-foreground">
          Welcome back, {profile?.full_name}.
        </p>
      </div>
    </main>
  );
}